import {
  setPasswordResetTokenCookie,
  validatePasswordResetRequest,
} from "@/lib/auth/password-reset";
import { redirect } from "next/navigation";

type Params = Promise<{ token: string }>;

export async function GET(req: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { token } = params;

  const passwordResetToken = await validatePasswordResetRequest(token);

  if (!passwordResetToken)
    redirect("/login/forgot-password?resetLinkExpired=true");

  await setPasswordResetTokenCookie(token, passwordResetToken.expiresAt);

  redirect("/reset-password");
}
