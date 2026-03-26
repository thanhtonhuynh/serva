import prisma from "@/lib/prisma";
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
  roleId?: string | null;
  jobId?: string | null;
}) {
  return prisma.invite.create({
    data: {
      companyId: data.companyId,
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      profileType: data.profileType,
      token: data.token,
      expiresAt: data.expiresAt,
      roleId: data.roleId ?? null,
      jobId: data.jobId ?? null,
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
