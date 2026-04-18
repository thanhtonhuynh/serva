import { prisma, Prisma } from "@serva/database";
import { parseInUTC, toCents } from "@serva/shared";
import type {
  DateRange,
  ReportAuditLog,
  SaleReportCardRawData,
  SaleReportOutput,
} from "@serva/shared/types";
import { cache } from "react";
import "server-only";
import { getStartCash } from "./company-settings";
import { getIdentitiesByIds } from "./employee";
import { recomputeTipsForDate } from "./work-day-record/dal";

export const getRecentReportsByIdentity = cache(
  async (identityId: string, companyId: string, limit: number = 5) => {
    return prisma.saleReport.findMany({
      where: { identityId, companyId },
      orderBy: { date: "desc" },
      take: limit,
      select: {
        id: true,
        date: true,
        totalSales: true,
      },
    });
  },
);

export const getRecentReports = cache(async (companyId: string, limit: number = 5) => {
  return prisma.saleReport.findMany({
    where: { companyId },
    orderBy: { date: "desc" },
    take: limit,
    select: {
      id: true,
      date: true,
      totalSales: true,
    },
  });
});

export async function upsertReport(data: SaleReportOutput, identityId: string, companyId: string) {
  const { cardTips, cashTips, extraTips, dateStr, platformSales, ...raw } = data;

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

  const startCash = await getStartCash(companyId);

  const date = parseInUTC(dateStr);

  const existingReport = await prisma.saleReport.findUnique({
    where: { date },
    select: { id: true, auditLogs: true, companyId: true },
  });

  if (existingReport && existingReport.companyId !== companyId) {
    throw new Error("Report belongs to a different company");
  }

  const auditLogs = existingReport?.auditLogs;

  const report = existingReport
    ? await prisma.saleReport.update({
        where: { id: existingReport.id },
        data: {
          startCash,
          expensesReason: raw.expensesReason,
          ...reportDataInCents,
          auditLogs: [
            ...(auditLogs ?? []),
            {
              identityId,
              timestamp: new Date(),
            },
          ],
        },
      })
    : await prisma.saleReport.create({
        data: {
          date,
          identityId,
          companyId,
          startCash,
          expensesReason: raw.expensesReason,
          ...reportDataInCents,
        },
      });

  await recomputeTipsForDate(companyId, date);

  return { report };
}

export const reportExists = cache(async (id: string) => {
  const report = await prisma.saleReport.findUnique({
    where: { id },
    select: { id: true },
  });

  return !!report;
});

export const getReportRaw = cache(
  async (where: Prisma.SaleReportWhereUniqueInput): Promise<SaleReportCardRawData | null> => {
    const report = await prisma.saleReport.findUnique({
      where,
      include: {
        reporter: { select: { name: true, image: true } },
      },
    });

    if (!report) return null;

    let expandedAuditLogs: ReportAuditLog[] | undefined = undefined;

    if (report.auditLogs.length > 0) {
      const identityIds = [...report.auditLogs.map((log) => log.identityId)];
      const identities = await getIdentitiesByIds(identityIds);

      const identityMap = new Map(
        identities.map((identity) => [
          identity.id,
          { name: identity.name, image: identity.image || "" },
        ]),
      );

      expandedAuditLogs = report.auditLogs.map((log) => {
        const identity = identityMap.get(log.identityId);
        return {
          identityId: log.identityId,
          timestamp: log.timestamp,
          name: identity?.name,
          image: identity?.image,
        };
      });
    }

    return {
      ...report,
      reporterName: report.reporter.name,
      reporterImage: report.reporter.image,
      auditLogs: expandedAuditLogs,
    };
  },
);

export const getFirstReportDate = cache(async (companyId: string) => {
  const report = await prisma.saleReport.findFirst({
    where: { companyId },
    orderBy: { date: "asc" },
  });

  return report?.date;
});

export const getReportsByDateRange = cache(async (companyId: string, dateRange: DateRange) => {
  return prisma.saleReport.findMany({
    where: {
      companyId,
      date: { gte: dateRange.start, lte: dateRange.end },
    },
    select: {
      id: true,
      date: true,
      totalSales: true,
      cardSales: true,
      platformSales: true,
      expenses: true,
    },
    orderBy: { date: "asc" },
  });
});

export async function deleteReportById(reportId: string) {
  await prisma.saleReport.delete({
    where: { id: reportId },
  });
}

export const getReportsForYear = cache(async (companyId: string, year: number) => {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  return prisma.saleReport.findMany({
    where: {
      companyId,
      date: { gte: startDate, lte: endDate },
    },
    select: {
      date: true,
      totalSales: true,
    },
    orderBy: { date: "asc" },
  });
});

export const getReportsForYears = cache(async (companyId: string, years: number[]) => {
  const reportsByYear: Record<number, { date: Date; totalSales: number }[]> = {};

  await Promise.all(
    years.map(async (year) => {
      const reports = await getReportsForYear(companyId, year);
      reportsByYear[year] = reports;
    }),
  );

  return reportsByYear;
});
