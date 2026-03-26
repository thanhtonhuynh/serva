import { getInviteByToken, markInviteAccepted } from "@/data-access/invite";
import prisma from "@/lib/prisma";
import { sendEmail } from "./email";

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
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl.replace(/\/$/, "")}/invite/${params.token}`;
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

export async function consumeInviteForIdentity(
  token: string,
  identityId: string,
  identityEmail: string,
) {
  const invite = await getInviteByToken(token);
  if (!invite) {
    return { error: "Invite not found." as const };
  }
  if (invite.status !== "awaiting") {
    return { error: "Invite is no longer valid." as const };
  }
  if (invite.expiresAt.getTime() <= Date.now()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    return { error: "Invite has expired." as const };
  }
  if (invite.email.toLowerCase() !== identityEmail.toLowerCase()) {
    return { error: "Invite email does not match your account email." as const };
  }

  if (invite.profileType === "operator") {
    const existing = await prisma.operator.findFirst({
      where: { identityId, companyId: invite.companyId },
      select: { id: true },
    });
    if (!existing) {
      await prisma.operator.create({
        data: {
          identityId,
          companyId: invite.companyId,
          roleId: invite.roleId ?? null,
          status: "active",
        },
      });
    }
  } else {
    const existing = await prisma.employee.findFirst({
      where: { identityId, companyId: invite.companyId },
      select: { id: true },
    });
    if (!existing) {
      await prisma.employee.create({
        data: {
          identityId,
          companyId: invite.companyId,
          jobId: invite.jobId ?? null,
          status: "active",
        },
      });
    }
  }

  await markInviteAccepted(invite.id);
  return { invite, error: null as null };
}
