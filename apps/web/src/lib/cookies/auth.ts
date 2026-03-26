import { cookies } from "next/headers";
import "server-only";

const SESSION_TOKEN_COOKIE = "session";

/**
 * Get the current session token from the cookie.
 */
export async function getSessionTokenCookie(): Promise<string | null> {
  return (await cookies()).get(SESSION_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Set a session token cookie.
 */
export async function setSessionTokenCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Delete a session token cookie.
 */
export async function deleteSessionTokenCookie() {
  (await cookies()).set(SESSION_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
