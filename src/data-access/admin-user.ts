import prisma from "@/lib/prisma";
import { cache } from "react";
import "server-only";

/**
 * Check if a user is a platform super admin (AdminUser).
 */
export const isAdminUser = cache(async (userId: string): Promise<boolean> => {
  const record = await prisma.adminUser.findUnique({
    where: { userId },
  });
  return record !== null;
});

/**
 * Promote a user to platform super admin. Idempotent (no-op if already an AdminUser).
 */
export async function createAdminUser(userId: string) {
  return prisma.adminUser.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

/**
 * Remove platform super admin status from a user.
 */
export async function removeAdminUser(userId: string) {
  await prisma.adminUser.deleteMany({
    where: { userId },
  });
}
