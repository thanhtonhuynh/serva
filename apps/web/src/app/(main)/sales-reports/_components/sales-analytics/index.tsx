import { getFirstReportDate, getReportsForYears } from "@/data-access/report";
import { getCurrentYear } from "@/utils/datetime";
import { getAvailableYears } from "@/utils/sales-analytics";
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
