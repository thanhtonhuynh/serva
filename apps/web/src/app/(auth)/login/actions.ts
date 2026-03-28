"use server";

import { verifyPassword } from "@/lib/auth/password";
import { createSession, generateSessionToken } from "@/lib/auth/session";
import { setCompanyIdCookie, setSessionTokenCookie } from "@/lib/cookies";
import { consumeInviteForIdentity } from "@/lib/invite";
import { getIdentityByEmail, getIdentityPasswordHash } from "@serva/database";
import { redirect } from "next/navigation";
// import {
//   getUserEmailVerificationRequestByUserId,
//   setEmailVerificationRequestCookie,
// } from '@/lib/email-verification';
import { LoginInputs, LoginSchema } from "@/lib/validations/auth";
import { rateLimitByKey, unauthenticatedRateLimit } from "@/utils/rate-limiter";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function loginAction(data: LoginInputs) {
  try {
    if (await unauthenticatedRateLimit()) {
      return { error: "Too many requests. Please try again later." };
    }

    const { email, password, inviteToken } = LoginSchema.parse(data);

    if (await rateLimitByKey({ key: email, limit: 3, interval: 10000 })) {
      return { error: "Too many requests. Please try again later." };
    }

    const existingIdentity = await getIdentityByEmail(email);
    if (!existingIdentity) {
      return { error: "Invalid email or password" };
    }

    const passwordHash = await getIdentityPasswordHash(existingIdentity.id);
    if (!passwordHash) {
      return { error: "Invalid email or password" };
    }

    const validPassword = await verifyPassword(passwordHash, password);
    if (!validPassword) {
      return { error: "Invalid email or password" };
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingIdentity.id, {
      twoFactorVerified: false,
    });
    await setSessionTokenCookie(sessionToken, session.expiresAt);

    if (inviteToken) {
      const consume = await consumeInviteForIdentity(
        inviteToken,
        existingIdentity.id,
        existingIdentity.email,
      );
      if (consume.error) return { error: consume.error };
      await setCompanyIdCookie(consume.invite.companyId);
    }

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
    return { error: "Login failed. Please try again." };
  }

  redirect("/");
}
