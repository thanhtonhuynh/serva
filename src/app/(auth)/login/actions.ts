"use server";

import { getIdentityByEmailOrUsername, getIdentityPasswordHash } from "@/data-access/user";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, generateSessionToken } from "@/lib/auth/session";
import { setSessionTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
// import {
//   getUserEmailVerificationRequestByUserId,
//   setEmailVerificationRequestCookie,
// } from '@/lib/email-verification';
import { LoginSchema, LoginSchemaTypes } from "@/lib/validations/auth";
import { rateLimitByKey, unauthenticatedRateLimit } from "@/utils/rate-limiter";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function loginAction(data: LoginSchemaTypes) {
  try {
    if (await unauthenticatedRateLimit()) {
      return { error: "Too many requests. Please try again later." };
    }

    const { identifier, password } = LoginSchema.parse(data);

    if (await rateLimitByKey({ key: identifier, limit: 3, interval: 10000 })) {
      return { error: "Too many requests. Please try again later." };
    }

    const existingIdentity = await getIdentityByEmailOrUsername(identifier);
    if (!existingIdentity) {
      return { error: "Invalid email, username, or password" };
    }

    const passwordHash = await getIdentityPasswordHash(existingIdentity.id);
    if (!passwordHash) {
      return { error: "Invalid email, username, or password" };
    }

    const validPassword = await verifyPassword(passwordHash, password);
    if (!validPassword) {
      return { error: "Invalid email, username, or password" };
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingIdentity.id, {
      twoFactorVerified: false,
    });
    await setSessionTokenCookie(sessionToken, session.expiresAt);

    // if (!existingUser.emailVerified) {
    //   const emailVerificationRequest =
    //     await getUserEmailVerificationRequestByUserId(existingUser.id);

    //   if (emailVerificationRequest) {
    //     setEmailVerificationRequestCookie(emailVerificationRequest);
    //   }

    //   redirect(`/verify-email`);
    // }

    // if (existingUser.twoFactorEnabled) {
    //   redirect(`/2fa`);
    // }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(error);
    return { error: "Login failed. Please try again." };
  }

  redirect("/");
}
