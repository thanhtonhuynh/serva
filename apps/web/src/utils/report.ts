import { PlatformSaleData, SaleReportCardProcessedData, SaleReportCardRawData } from "@/types";

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
