import type { OAuthAccountTokens } from "@serva/database/dal";
import { getAuthUrl } from "@serva/shared";
import { Google, type OAuth2Tokens } from "arctic";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE = "google_oauth_code_verifier";
export const GOOGLE_OAUTH_INVITE_COOKIE = "google_oauth_invite";
export const GOOGLE_OAUTH_INTENT_COOKIE = "google_oauth_intent";

export const GOOGLE_OAUTH_INTENT_SIGNIN = "signin" as const;
export const GOOGLE_OAUTH_INTENT_LINK = "link" as const;
export type GoogleOAuthIntentValue =
  | typeof GOOGLE_OAUTH_INTENT_SIGNIN
  | typeof GOOGLE_OAUTH_INTENT_LINK;

const OAUTH_COOKIE_MAX_AGE_SEC = 60 * 10;

export function getGoogleOAuthRedirectUri(): string {
  return `${getAuthUrl()}/login/google/callback`;
}

export function createGoogleOAuthClient(): Google {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId?.trim() || !clientSecret?.trim()) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }
  return new Google(clientId.trim(), clientSecret.trim(), getGoogleOAuthRedirectUri());
}

export type OauthPkceCookieOptions = {
  path: string;
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
  domain?: string;
};

export function oauthPkceCookieOptions(): OauthPkceCookieOptions {
  const domain = process.env.COOKIE_DOMAIN;
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
    ...(domain && { domain }),
  };
}

export function clearOAuthPkceCookies(
  setCookie: (name: string, value: string, options: OauthPkceCookieOptions) => void,
) {
  const cleared = { ...oauthPkceCookieOptions(), maxAge: 0 };
  setCookie(GOOGLE_OAUTH_STATE_COOKIE, "", cleared);
  setCookie(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE, "", cleared);
  setCookie(GOOGLE_OAUTH_INVITE_COOKIE, "", cleared);
  setCookie(GOOGLE_OAUTH_INTENT_COOKIE, "", cleared);
}

export function oauthTokensFromArctic(tokens: OAuth2Tokens): OAuthAccountTokens {
  const scope = tokens.hasScopes() ? tokens.scopes().join(" ") : null;
  return {
    accessToken: tokens.accessToken(),
    refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
    refreshTokenExpiresAt: null,
    scope,
    idToken: tokens.idToken(),
  };
}

export type GoogleIdTokenClaims = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
};

export function parseGoogleIdTokenClaims(raw: object): GoogleIdTokenClaims | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const sub = typeof o.sub === "string" ? o.sub : null;
  const email = typeof o.email === "string" ? o.email.trim() : null;
  if (!sub || !email) return null;

  const ev = o.email_verified;
  const emailVerified = ev === true || ev === "true";

  let name = typeof o.name === "string" ? o.name.trim() : "";
  if (!name) {
    name = email.includes("@") ? email.split("@")[0]! : email;
  }

  const picture = typeof o.picture === "string" && o.picture.trim() ? o.picture.trim() : undefined;

  return { sub, email, emailVerified, name, picture };
}
