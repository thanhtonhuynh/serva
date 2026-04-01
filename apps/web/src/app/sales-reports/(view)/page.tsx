import { SaleReportCard } from "@/app/sales-reports/_components/sales-report-card";
import { utc } from "@date-fns/utc";
import { HugeiconsIcon } from "@hugeicons/react";
import { authGuardWithRateLimit, hasSessionPermission } from "@serva/auth/authorize";
import { getReportRaw } from "@serva/database/dal";
import { Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/serva-ui/components/card";
import { ICONS } from "@serva/serva-ui/constants/icons";
import {
  PERMISSIONS,
  formatInUTC,
  getTodayUTCMidnight,
  parseInUTC,
  processReportDataForView,
} from "@serva/shared";
import { format } from "date-fns";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteReportModal, ReportAuditLog } from "./_components";

type SearchParams = Promise<{ date?: string }>;

export default async function Page(props: { searchParams: SearchParams }) {
  await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.REPORTS_VIEW))) return notFound();

  const canUpdateReport = await hasSessionPermission(PERMISSIONS.REPORTS_UPDATE);
  const canDeleteReport = await hasSessionPermission(PERMISSIONS.REPORTS_DELETE);

  const searchParams = await props.searchParams;
  const dateParam = searchParams.date;
  if (!dateParam) {
    redirect(`/sales-reports?date=${formatInUTC(getTodayUTCMidnight())}`);
  }

  const report = await getReportRaw({ date: parseInUTC(dateParam) });
  if (!report)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
          <Typography variant="h2" className="text-warning flex items-center gap-2">
            <HugeiconsIcon icon={ICONS.REPORT_NOT_FOUND} className="size-5" strokeWidth={2} />
            Report not found on {format(dateParam, "yyyy-MM-dd", { in: utc })}
          </Typography>
        </CardContent>
      </Card>
    );

  const processedReport = processReportDataForView(report);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Sales Report</CardTitle>

        <div className="flex items-center gap-3">
          {canUpdateReport && (
            <Button
              nativeButton={false}
              variant="outline-accent"
              size={"sm"}
              render={
                <Link href={`/sales-reports/edit/${processedReport.id}`}>
                  <HugeiconsIcon icon={ICONS.EDIT} />
                  Edit
                </Link>
              }
            />
          )}
          {canDeleteReport && (
            <DeleteReportModal reportId={processedReport.id!} date={processedReport.date} />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <SaleReportCard data={processedReport} />

        <ReportAuditLog auditLogs={processedReport.auditLogs} />
      </CardContent>
    </Card>
  );
}
