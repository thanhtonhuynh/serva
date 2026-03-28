import { prisma } from "@serva/database";
import {
  computeTotalHours,
  distributeTips,
  getStartOfDayUTC,
  type DateRange,
  type DayScheduleInput,
  type WorkDayRecordInput,
} from "@serva/shared";
import { cache } from "react";
import "server-only";
import { workDayRecordSelectWithEmployee } from "./types";

export async function upsertWorkDayRecord(
  date: Date,
  record: WorkDayRecordInput,
  companyId: string,
) {
  const totalHours = computeTotalHours(record.shifts);

  return prisma.workDayRecord.upsert({
    where: { date_employeeId: { date, employeeId: record.employeeId } },
    update: {
      shifts: record.shifts,
      totalHours,
    },
    create: {
      date,
      employeeId: record.employeeId,
      companyId,
      shifts: record.shifts,
      totalHours,
    },
  });
}

/**
 * Replace all WorkDayRecords for a date range atomically.
 * Deletes existing records in the range (scoped to company), then bulk-creates the new ones.
 */
export async function replaceWeekSchedule(
  companyId: string,
  dateRange: DateRange,
  days: DayScheduleInput[],
) {
  const createData = days.flatMap((day) => {
    const date = new Date(day.dateStr + "T00:00:00.000Z");
    return day.records.map((r) => ({
      date,
      employeeId: r.employeeId,
      companyId,
      shifts: r.shifts,
      totalHours: computeTotalHours(r.shifts),
    }));
  });

  await prisma.$transaction([
    prisma.workDayRecord.deleteMany({
      where: { companyId, date: { gte: dateRange.start, lte: dateRange.end } },
    }),
    prisma.workDayRecord.createMany({ data: createData }),
  ]);
}

export async function deleteWorkDayRecord(date: Date, employeeId: string) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart, employeeId },
  });
}

export async function deleteWorkDayRecordsByEmployeeIds(date: Date, employeeIds: string[]) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart, employeeId: { in: employeeIds } },
  });
}

export async function deleteWorkDayRecordsByDate(companyId: string, date: Date) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { companyId, date: dayStart },
  });
}

export const getWorkDayRecordsByDate = cache(async (companyId: string, date: Date) => {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.findMany({
    where: { companyId, date: dayStart },
    select: workDayRecordSelectWithEmployee,
    orderBy: { employee: { identity: { name: "asc" } } },
  });
});

/**
 * Get WorkDayRecords for a date range, with employee → identity relation.
 */
export const getWorkDayRecordsByDateRange = cache(
  async (companyId: string, dateRange: DateRange) => {
    return prisma.workDayRecord.findMany({
      where: {
        companyId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      select: workDayRecordSelectWithEmployee,
      orderBy: [{ date: "asc" }, { employee: { identity: { name: "asc" } } }],
    });
  },
);

export const getWorkDayRecordsByEmployeeAndDateRange = cache(
  async (employeeId: string, dateRange: DateRange) => {
    return prisma.workDayRecord.findMany({
      where: {
        employeeId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      orderBy: { date: "asc" },
    });
  },
);

export const getRecentWorkDayRecordsByEmployee = cache(
  async (employeeId: string, limit: number = 5) => {
    return prisma.workDayRecord.findMany({
      where: { employeeId },
      orderBy: { date: "desc" },
      take: limit,
    });
  },
);

export async function recomputeTipsForDate(companyId: string, date: Date) {
  const dayStart = getStartOfDayUTC(date);

  const [report, workDayRecords] = await Promise.all([
    prisma.saleReport.findUnique({
      where: { companyId, date: dayStart },
      select: { cardTips: true, cashTips: true, extraTips: true },
    }),
    prisma.workDayRecord.findMany({
      where: { companyId, date: dayStart },
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
 */
export async function recomputeTipsForDateRange(companyId: string, dateRange: DateRange) {
  const [reports, workDayRecords] = await Promise.all([
    prisma.saleReport.findMany({
      where: { companyId, date: { gte: dateRange.start, lte: dateRange.end } },
      select: { date: true, cardTips: true, cashTips: true, extraTips: true },
    }),
    prisma.workDayRecord.findMany({
      where: { companyId, date: { gte: dateRange.start, lte: dateRange.end } },
      select: { id: true, date: true, totalHours: true },
    }),
  ]);

  if (reports.length === 0 || workDayRecords.length === 0) return;

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
