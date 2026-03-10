import prisma from "@/lib/prisma";
import { toCents } from "@/lib/utils";
import { type SaleReportOutput } from "@/lib/validations/report";
import { DayRange, SaleReportCardRawData, type ReportAuditLog } from "@/types";
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
export async function upsertReport(data: SaleReportOutput, userId: string) {
  const { cardTips, cashTips, extraTips, date, platformSales, ...raw } = data;

  // Convert all money values to cents
  const reportDataInCents = {
    totalSales: toCents(raw.totalSales),
    cardSales: toCents(raw.cardSales),
    platformSales: platformSales.map((ps) => ({
      ...ps,
      amount: toCents(ps.amount),
    })),
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
    });

    if (!report) return null;

    let expandedAuditLogs: ReportAuditLog[] | undefined = undefined;

    // Only fetch users and expand audit logs if there are any audit logs
    if (report.auditLogs.length > 0) {
      // Collect userIds from audit logs
      const userIds = [...report.auditLogs.map((log) => log.userId)];

      // Get user info for those userIds
      const users = await getEmployeesByIds(userIds);

      // Map userId to user info
      const userMap = new Map(
        users.map((user) => [
          user.id,
          { name: user.name, image: user.image || "", username: user.username },
        ]),
      );

      expandedAuditLogs = report.auditLogs.map((log) => {
        const user = userMap.get(log.userId);
        return {
          userId: log.userId,
          timestamp: log.timestamp,
          name: user?.name,
          image: user?.image,
          username: user?.username,
        };
      });
    }

    return {
      ...report,
      reporterName: report.reporter.name,
      reporterImage: report.reporter.image,
      reporterUsername: report.reporter.username,
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
      // uberEatsSales: true,
      // doorDashSales: true,
      // skipTheDishesSales: true,
      // onlineSales: true,
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
