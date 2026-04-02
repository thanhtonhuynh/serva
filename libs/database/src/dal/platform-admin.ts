import { prisma } from "@serva/database";
import { cache } from "react";
import "server-only";

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export const listAllCompanies = cache(async () => {
  return prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      _count: { select: { operators: true, employees: true } },
    },
    orderBy: { name: "asc" },
  });
});

export const getCompanyAdminDetail = cache(async (companyId: string) => {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      settings: true,
      operators: {
        include: {
          identity: { select: { id: true, name: true, email: true } },
          role: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      employees: {
        include: {
          identity: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      roles: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      jobs: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      invites: {
        where: { status: "awaiting" },
        select: { id: true, name: true, email: true, profileType: true, status: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
});

export async function createCompany(name: string, slug: string) {
  return prisma.company.create({ data: { name, slug } });
}

export async function updateCompany(companyId: string, data: { name: string; slug: string }) {
  return prisma.company.update({ where: { id: companyId }, data });
}

// ---------------------------------------------------------------------------
// Identities
// ---------------------------------------------------------------------------

export const listAllIdentities = cache(async () => {
  return prisma.identity.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      accountStatus: true,
      createdAt: true,
      adminUser: { select: { id: true } },
      _count: { select: { operators: true, employees: true } },
    },
    orderBy: { name: "asc" },
  });
});

export const getIdentityAdminDetail = cache(async (identityId: string) => {
  return prisma.identity.findUnique({
    where: { id: identityId },
    include: {
      adminUser: true,
      operators: {
        include: {
          company: { select: { id: true, name: true, slug: true } },
          role: { select: { id: true, name: true } },
        },
      },
      employees: {
        include: {
          company: { select: { id: true, name: true, slug: true } },
          job: { select: { id: true, name: true } },
        },
      },
    },
  });
});
