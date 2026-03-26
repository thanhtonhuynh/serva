import prisma from "@/lib/prisma";
import { cache } from "react";
import "server-only";

/**
 * Get all employees for a company, with identity and job relations.
 */
export const getEmployeesByCompany = cache(async (companyId: string, status?: string) => {
  return prisma.employee.findMany({
    where: { companyId, ...(status ? { status } : {}) },
    include: {
      identity: { select: { name: true, email: true, image: true } },
      job: { select: { id: true, name: true } },
    },
    orderBy: { identity: { name: "asc" } },
  });
});

/**
 * Get a single employee by identity + company (current user lookup).
 */
export const getEmployeeByIdentityAndCompany = cache(
  async (identityId: string, companyId: string) => {
    return prisma.employee.findFirst({
      where: { identityId, companyId },
      include: {
        identity: { select: { name: true, email: true, image: true } },
        job: { select: { id: true, name: true } },
      },
    });
  },
);

/**
 * Get a single employee by ID.
 */
export const getEmployeeById = cache(async (id: string) => {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      identity: { select: { name: true, email: true, image: true } },
      job: { select: { id: true, name: true } },
    },
  });
});

/**
 * Get basic identity info for multiple employees by their identity IDs.
 * Used for audit log expansion in reports.
 */
export const getIdentitiesByIds = cache(async (identityIds: string[]) => {
  return prisma.identity.findMany({
    where: { id: { in: identityIds } },
    select: { id: true, name: true, image: true, email: true },
  });
});
