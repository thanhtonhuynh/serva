import { getFirstReportDate, getReportsForYears } from "@serva/database/dal";
import { getAvailableYears, getCurrentYear } from "@serva/shared";
import { SalesAnalyticsDashboardClient } from "./sales-analytics-dashboard";

export async function SalesAnalyticsDashboard({ companyId }: { companyId: string }) {
  const currentYear = getCurrentYear();
  const firstReportDate = await getFirstReportDate(companyId);
  const availableYears = getAvailableYears(firstReportDate ?? null);

  const reportsByYear = await getReportsForYears(companyId, availableYears);

  return (
    <SalesAnalyticsDashboardClient
      reportsByYear={reportsByYear}
      availableYears={availableYears}
      currentYear={currentYear}
    />
  );
}
