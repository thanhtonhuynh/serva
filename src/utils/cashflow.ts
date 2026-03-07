import { CashFlowRawData, YearCashFlowData } from "@/types";
import { Expense } from "@prisma/client";
import { sumPlatformSales } from "./report";

/**
 * Helper: get the effective platformSales from a report.
 * Uses the new platformSales array if populated, otherwise falls back to legacy columns.
 */
// function getEffectivePlatformSales(report: CashFlowRawData): PlatformSaleData[] {
//   if (report.platformSales.length > 0) return report.platformSales;

//   // Legacy fallback
//   return [
//     { platformId: "uber_eats", amount: report.uberEatsSales },
//     { platformId: "doordash", amount: report.doorDashSales },
//     { platformId: "skip_the_dishes", amount: report.skipTheDishesSales },
//     { platformId: "ritual", amount: report.onlineSales },
//   ].filter((ps) => ps.amount > 0);
// }

export function processCashFlowData(rawReports: CashFlowRawData[]) {
  return rawReports.map((report) => {
    const platformTotal = sumPlatformSales(report.platformSales);

    const actualCash = report.totalSales - platformTotal - report.cardSales - report.expenses;

    const totalRevenue = report.cardSales + actualCash + platformTotal + report.expenses;

    return {
      ...report,
      actualCash,
      totalRevenue,
    };
  });
}

export function processYearCashFlowData(
  rawYearReports: CashFlowRawData[],
  yearMainExpenses: Expense[],
): YearCashFlowData[] {
  const yearCashFlowData = Array(12)
    .fill(null)
    .map((_, month) => {
      const monthReports = rawYearReports.filter((report) => report.date.getMonth() === month);

      const totalSales = monthReports.reduce((acc, report) => acc + report.totalSales, 0);

      // Aggregate platform totals dynamically
      const platformTotals: Record<string, number> = {};
      let totalOnlineSales = 0;

      for (const report of monthReports) {
        const ps = report.platformSales;
        for (const sale of ps) {
          platformTotals[sale.platformId] = (platformTotals[sale.platformId] ?? 0) + sale.amount;
          totalOnlineSales += sale.amount;
        }
      }

      const totalInstoreExpenses = monthReports.reduce((acc, report) => acc + report.expenses, 0);
      const totalInStoreSales = totalSales - totalOnlineSales;

      const monthMainExpenses = yearMainExpenses.filter(
        (expense) => expense.date.getUTCMonth() === month,
      );
      const totalMonthMainExpenses = monthMainExpenses.reduce(
        (acc, expense) => acc + expense.entries.reduce((acc, entry) => acc + entry.amount, 0),
        0,
      );

      const totalExpenses = totalInstoreExpenses + totalMonthMainExpenses;

      const netIncome = totalSales - totalExpenses;
      return {
        month: month + 1,
        totalInStoreSales,
        platformTotals,
        totalOnlineSales,
        totalSales,
        totalInstoreExpenses,
        totalMonthMainExpenses,
        totalExpenses,
        netIncome,
      };
    });

  return yearCashFlowData;
}
