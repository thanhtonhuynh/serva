import { getFirstReportDate, getReportsForYears } from "@/data-access/report";
import { getCurrentYear } from "@/utils/datetime";
import { getAvailableYears } from "@/utils/sales-analytics";
import { SalesAnalyticsDashboardClient } from "./sales-analytics-dashboard";

export async function SalesAnalyticsDashboard() {
  const currentYear = getCurrentYear();
  const firstReportDate = await getFirstReportDate();
  const availableYears = getAvailableYears(firstReportDate ?? null);

  // Fetch reports for all available years
  const reportsByYear = await getReportsForYears(availableYears);

  return (
    <SalesAnalyticsDashboardClient
      reportsByYear={reportsByYear}
      availableYears={availableYears}
      currentYear={currentYear}
    />
  );
}
