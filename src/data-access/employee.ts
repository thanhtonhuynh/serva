import prisma from "@/lib/prisma";
import { cache } from "react";
import "server-only";

// Get employees with optional status filter
export const getEmployees = cache(
  async ({ status, excludeAdmin }: { status?: string; excludeAdmin?: boolean }) => {
    return prisma.user.findMany({
      where: {
        accountStatus: status,
        // Exclude platform super admins (AdminUser) from team list
        adminUser: null,
        ...(excludeAdmin && { role: { NOT: { name: "Admin" } } }),
      },
      include: {
        role: {
          select: { id: true, name: true, permissions: { select: { code: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
  },
);

// Get employess' info by IDs
export const getEmployeesByIds = cache(async (userIds: string[]) => {
  return prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, username: true },
  });
});
