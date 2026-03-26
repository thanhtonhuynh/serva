import prisma from "@/lib/prisma";
import { cache } from "react";
import "server-only";

/**
 * Get all operators for a company, with identity and role relations.
 */
export const getOperatorsByCompany = cache(async (companyId: string, status?: string) => {
  return prisma.operator.findMany({
    where: { companyId, ...(status ? { status } : {}) },
    include: {
      identity: { select: { name: true, email: true, image: true } },
      role: { select: { id: true, name: true, permissions: { select: { code: true } } } },
    },
    orderBy: { identity: { name: "asc" } },
  });
});

/**
 * Get a single operator by identity + company (current user lookup).
 */
export const getOperatorByIdentityAndCompany = cache(
  async (identityId: string, companyId: string) => {
    return prisma.operator.findFirst({
      where: { identityId, companyId },
      include: {
        identity: { select: { name: true, email: true, image: true } },
        role: { select: { id: true, name: true, permissions: { select: { code: true } } } },
      },
    });
  },
);

/**
 * Get a single operator by ID.
 */
export const getOperatorById = cache(async (id: string) => {
  return prisma.operator.findUnique({
    where: { id },
    include: {
      identity: { select: { name: true, email: true, image: true } },
      role: { select: { id: true, name: true, permissions: { select: { code: true } } } },
    },
  });
});

/**
 * Set RBAC role for an operator in a company (Admin / Manager, etc.).
 */
export async function updateOperatorRole(
  identityId: string,
  companyId: string,
  roleId: string,
): Promise<{ count: number }> {
  return prisma.operator.updateMany({
    where: { identityId, companyId },
    data: { roleId },
  });
}
