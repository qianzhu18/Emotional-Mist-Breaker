import { NextResponse } from "next/server";

import { getSecondMeAuthUrl } from "@/lib/ai";
import { setOAuthStateCookie } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const state = crypto.randomUUID();
    const authUrl = getSecondMeAuthUrl(state);
    const response = NextResponse.redirect(authUrl);
    setOAuthStateCookie(response, state);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法发起SecondMe授权";
    const fallback = new URL(`/?error=${encodeURIComponent(message)}`, request.url);
    return NextResponse.redirect(fallback);
  }
}
