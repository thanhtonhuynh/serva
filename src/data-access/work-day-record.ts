import prisma from "@/lib/prisma";
import { DayRange } from "@/types";
import { getStartOfDayUTC } from "@/utils/datetime";
import { computeTotalHours, distributeTips } from "@/utils/work-day-record";
import type { WorkShift } from "@prisma/client";
import { cache } from "react";
import "server-only";

export async function upsertWorkDayRecord(
  date: Date,
  userId: string,
  shifts: WorkShift[],
  note?: string | null,
) {
  const dayStart = getStartOfDayUTC(date);
  const totalHours = computeTotalHours(shifts);

  return prisma.workDayRecord.upsert({
    where: { date_userId: { date: dayStart, userId } },
    update: {
      shifts,
      totalHours,
      note: note ?? undefined,
    },
    create: {
      date: dayStart,
      userId,
      shifts,
      totalHours,
      note: note ?? undefined,
    },
  });
}

export async function deleteWorkDayRecord(date: Date, userId: string) {
  const dayStart = getStartOfDayUTC(date);
  return prisma.workDayRecord.deleteMany({
    where: { date: dayStart, userId },
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

export const getWorkDayRecordsByDateRange = cache(async (dateRange: DayRange) => {
  return prisma.workDayRecord.findMany({
    where: {
      date: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    include: { user: true },
    orderBy: [{ date: "asc" }, { user: { name: "asc" } }],
  });
});

export const getWorkDayRecordsByUserAndDateRange = cache(
  async (userId: string, dateRange: DayRange) => {
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
