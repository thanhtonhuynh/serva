import { workDayRecordSelectWithUser } from "@/data-access/work-day-record/types";
import prisma from "@/lib/prisma";
import type { DayScheduleInput, WorkDayRecordInput } from "@/lib/validations";
import type { DateRange } from "@/types/datetime";
import { getStartOfDayUTC } from "@/utils/datetime";
import { computeTotalHours, distributeTips } from "@/utils/work-day-record";
import { cache } from "react";
import "server-only";

export async function upsertWorkDayRecord(date: Date, record: WorkDayRecordInput) {
  const totalHours = computeTotalHours(record.shifts);

  return prisma.workDayRecord.upsert({
    where: { date_userId: { date, userId: record.userId } },
    update: {
      shifts: record.shifts,
      totalHours,
      note: record.note,
    },
    create: {
      date,
      userId: record.userId,
      shifts: record.shifts,
      totalHours,
      note: record.note,
    },
  });
}

/**
 * Replace all WorkDayRecords for a date range atomically.
 * Deletes existing records in the range, then bulk-creates the new ones.
 */
export async function replaceWeekSchedule(dateRange: DateRange, days: DayScheduleInput[]) {
  const createData = days.flatMap((day) => {
    const date = new Date(day.dateStr + "T00:00:00.000Z");
    return day.records.map((r) => ({
      date,
      userId: r.userId,
      shifts: r.shifts,
      totalHours: computeTotalHours(r.shifts),
      note: r.note ?? null,
    }));
  });

  await prisma.$transaction([
    prisma.workDayRecord.deleteMany({
      where: { date: { gte: dateRange.start, lte: dateRange.end } },
    }),
    prisma.workDayRecord.createMany({ data: createData }),
  ]);
}

export async function deleteWorkDayRecord(date: Date, userId: string) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart, userId },
  });
}

/**
 * Delete many WorkDayRecords for a date by user ids.
 */
export async function deleteWorkDayRecordsByUserIds(date: Date, userIds: string[]) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart, userId: { in: userIds } },
  });
}

export async function deleteWorkDayRecordsByDate(date: Date) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart },
  });
}

export const getWorkDayRecordsByDate = cache(async (date: Date) => {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.findMany({
    where: { date: dayStart },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });
});

/**
 * Get WorkDayRecords for a date range, with user relation.
 * Ordered by date and user's name.
 */
export const getWorkDayRecordsByDateRange = cache(async (dateRange: DateRange) => {
  return prisma.workDayRecord.findMany({
    where: {
      date: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: workDayRecordSelectWithUser,
    orderBy: [{ date: "asc" }, { user: { name: "asc" } }],
  });
});

export const getWorkDayRecordsByUserAndDateRange = cache(
  async (userId: string, dateRange: DateRange) => {
    return prisma.workDayRecord.findMany({
      where: {
        userId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      orderBy: { date: "asc" },
    });
  },
);

/** Get the most recent WorkDayRecords for a user (e.g. for profile recent shifts). */
export const getRecentWorkDayRecordsByUser = cache(async (userId: string, limit: number = 5) => {
  return prisma.workDayRecord.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });
});

export async function recomputeTipsForDate(date: Date) {
  const dayStart = getStartOfDayUTC(date);

  const [report, workDayRecords] = await Promise.all([
    prisma.saleReport.findUnique({
      where: { date: dayStart },
      select: { cardTips: true, cashTips: true, extraTips: true },
    }),
    prisma.workDayRecord.findMany({
      where: { date: dayStart },
      select: { id: true, totalHours: true },
    }),
  ]);

  if (!report || workDayRecords.length === 0) {
    return;
  }

  const totalTipsCents = report.cardTips + report.cashTips + report.extraTips;
  const distribution = distributeTips(workDayRecords, totalTipsCents);

  await Promise.all(
    distribution.map((d) =>
      prisma.workDayRecord.update({
        where: { id: d.id },
        data: { tips: d.tips },
      }),
    ),
  );
}

/**
 * Recompute tips for all dates in a range.
 * Fetches all reports and records for the range in 2 queries, then batch-updates tips.
 */
export async function recomputeTipsForDateRange(dateRange: DateRange) {
  const [reports, workDayRecords] = await Promise.all([
    prisma.saleReport.findMany({
      where: { date: { gte: dateRange.start, lte: dateRange.end } },
      select: { date: true, cardTips: true, cashTips: true, extraTips: true },
    }),
    prisma.workDayRecord.findMany({
      where: { date: { gte: dateRange.start, lte: dateRange.end } },
      select: { id: true, date: true, totalHours: true },
    }),
  ]);

  if (reports.length === 0 || workDayRecords.length === 0) return;

  // id: the work day record id
  // tips: the tips for the work day record
  const updates: { id: string; tips: number }[] = [];

  for (const report of reports) {
    const dayTime = report.date.getTime();
    const dayRecords = workDayRecords.filter((r) => r.date.getTime() === dayTime);
    if (dayRecords.length === 0) continue;

    const totalTipsCents = report.cardTips + report.cashTips + report.extraTips;
    const distribution = distributeTips(dayRecords, totalTipsCents);
    updates.push(...distribution);
  }

  if (updates.length === 0) return;

  await prisma.$transaction(
    updates.map((d) =>
      prisma.workDayRecord.update({ where: { id: d.id }, data: { tips: d.tips } }),
    ),
  );
}
