import {
  GOOGLE_OAUTH_CODE_VERIFIER_COOKIE,
  GOOGLE_OAUTH_INTENT_COOKIE,
  GOOGLE_OAUTH_INTENT_LINK,
  GOOGLE_OAUTH_INVITE_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  createGoogleOAuthClient,
  oauthPkceCookieOptions,
} from "@/lib/google-oauth";
import { authenticatedRateLimit } from "@serva/auth";
import { getCurrentSession } from "@serva/auth/session";
import { getAuthUrl, getWebUrl } from "@serva/shared";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SETTINGS_PATH = `/settings`;

export async function GET() {
  const { session, identity } = await getCurrentSession();
  if (!session || !identity) {
    return NextResponse.redirect(new URL("/login", getAuthUrl()));
  }

  if (await authenticatedRateLimit(identity.id)) {
    return NextResponse.redirect(
      new URL(`${SETTINGS_PATH}?google=link_error&reason=rate_limited`, getWebUrl()),
    );
  }

  let google;
  try {
    google = createGoogleOAuthClient();
  } catch {
    return NextResponse.redirect(
      new URL(`${SETTINGS_PATH}?google=link_error&reason=config`, getWebUrl()),
    );
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authorizationUrl = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "email",
    "profile",
  ]);
  authorizationUrl.searchParams.set("login_hint", identity.email);

  const cookieStore = await cookies();
  const opts = oauthPkceCookieOptions();
  cookieStore.set(GOOGLE_OAUTH_INTENT_COOKIE, GOOGLE_OAUTH_INTENT_LINK, opts);
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, opts);
  cookieStore.set(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, opts);
  cookieStore.set(GOOGLE_OAUTH_INVITE_COOKIE, "", { ...oauthPkceCookieOptions(), maxAge: 0 });

  return NextResponse.redirect(authorizationUrl);
}
