import prisma from "@/lib/prisma";
import { cache } from "react";
import "server-only";

/**
 * Check if an identity is a platform super admin (AdminUser).
 */
export const isAdminUser = cache(async (identityId: string): Promise<boolean> => {
  const record = await prisma.adminUser.findUnique({
    where: { identityId },
  });
  return record !== null;
});

/**
 * Promote an identity to platform super admin. Idempotent (no-op if already an AdminUser).
 */
export async function createAdminUser(identityId: string) {
  return prisma.adminUser.upsert({
    where: { identityId },
    create: { identityId },
    update: {},
  });
}

/**
 * Remove platform super admin status from an identity.
 */
export async function removeAdminUser(identityId: string) {
  await prisma.adminUser.delete({
    where: { identityId },
  });
}
