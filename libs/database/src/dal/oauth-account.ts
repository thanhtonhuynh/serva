import { prisma } from "@serva/database";
import "server-only";

export const OAUTH_PROVIDER_GOOGLE = "google" as const;

export type OAuthAccountTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  idToken?: string | null;
};

export async function findOAuthAccountByProviderAndAccountId(
  providerId: string,
  accountId: string,
) {
  return prisma.account.findUnique({
    where: { providerId_accountId: { providerId, accountId } },
    include: { identity: true },
  });
}

export async function findGoogleOAuthAccountByIdentityId(identityId: string) {
  return prisma.account.findFirst({
    where: { identityId, providerId: OAUTH_PROVIDER_GOOGLE },
  });
}

export async function createOAuthAccount(
  identityId: string,
  providerId: string,
  providerAccountId: string,
  tokens: OAuthAccountTokens,
) {
  return prisma.account.create({
    data: {
      identityId,
      providerId,
      accountId: providerAccountId,
      accessToken: tokens.accessToken ?? null,
      refreshToken: tokens.refreshToken ?? null,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt ?? null,
      scope: tokens.scope ?? null,
      idToken: tokens.idToken ?? null,
      password: null,
    },
  });
}

export async function updateOAuthAccountTokens(
  oauthAccountRowId: string,
  tokens: OAuthAccountTokens,
) {
  return prisma.account.update({
    where: { id: oauthAccountRowId },
    data: {
      accessToken: tokens.accessToken ?? null,
      refreshToken: tokens.refreshToken ?? null,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt ?? null,
      scope: tokens.scope ?? null,
      idToken: tokens.idToken ?? null,
    },
  });
}
