import { NextResponse } from "next/server";

import { exchangeCodeForAccessToken, fetchSecondMeProfile } from "@/lib/ai";
import {
  OAUTH_STATE_COOKIE_NAME,
  readOAuthStateCookie,
  setSessionCookie,
} from "@/lib/auth";
import { upsertUser } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    const redirect = new URL(`/?error=${encodeURIComponent(error)}`, request.url);
    return NextResponse.redirect(redirect);
  }

  if (!code) {
    const redirect = new URL("/?error=授权失败，缺少code", request.url);
    return NextResponse.redirect(redirect);
  }

  try {
    const cookieState = await readOAuthStateCookie();

    if (!cookieState || !state || state !== cookieState) {
      throw new Error("OAuth状态校验失败，请重新登录");
    }

    const accessToken = await exchangeCodeForAccessToken(code);
    const profile = await fetchSecondMeProfile(accessToken);

    const user = await upsertUser({
      secondme_user_id: profile.secondmeUserId,
      access_token: accessToken,
      ai_id: profile.aiId,
      ai_name: profile.aiName,
      ai_personality: profile.aiPersonality,
      ai_avatar: profile.avatar,
    });

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setSessionCookie(response, user.id);
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "授权回调处理失败";
    const redirect = new URL(`/?error=${encodeURIComponent(message)}`, request.url);
    return NextResponse.redirect(redirect);
  }
}
