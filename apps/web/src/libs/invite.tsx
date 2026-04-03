import { InviteEmail } from "@serva/serva-ui";
import { render } from "@react-email/components";
import { sendEmail } from "./email";

export const INVITE_TTL_DAYS = 7;

export function generateInviteToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

export function getInviteExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + INVITE_TTL_DAYS);
  return d;
}

export async function sendInviteEmail(params: {
  to: string;
  inviterName: string;
  companyName: string;
  profileType: "employee" | "operator";
  token: string;
  /** Name entered on the invite form, used in the welcome line. */
  inviteeName?: string | null;
}) {
  const emailHtml = await render(
    <InviteEmail
      inviterName={params.inviterName}
      companyName={params.companyName}
      profileType={params.profileType}
      inviteeName={params.inviteeName ?? undefined}
      token={params.token}
      expiresInDays={INVITE_TTL_DAYS}
    />,
  );

  await sendEmail({
    to: params.to,
    subject: `You're invited to ${params.companyName} on Serva`,
    html: emailHtml,
  });
}
