import { PLATFORM_ID_TO_LEGACY_FIELD } from "@/constants/platforms";
import prisma from "@/lib/prisma";
import { toCents } from "@/lib/utils";
import { SaleReportInputs } from "@/lib/validations/report";
import { DayRange, SaleReportCardRawData } from "@/types";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import "server-only";
import { getEmployeesByIds } from "./employee";
import { getStartCash } from "./store";
import { getWorkDayRecordsByDate, recomputeTipsForDate } from "./work-day-record";

// Get recent reports submitted by a user
export const getRecentReportsByUser = cache(async (userId: string, limit: number = 5) => {
  const reports = await prisma.saleReport.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
    select: {
      id: true,
      date: true,
      totalSales: true,
    },
  });

  return reports;
});

// Upsert a report
export async function upsertReport(data: SaleReportInputs, userId: string) {
  const { cardTips, cashTips, extraTips, date, platformSales, ...raw } = data;

  // Convert platform sales to cents and build the new platformSales array
  const platformSalesInCents = platformSales.map((ps) => ({
    platformId: ps.platformId,
    amount: toCents(ps.amount),
  }));

  // Build legacy columns from platformSales for backward compatibility
  const legacyPlatformData = {
    uberEatsSales: 0,
    doorDashSales: 0,
    skipTheDishesSales: 0,
    onlineSales: 0, // This is Ritual
  };
  for (const ps of platformSalesInCents) {
    const legacyField = PLATFORM_ID_TO_LEGACY_FIELD[ps.platformId];
    if (legacyField && legacyField in legacyPlatformData) {
      legacyPlatformData[legacyField as keyof typeof legacyPlatformData] = ps.amount;
    }
  }

  // Convert all money values to cents
  const reportDataInCents = {
    totalSales: toCents(raw.totalSales),
    cardSales: toCents(raw.cardSales),
    ...legacyPlatformData,
    platformSales: platformSalesInCents,
    expenses: toCents(raw.expenses),
    cashInTill: toCents(raw.cashInTill),
    cardTips: toCents(cardTips),
    cashTips: toCents(cashTips),
    extraTips: toCents(extraTips),
  };

  const startCash = await getStartCash();

  const existingReport = await prisma.saleReport.findUnique({
    where: { date },
    select: { id: true, auditLogs: true },
  });

  const auditLogs = existingReport?.auditLogs ?? [];

  const report = existingReport
    ? await prisma.saleReport.update({
        where: { id: existingReport.id },
        data: {
          startCash,
          expensesReason: raw.expensesReason,
          ...reportDataInCents,
          shifts: { set: [] },
          auditLogs: [
            ...auditLogs,
            {
              userId,
              timestamp: new Date(),
            },
          ],
        },
      })
    : await prisma.saleReport.create({
        data: {
          date,
          userId,
          startCash,
          expensesReason: raw.expensesReason,
          ...reportDataInCents,
          shifts: [],
          auditLogs: [],
        },
      });

  await recomputeTipsForDate(date);

  const workDayRecords = await getWorkDayRecordsByDate(date);
  const noWorkDayRecordsWarning = workDayRecords.length === 0;

  return { report, noWorkDayRecordsWarning };
}

// Check if a report exists by id
export const reportExists = cache(async (id: string) => {
  const report = await prisma.saleReport.findUnique({
    where: { id },
    select: { id: true },
  });

  return !!report;
});

// Get report raw data by unique input
export const getReportRaw = cache(
  async (where: Prisma.SaleReportWhereUniqueInput): Promise<SaleReportCardRawData | null> => {
    const report = await prisma.saleReport.findUnique({
      where,
      include: {
        reporter: { select: { name: true, image: true, username: true } },
      },
      omit: { shifts: true },
    });

    if (!report) return null;

    // Collect userIds from shifts and edit logs
    const userIds = [
      // ...report.shifts.map((shift) => shift.userId),
      ...(report.auditLogs ?? []).map((log) => log.userId),
    ];

    // Get user info for those userIds
    const users = await getEmployeesByIds(userIds);

    // Map userId to user info
    const userMap = new Map(
      users.map((user) => [
        user.id,
        { name: user.name, image: user.image || "", username: user.username },
      ]),
    );

    // Map shifts to SaleEmployee objects with user info
    // const employees: SaleEmployee[] = report.shifts.map((shift) => {
    //   const user = userMap.get(shift.userId);
    //   return {
    //     userId: shift.userId,
    //     hour: shift.hours,
    //     name: user?.name,
    //     image: user?.image,
    //     username: user?.username,
    //   };
    // });

    const expandedAuditLogs =
      report.auditLogs?.map((log) => {
        const user = userMap.get(log.userId);
        return {
          userId: log.userId,
          timestamp: log.timestamp,
          name: user?.name,
          image: user?.image,
          username: user?.username,
        };
      }) ?? [];

    return {
      ...report,
      reporterName: report.reporter.name,
      reporterImage: report.reporter.image,
      reporterUsername: report.reporter.username,
      // employees,
      auditLogs: expandedAuditLogs,
    };
  },
);

// Get first report date
export const getFirstReportDate = cache(async () => {
  const report = await prisma.saleReport.findFirst({
    orderBy: { date: "asc" },
  });

  return report?.date;
});

// Get reports by date range
export const getReportsByDateRange = cache(async (dateRange: DayRange) => {
  const reports = await prisma.saleReport.findMany({
    where: {
      date: { gte: dateRange.start, lte: dateRange.end },
    },
    select: {
      id: true,
      date: true,
      totalSales: true,
      cardSales: true,
      uberEatsSales: true,
      doorDashSales: true,
      skipTheDishesSales: true,
      onlineSales: true,
      platformSales: true,
      expenses: true,
    },
    orderBy: { date: "asc" },
  });

  return reports;
});

// Delete a report by id
export async function deleteReportById(reportId: string) {
  await prisma.saleReport.delete({
    where: { id: reportId },
  });
}

// Get reports for a specific year (for analytics heatmap)
export const getReportsForYear = cache(async (year: number) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  const reports = await prisma.saleReport.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    select: {
      date: true,
      totalSales: true,
    },
    orderBy: { date: "asc" },
  });

  return reports;
});

// Get reports for multiple years (for analytics dashboard)
export const getReportsForYears = cache(async (years: number[]) => {
  const reportsByYear: Record<number, { date: Date; totalSales: number }[]> = {};

  await Promise.all(
    years.map(async (year) => {
      const reports = await getReportsForYear(year);
      reportsByYear[year] = reports;
    }),
  );

  return reportsByYear;
});
