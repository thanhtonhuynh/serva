import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { prisma } from "@serva/database";
import { cookies } from "next/headers";

const PASSWORD_RESET_TOKEN_TTL = 1000 * 60 * 30; // 30 minutes
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
// const PASSWORD_RESET_TOKEN_TTL = 3000; // 3 seconds

export function generatePasswordResetToken() {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes);
  return token;
}

export async function invalidatePasswordResetToken(identityId: string) {
  await prisma.passwordResetToken.deleteMany({ where: { identityId } });
}

export async function createPasswordResetToken(identityId: string, token: string) {
  const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  await prisma.passwordResetToken.create({
    data: {
      identityId,
      tokenHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL),
    },
  });
}

export async function setPasswordResetTokenCookie(token: string, expiresAt: Date) {
  (await cookies()).set("pw-reset", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  });
}

export async function deletePasswordResetTokenCookie() {
  (await cookies()).set("pw-reset", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  });
}

export async function validatePasswordResetRequest(token: string) {
  const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const passwordResetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (passwordResetToken && passwordResetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { tokenHash } });
    return null;
  }

  return passwordResetToken;
}
