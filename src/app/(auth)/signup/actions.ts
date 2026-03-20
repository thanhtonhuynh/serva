"use server";

import { createIdentity, getIdentityByEmail, getIdentityByUsername } from "@/data-access/user";
import { redirect } from "next/navigation";
// import {
//   sendVerificationEmail,
//   setEmailVerificationRequestCookie,
//   upsertEmailVerificationRequest,
// } from '@/lib/email-verification';
import { createSession, generateSessionToken } from "@/lib/auth/session";
import { setSessionTokenCookie } from "@/lib/cookies";
import { SignupSchema, SignupSchemaTypes } from "@/lib/validations/auth";
import { rateLimitByIp, unauthenticatedRateLimit } from "@/utils/rate-limiter";

export async function signUpAction(data: SignupSchemaTypes) {
  try {
    if (
      (await unauthenticatedRateLimit()) ||
      (await rateLimitByIp({ key: "signup", limit: 3, interval: 30000 }))
    ) {
      return { error: "Too many requests. Please try again later." };
    }

    const { name, username, email, password } = SignupSchema.parse(data);

    const existingEmail = await getIdentityByEmail(email);
    if (existingEmail) {
      return { error: "Email already in use" };
    }

    const existingUsername = await getIdentityByUsername(username);
    if (existingUsername) {
      return { error: "Username already in use" };
    }

    const identity = await createIdentity(name, username, email, password);

    // const emailVerificationRequest = await upsertEmailVerificationRequest(
    //   user.id,
    //   user.email
    // );

    // sendVerificationEmail(user.email, emailVerificationRequest.code);

    // setEmailVerificationRequestCookie(emailVerificationRequest);

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, identity.id, {
      twoFactorVerified: false,
    });
    await setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (error) {
    console.error(error);
    return { error: "Signup failed. Please try again." };
  }

  // redirect(`/verify-email`);
  redirect(`/`);
}
