import { getAuthUrl } from "@serva/shared";
import { sendEmail } from "@serva/shared/helpers/email";

const INVITE_TTL_DAYS = 7;

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
}) {
  const inviteUrl = `${getAuthUrl().replace(/\/$/, "")}/invite/${params.token}`;
  const title = params.profileType === "employee" ? "Employee" : "Operator";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>You're invited to ${params.companyName}</h2>
      <p>${params.inviterName} invited you as an <strong>${title}</strong> on Serva.</p>
      <p>Click below to accept your invite:</p>
      <p><a href="${inviteUrl}" style="display:inline-block;background:#1f6feb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">Accept Invite</a></p>
      <p>Or open this URL: ${inviteUrl}</p>
      <p>This link expires in ${INVITE_TTL_DAYS} days.</p>
    </div>
  `;

  await sendEmail({
    to: params.to,
    subject: `You're invited to ${params.companyName} on Serva`,
    html,
  });
}

