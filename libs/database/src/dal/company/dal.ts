import { prisma } from "@serva/database";
import type { BasicCompany } from "@serva/shared";
import { cache } from "react";
import "server-only";

/**
 * Get all companies an identity belongs to
 * by finding companies where the identity has either operator or employee accounts or both.
 */
export const getCompaniesByIdentityId = cache(
  async (identityId: string): Promise<BasicCompany[]> => {
    return prisma.company.findMany({
      where: {
        OR: [{ operators: { some: { identityId } } }, { employees: { some: { identityId } } }],
      },
      select: { id: true, name: true, slug: true },
    });
  },
);

export const getCompanyById = cache(async (companyId: string) => {
  return prisma.company.findUnique({
    where: { id: companyId },
  });
});

export const getCompanyBySlug = cache(async (slug: string) => {
  return prisma.company.findUnique({
    where: { slug },
  });
});
