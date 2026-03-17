import prisma from "@/lib/prisma";
import type { DayScheduleInput, WorkDayRecordInput } from "@/lib/validations";
import type { DateRange } from "@/types/datetime";
import { getStartOfDayUTC } from "@/utils/datetime";
import { computeTotalHours, distributeTips } from "@/utils/work-day-record";
import { cache } from "react";
import "server-only";
import { workDayRecordSelectWithIdentity } from "./types";

export async function upsertWorkDayRecord(date: Date, record: WorkDayRecordInput) {
  const totalHours = computeTotalHours(record.shifts);

  return prisma.workDayRecord.upsert({
    where: { date_identityId: { date, identityId: record.identityId } },
    update: {
      shifts: record.shifts,
      totalHours,
    },
    create: {
      date,
      identityId: record.identityId,
      shifts: record.shifts,
      totalHours,
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
      identityId: r.identityId,
      shifts: r.shifts,
      totalHours: computeTotalHours(r.shifts),
    }));
  });

  await prisma.$transaction([
    prisma.workDayRecord.deleteMany({
      where: { date: { gte: dateRange.start, lte: dateRange.end } },
    }),
    prisma.workDayRecord.createMany({ data: createData }),
  ]);
}

export async function deleteWorkDayRecord(date: Date, identityId: string) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart, identityId },
  });
}

/**
 * Delete many WorkDayRecords for a date by identity ids.
 */
export async function deleteWorkDayRecordsByIdentityIds(date: Date, identityIds: string[]) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart, identityId: { in: identityIds } },
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
    include: { identity: true },
    orderBy: { identity: { name: "asc" } },
  });
});

/**
 * Get WorkDayRecords for a date range, with identity relation.
 * Ordered by date and identity's name.
 */
export const getWorkDayRecordsByDateRange = cache(async (dateRange: DateRange) => {
  return prisma.workDayRecord.findMany({
    where: {
      date: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: workDayRecordSelectWithIdentity,
    orderBy: [{ date: "asc" }, { identity: { name: "asc" } }],
  });
});

export const getWorkDayRecordsByIdentityAndDateRange = cache(
  async (identityId: string, dateRange: DateRange) => {
    return prisma.workDayRecord.findMany({
      where: {
        identityId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      orderBy: { date: "asc" },
    });
  },
);

/** Get the most recent WorkDayRecords for an identity (e.g. for profile recent shifts). */
export const getRecentWorkDayRecordsByIdentity = cache(
  async (identityId: string, limit: number = 5) => {
    return prisma.workDayRecord.findMany({
      where: { identityId },
      orderBy: { date: "desc" },
      take: limit,
    });
  },
);

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
