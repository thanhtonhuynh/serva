"use server";

import ResetPasswordEmail from "@/components/emails/ResetPasswordEmail";
import {
  createPasswordResetToken,
  generatePasswordResetToken,
  invalidatePasswordResetToken,
} from "@serva/auth/password-reset";
import { sendEmail } from "@/lib/email";
import { ForgotPasswordSchema, ForgotPasswordSchemaTypes } from "@/lib/validations/auth";
import { rateLimitByKey, unauthenticatedRateLimit } from "@serva/auth/rate-limiter";
import { render } from "@react-email/components";
import { getIdentityByEmail } from "@serva/database";

export async function forgotPasswordAction(data: ForgotPasswordSchemaTypes) {
  try {
    if (await unauthenticatedRateLimit()) {
      return { error: "Too many requests. Please try again later." };
    }

    const { email } = ForgotPasswordSchema.parse(data);

    if (await rateLimitByKey({ key: email, limit: 1, interval: 60000 })) {
      return {
        error: "You can only request a password reset once per minute.",
      };
    }

    const identity = await getIdentityByEmail(email);
    if (!identity) return { success: true };

    await invalidatePasswordResetToken(identity.id);

    const token = generatePasswordResetToken();

    await createPasswordResetToken(identity.id, token);

    const emailHtml = await render(<ResetPasswordEmail identity={identity} token={token} />);

    await sendEmail({
      to: email,
      subject: "Reset password request",
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    return { error: "Something went wrong. Please try again." };
  }
}
