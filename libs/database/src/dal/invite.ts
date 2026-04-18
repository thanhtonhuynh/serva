import { prisma } from "@serva/database";
import { cache } from "react";
import "server-only";

export const getAwaitingInvitesByCompanyAndType = cache(
  async (companyId: string, profileType: "employee" | "operator") => {
    return prisma.invite.findMany({
      where: { companyId, profileType, status: "awaiting" },
      include: {
        role: { select: { id: true, name: true } },
        job: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
);

export async function createInvite(data: {
  companyId: string;
  name: string;
  email: string;
  profileType: "employee" | "operator";
  token: string;
  expiresAt: Date;
  roleId?: string;
  jobId?: string;
}) {
  return prisma.invite.create({
    data: {
      companyId: data.companyId,
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      profileType: data.profileType,
      token: data.token,
      expiresAt: data.expiresAt,
      roleId: data.roleId,
      jobId: data.jobId,
      status: "awaiting",
    },
  });
}

export async function getInviteByToken(token: string) {
  return prisma.invite.findUnique({
    where: { token },
    include: {
      company: { select: { id: true, name: true, slug: true } },
      role: { select: { id: true, name: true } },
      job: { select: { id: true, name: true } },
    },
  });
}

export async function markInviteAccepted(inviteId: string) {
  return prisma.invite.update({
    where: { id: inviteId },
    data: { status: "accepted", acceptedAt: new Date() },
  });
}

export async function revokeInviteById(inviteId: string, companyId: string) {
  return prisma.invite.updateMany({
    where: { id: inviteId, companyId, status: "awaiting" },
    data: { status: "revoked" },
  });
}

export async function deleteInviteById(inviteId: string, companyId: string) {
  return prisma.invite.deleteMany({
    where: { id: inviteId, companyId },
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
