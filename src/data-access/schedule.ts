import prisma from "@/lib/prisma";
import type { DayRange } from "@/types";
import { cache } from "react";
import "server-only";

/** Start of day UTC for a given date (date at 00:00:00.000Z) */
function startOfDayUTC(d: Date): Date {
  const d2 = new Date(d);
  d2.setUTCHours(0, 0, 0, 0);
  return d2;
}

/** Get all ScheduleDay documents in a date range (uses unique index on date). */
export const getScheduleDaysByDateRangeUTC = cache(async (dateRangeUTC: DayRange) => {
  const start = dateRangeUTC.start;
  const end = dateRangeUTC.end;

  return prisma.scheduleDay.findMany({
    where: {
      date: { gte: start, lte: end }, // UTC
    },
    orderBy: { date: "asc" },
  });
});

/** Get a single ScheduleDay by date, or null if none. */
export const getScheduleDayByDate = cache(async (date: Date) => {
  const dayStart = startOfDayUTC(date);
  return prisma.scheduleDay.findUnique({
    where: { date: dayStart },
  });
});

/** Collect all unique userIds from one or more ScheduleDays and fetch User records; return a map for display (Option 1). */
export async function getScheduleUserMap(
  days: { entries: { userId: string }[] } | { entries: { userId: string }[] }[],
): Promise<Map<string, { id: string; name: string; image: string | null; username: string }>> {
  const dayArray = Array.isArray(days) ? days : [days];
  const userIds = [...new Set(dayArray.flatMap((d) => d.entries.map((e) => e.userId)))].filter(
    Boolean,
  );

  if (userIds.length === 0) {
    return new Map();
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, username: true },
  });

  return new Map(
    users.map((u) => [
      u.id,
      {
        id: u.id,
        name: u.name,
        image: u.image,
        username: u.username,
      },
    ]),
  );
}

/** Slot shape for schedule entries. */
export type ScheduleSlotInput = {
  startMinutes: number;
  endMinutes: number;
  note?: string | null;
};

/** Day entry shape for upsert (matches Prisma DayEntry embedded type). */
export type DayEntryInput = {
  userId: string;
  slots: ScheduleSlotInput[];
  note?: string | null;
};

/** Create or update the ScheduleDay for a given date. Replaces entries for that day. */
export async function upsertScheduleDay(date: Date, entries: DayEntryInput[]) {
  const dayStart = startOfDayUTC(date);

  return prisma.scheduleDay.upsert({
    where: { date: dayStart },
    update: { entries },
    create: {
      date: dayStart,
      entries,
    },
  });
}

/** Remove the ScheduleDay for a given date if it exists (e.g. when all entries are removed). */
export async function deleteScheduleDay(date: Date) {
  const dayStart = startOfDayUTC(date);
  return prisma.scheduleDay.deleteMany({
    where: { date: dayStart },
  });
}
