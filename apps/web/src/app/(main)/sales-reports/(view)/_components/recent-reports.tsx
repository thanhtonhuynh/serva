import { Typography } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ICONS } from "@/constants/icons";
import { getRecentReports } from "@serva/database";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatInUTC, formatMoney } from "@serva/shared";
import Link from "next/link";

export async function RecentReports({ companyId }: { companyId: string }) {
  const reports = await getRecentReports(companyId, 5);

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>

      <CardContent className="">
        {reports.length === 0 && <Typography>No reports found.</Typography>}

        {reports.length > 0 && (
          <div className="divide-y">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/sales-reports?date=${formatInUTC(report.date)}`}
                className="hover:bg-muted/50 flex items-center justify-between px-1 py-3 transition-colors"
              >
                <p className="">{formatInUTC(report.date, "EEEE, MMM d, yyyy")}</p>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">{formatMoney(report.totalSales)}</p>
                    <p className="text-muted-foreground text-xs">Total Sales</p>
                  </div>

                  <HugeiconsIcon
                    icon={ICONS.ARROW_RIGHT}
                    className="text-muted-foreground hidden size-4 sm:block"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
