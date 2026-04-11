"use server";

import {
  consumeInviteForIdentity,
  createIdentity,
  getIdentityByEmail,
  getInviteByToken,
} from "@serva/database/dal";
import { redirect } from "next/navigation";
// import {
//   sendVerificationEmail,
//   setEmailVerificationRequestCookie,
//   upsertEmailVerificationRequest,
// } from '@/lib/email-verification';
import { setCompanyIdCookie, setSessionTokenCookie } from "@serva/auth/cookies";
import { rateLimitByIp, unauthenticatedRateLimit } from "@serva/auth/rate-limiter";
import { createSession, generateSessionToken } from "@serva/auth/session";
import { SignupInputs, SignupSchema } from "@serva/shared";
import { getAppBaseUrl } from "@serva/shared/config";

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
  redirect(getAppBaseUrl("serva-hub"));
}
