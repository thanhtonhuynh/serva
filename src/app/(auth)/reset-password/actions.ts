"use server";

import { updateIdentity, updateIdentityPassword } from "@/data-access/user";
import {
  deletePasswordResetTokenCookie,
  invalidatePasswordResetToken,
  validatePasswordResetRequest,
} from "@/lib/auth/password-reset";
import { invalidateIdentitySessions } from "@/lib/auth/session";
import { ResetPasswordSchema, ResetPasswordSchemaTypes } from "@/lib/validations/auth";
import { rateLimitByIp, unauthenticatedRateLimit } from "@/utils/rate-limiter";
import { cookies } from "next/headers";

export async function resetPasswordAction(data: ResetPasswordSchemaTypes) {
  try {
    if (
      (await unauthenticatedRateLimit()) ||
      (await rateLimitByIp({
        key: "reset-password",
        limit: 2,
        interval: 30000,
      }))
    ) {
      return { error: "Too many requests. Please try again later." };
    }

    const token = (await cookies()).get("pw-reset")?.value || "";

    const pwResetToken = await validatePasswordResetRequest(token);

    if (pwResetToken) await invalidatePasswordResetToken(pwResetToken.identityId);

    if (!pwResetToken) {
      return { error: "Invalid or expired token" };
    }

    const { password, logOutOtherDevices } = ResetPasswordSchema.parse(data);

    if (logOutOtherDevices) {
      await invalidateIdentitySessions(pwResetToken.identityId);
    }

    await updateIdentityPassword(pwResetToken.identityId, password);

    await updateIdentity(pwResetToken.identityId, { emailVerified: true });

    await deletePasswordResetTokenCookie();

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}
