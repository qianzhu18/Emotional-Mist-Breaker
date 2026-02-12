import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserById } from "@/lib/store";
import type { UserRecord } from "@/types/domain";

export const SESSION_COOKIE_NAME = "efb_session";
export const OAUTH_STATE_COOKIE_NAME = "efb_oauth_state";

export async function getCurrentUser(): Promise<UserRecord | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return getUserById(sessionCookie.value);
}

export function setSessionCookie(response: NextResponse, userId: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
}

export function setOAuthStateCookie(response: NextResponse, state: string): void {
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
}

export async function readOAuthStateCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value ?? null;
}
