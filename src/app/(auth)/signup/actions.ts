"use server";

import { createIdentity, getIdentityByEmail } from "@/data-access/identity";
import { getInviteByToken } from "@/data-access/invite";
import { redirect } from "next/navigation";
// import {
//   sendVerificationEmail,
//   setEmailVerificationRequestCookie,
//   upsertEmailVerificationRequest,
// } from '@/lib/email-verification';
import { createSession, generateSessionToken } from "@/lib/auth/session";
import { setCompanyIdCookie, setSessionTokenCookie } from "@/lib/cookies";
import { consumeInviteForIdentity } from "@/lib/invite";
import { SignupInputs, SignupSchema } from "@/lib/validations/auth";
import { rateLimitByIp, unauthenticatedRateLimit } from "@/utils/rate-limiter";

export async function signUpAction(data: SignupInputs) {
  try {
    if (
      (await unauthenticatedRateLimit()) ||
      (await rateLimitByIp({ key: "signup", limit: 3, interval: 30000 }))
    ) {
      return { error: "Too many requests. Please try again later." };
    }

    const { name, email, password, inviteToken } = SignupSchema.parse(data);

    if (inviteToken) {
      const invite = await getInviteByToken(inviteToken);
      if (!invite) return { error: "Invite not found." };
      if (invite.status !== "awaiting") return { error: "Invite is no longer valid." };
      if (invite.expiresAt.getTime() <= Date.now()) return { error: "Invite has expired." };
      if (invite.email.toLowerCase() !== email.toLowerCase()) {
        return { error: "You must sign up with the invited email address." };
      }
    }

    const existingEmail = await getIdentityByEmail(email);
    if (existingEmail) {
      return { error: "Email already in use" };
    }

    const identity = await createIdentity(name, email, password);

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

    if (inviteToken) {
      const consume = await consumeInviteForIdentity(inviteToken, identity.id, identity.email);
      if (consume.error) return { error: consume.error };
      await setCompanyIdCookie(consume.invite.companyId);
    }
  } catch (error) {
    return { error: "Signup failed. Please try again." };
  }

  // redirect(`/verify-email`);
  redirect(`/`);
}
