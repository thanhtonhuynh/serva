import prisma from "@/lib/prisma";
import { DayRange, Shift } from "@/types";
import { cache } from "react";
import "server-only";
import {
  getRecentWorkDayRecordsByUser,
  getWorkDayRecordsByDateRange,
  getWorkDayRecordsByUserAndDateRange,
} from "./work-day-record/dal";

/** @deprecated Use getWorkDayRecordsByUserAndDateRange from work-day-record and map to UserShift[] if needed. */
export const getUserShiftsInDateRange = cache(async (userId: string, dateRange: DayRange) => {
  const records = await getWorkDayRecordsByUserAndDateRange(userId, dateRange);
  return records.map((r) => ({
    date: r.date,
    hours: r.totalHours,
    tips: r.tips,
  }));
});

// Get employees with optional status filter and hidden from reports filter
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

// Fetch all shifts in a date range
/** @deprecated Use getWorkDayRecordsByDateRange from work-day-record; use getHoursTipsBreakdownInDateRange with those records for admin hours&tips. */
export const getShiftsInDateRange = cache(async (dateRange: DayRange) => {
  const records = await getWorkDayRecordsByDateRange(dateRange);
  return records.map((r) => ({
    userId: r.userId,
    userName: r.user.name,
    userUsername: r.user.username,
    userImage: r.user.image ?? "",
    date: r.date,
    hours: r.totalHours,
    tips: r.tips,
  })) as Shift[];
});

// Get employess' info by IDs
export const getEmployeesByIds = cache(async (userIds: string[]) => {
  return prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, username: true },
  });
});

// Get recent shifts for a user (most recent first)
/** @deprecated Use getRecentWorkDayRecordsByUser from work-day-record and map to { date, hours, tips }[]. */
export const getRecentShiftsByUser = cache(async (userId: string, limit: number = 5) => {
  const records = await getRecentWorkDayRecordsByUser(userId, limit);
  return records.map((r) => ({
    date: r.date,
    hours: r.totalHours,
    tips: r.tips,
  }));
});
