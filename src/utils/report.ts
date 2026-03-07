import {
  CashFlowRawData,
  PlatformSaleData,
  SaleReportCardProcessedData,
  SaleReportCardRawData,
} from "@/types";

/** Sum all platform sales from the platformSales array */
export function sumPlatformSales(platformSales: PlatformSaleData[]): number {
  return platformSales.reduce((sum, ps) => sum + ps.amount, 0);
}

/** Get amount for a specific platform from the platformSales array */
export function getPlatformAmount(platformSales: PlatformSaleData[], platformId: string): number {
  return platformSales.find((ps) => ps.platformId === platformId)?.amount ?? 0;
}

export function processReportDataForView(
  rawData: SaleReportCardRawData,
): SaleReportCardProcessedData {
  const onlineSales = sumPlatformSales(rawData.platformSales);

  const inStoreSales = rawData.totalSales - onlineSales;

  const cashSales = inStoreSales - rawData.cardSales;

  const actualCash = cashSales - rawData.expenses;

  const totalTips = Number(rawData.cardTips) + Number(rawData.cashTips) + Number(rawData.extraTips);

  const cashDifference = rawData.cashInTill - rawData.startCash - actualCash;

  const cashOut = Number(rawData.cashInTill) - Number(rawData.startCash) + Number(rawData.cashTips);

  // const totalHours = rawData.employees.reduce(
  //   (acc, employee) => acc + employee.hour,
  //   0,
  // );

  // const tipsPerHour = totalTips / totalHours;

  const processedData = {
    ...rawData,
    inStoreSales,
    onlineSales,
    cashSales,
    actualCash,
    totalTips,
    cashDifference,
    cashOut,
    // totalHours,
    // tipsPerHour,
  };

  return processedData;
}

export type ReportSummary = {
  totalSales: number;
  /** Total of all platform sales combined */
  onlineSales: number;
  /** Per-platform breakdown: platformId → total amount */
  platformTotals: Record<string, number>;
};

export function summarizeReports(reports: CashFlowRawData[]): ReportSummary {
  return reports.reduce<ReportSummary>(
    (acc, report) => {
      acc.totalSales += report.totalSales;

      // Use platformSales if available, fall back to legacy fields
      const platformSales =
        report.platformSales.length > 0
          ? report.platformSales
          : // Legacy fallback: build platformSales from old columns
            [
              { platformId: "uber_eats", amount: report.uberEatsSales },
              { platformId: "doordash", amount: report.doorDashSales },
              {
                platformId: "skip_the_dishes",
                amount: report.skipTheDishesSales,
              },
              { platformId: "ritual", amount: report.onlineSales },
            ].filter((ps) => ps.amount > 0);

      const reportOnline = sumPlatformSales(platformSales);
      acc.onlineSales += reportOnline;

      for (const ps of platformSales) {
        acc.platformTotals[ps.platformId] = (acc.platformTotals[ps.platformId] ?? 0) + ps.amount;
      }

      return acc;
    },
    {
      totalSales: 0,
      onlineSales: 0,
      platformTotals: {},
    },
  );
}
