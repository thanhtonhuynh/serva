import {
  GOOGLE_OAUTH_CODE_VERIFIER_COOKIE,
  GOOGLE_OAUTH_INTENT_COOKIE,
  GOOGLE_OAUTH_INTENT_SIGNIN,
  GOOGLE_OAUTH_INVITE_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  createGoogleOAuthClient,
  oauthPkceCookieOptions,
} from "@/lib/google-oauth";
import { rateLimitByIp, unauthenticatedRateLimit } from "@serva/auth/rate-limiter";
import { getInviteByToken } from "@serva/database/dal";
import { getAuthUrl } from "@serva/shared";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (
    (await unauthenticatedRateLimit()) ||
    (await rateLimitByIp({ key: "google-oauth-start", limit: 20, interval: 60_000 }))
  ) {
    return NextResponse.redirect(new URL("/login?error=rate_limited", getAuthUrl()));
  }

  let google;
  try {
    google = createGoogleOAuthClient();
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_config", getAuthUrl()));
  }

  const reqUrl = new URL(request.url);
  const invite = reqUrl.searchParams.get("invite");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authorizationUrl = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "email",
    "profile",
  ]);

  if (invite?.trim()) {
    const inv = await getInviteByToken(invite.trim());
    if (inv && inv.status === "awaiting" && inv.expiresAt.getTime() > Date.now()) {
      authorizationUrl.searchParams.set("login_hint", inv.email);
    }
  }

  const cookieStore = await cookies();
  const opts = oauthPkceCookieOptions();
  cookieStore.set(GOOGLE_OAUTH_INTENT_COOKIE, GOOGLE_OAUTH_INTENT_SIGNIN, opts);
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, opts);
  cookieStore.set(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, opts);
  if (invite?.trim()) {
    cookieStore.set(GOOGLE_OAUTH_INVITE_COOKIE, invite.trim(), opts);
  } else {
    cookieStore.set(GOOGLE_OAUTH_INVITE_COOKIE, "", { ...oauthPkceCookieOptions(), maxAge: 0 });
  }

  return NextResponse.redirect(authorizationUrl);
}
