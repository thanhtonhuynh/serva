import { parseCallbackUrl } from "@/lib/callback-url-parser";
import {
  GOOGLE_OAUTH_CALLBACK_URL_COOKIE,
  GOOGLE_OAUTH_CODE_VERIFIER_COOKIE,
  GOOGLE_OAUTH_INTENT_COOKIE,
  GOOGLE_OAUTH_INTENT_LINK,
  GOOGLE_OAUTH_INTENT_SIGNIN,
  GOOGLE_OAUTH_INVITE_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  clearOAuthPkceCookies,
  createGoogleOAuthClient,
  oauthTokensFromArctic,
  parseGoogleIdTokenClaims,
} from "@/lib/google-oauth";
import {
  deleteSessionTokenCookie,
  setCompanyIdCookie,
  setSessionTokenCookie,
} from "@serva/auth/cookies";
import { rateLimitByIp, unauthenticatedRateLimit } from "@serva/auth/rate-limiter";
import {
  createSession,
  generateSessionToken,
  getCurrentSession,
  invalidateSession,
} from "@serva/auth/session";
import {
  OAUTH_PROVIDER_GOOGLE,
  applyOAuthProfilePictureIfEmpty,
  consumeInviteForIdentity,
  createOAuthAccount,
  findGoogleOAuthAccountByIdentityId,
  findIdentityByEmailForOAuth,
  findOAuthAccountByProviderAndAccountId,
  updateOAuthAccountTokens,
} from "@serva/database/dal";
import { getAuthUrl, getWebUrl } from "@serva/shared";
import { decodeIdToken } from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function redirectToLogin(error: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, getAuthUrl()));
}

function redirectToWebSettings(query: string) {
  return NextResponse.redirect(new URL(`/settings?${query}`, getWebUrl()));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function GET(request: Request) {
  const cookieStore = await cookies();

  if (
    (await unauthenticatedRateLimit()) ||
    (await rateLimitByIp({ key: "google-oauth-callback", limit: 20, interval: 60_000 }))
  ) {
    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    return redirectToLogin("rate_limited");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value ?? null;
  const codeVerifier = cookieStore.get(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE)?.value ?? null;
  const inviteTokenRaw = cookieStore.get(GOOGLE_OAUTH_INVITE_COOKIE)?.value ?? null;
  const inviteToken = inviteTokenRaw?.trim() ? inviteTokenRaw.trim() : null;
  const intentRaw =
    cookieStore.get(GOOGLE_OAUTH_INTENT_COOKIE)?.value ?? GOOGLE_OAUTH_INTENT_SIGNIN;
  const intent =
    intentRaw === GOOGLE_OAUTH_INTENT_LINK ? GOOGLE_OAUTH_INTENT_LINK : GOOGLE_OAUTH_INTENT_SIGNIN;

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    return intent === GOOGLE_OAUTH_INTENT_LINK
      ? redirectToWebSettings("google=link_error&reason=invalid")
      : redirectToLogin("oauth_invalid");
  }

  let google;
  try {
    google = createGoogleOAuthClient();
  } catch {
    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    return intent === GOOGLE_OAUTH_INTENT_LINK
      ? redirectToWebSettings("google=link_error&reason=config")
      : redirectToLogin("oauth_config");
  }

  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    return intent === GOOGLE_OAUTH_INTENT_LINK
      ? redirectToWebSettings("google=link_error&reason=token")
      : redirectToLogin("oauth_token");
  }

  let idTokenRaw: string;
  try {
    idTokenRaw = tokens.idToken();
  } catch {
    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    return intent === GOOGLE_OAUTH_INTENT_LINK
      ? redirectToWebSettings("google=link_error&reason=no_id_token")
      : redirectToLogin("oauth_no_id_token");
  }

  const rawClaims = decodeIdToken(idTokenRaw);
  const claims = parseGoogleIdTokenClaims(rawClaims);
  if (!claims?.emailVerified) {
    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    return intent === GOOGLE_OAUTH_INTENT_LINK
      ? redirectToWebSettings("google=link_error&reason=unverified_email")
      : redirectToLogin("oauth_unverified_email");
  }

  const oauthAccountTokens = oauthTokensFromArctic(tokens);

  if (intent === GOOGLE_OAUTH_INTENT_LINK) {
    const { session, identity } = await getCurrentSession();
    if (!session || !identity) {
      clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
      return redirectToLogin("oauth_link_session");
    }

    if (normalizeEmail(claims.email) !== normalizeEmail(identity.email)) {
      clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
      return redirectToWebSettings("google=link_error&reason=email_mismatch");
    }

    const existingBySub = await findOAuthAccountByProviderAndAccountId(
      OAUTH_PROVIDER_GOOGLE,
      claims.sub,
    );

    if (existingBySub) {
      if (existingBySub.identityId !== identity.id) {
        clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
        return redirectToWebSettings("google=link_error&reason=account_in_use");
      }
      await updateOAuthAccountTokens(existingBySub.id, oauthAccountTokens);
      await applyOAuthProfilePictureIfEmpty(identity.id, identity.image, claims.picture);
    } else {
      const otherGoogle = await findGoogleOAuthAccountByIdentityId(identity.id);
      if (otherGoogle && otherGoogle.accountId !== claims.sub) {
        clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
        return redirectToWebSettings("google=link_error&reason=already_linked");
      }
      await createOAuthAccount(identity.id, OAUTH_PROVIDER_GOOGLE, claims.sub, oauthAccountTokens);
      await applyOAuthProfilePictureIfEmpty(identity.id, identity.image, claims.picture);
    }

    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    return redirectToWebSettings("google=linked");
  }

  const existingOauth = await findOAuthAccountByProviderAndAccountId(
    OAUTH_PROVIDER_GOOGLE,
    claims.sub,
  );
  if (!existingOauth) {
    clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));
    const existingIdentity = await findIdentityByEmailForOAuth(claims.email);
    if (existingIdentity) {
      return redirectToLogin("oauth_link_required");
    }
    return redirectToLogin("oauth_signup_required");
  }

  await updateOAuthAccountTokens(existingOauth.id, oauthAccountTokens);
  await applyOAuthProfilePictureIfEmpty(
    existingOauth.identity.id,
    existingOauth.identity.image,
    claims.picture,
  );
  const identityId = existingOauth.identity.id;
  const identityEmail = existingOauth.identity.email;

  const callbackUrlCookie = cookieStore.get(GOOGLE_OAUTH_CALLBACK_URL_COOKIE)?.value ?? null;

  clearOAuthPkceCookies(cookieStore.set.bind(cookieStore));

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, identityId, { twoFactorVerified: false });
  await setSessionTokenCookie(sessionToken, session.expiresAt);

  if (inviteToken) {
    const consume = await consumeInviteForIdentity(inviteToken, identityId, identityEmail);
    if (consume.error) {
      await invalidateSession(session.id);
      await deleteSessionTokenCookie();
      return redirectToLogin("invite");
    }
    await setCompanyIdCookie(consume.invite.companyId);
    return NextResponse.redirect(getWebUrl());
  }

  return NextResponse.redirect(parseCallbackUrl(callbackUrlCookie) ?? getWebUrl());
}
