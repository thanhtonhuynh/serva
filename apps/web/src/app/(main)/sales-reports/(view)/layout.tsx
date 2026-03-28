import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/constants/icons";
import { PERMISSIONS } from "@serva/shared";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Fragment, ReactNode, Suspense } from "react";
import { SalesAnalyticsDashboard } from "../_components/sales-analytics";
import { SalesAnalyticsSkeleton } from "../_components/sales-analytics/sales-analytics-skeleton";
import { RecentReports, ReportPicker } from "./_components";

export default async function ReportViewLayout({ children }: { children: ReactNode }) {
  const { companyCtx } = await authGuardWithRateLimit();

  const canCreateReport = await hasSessionPermission(PERMISSIONS.REPORTS_CREATE);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Sales Reports</Typography>
      </Header>

      <Container>
        {canCreateReport && (
          <Button
            nativeButton={false}
            size="sm"
            className="self-end"
            render={
              <Link href={`/sales-reports/new`}>
                <HugeiconsIcon icon={ICONS.REPORT_ADD} />
                Create report
              </Link>
            }
          />
        )}

        <Suspense fallback={<SalesAnalyticsSkeleton />}>
          <SalesAnalyticsDashboard companyId={companyCtx.companyId} />
        </Suspense>

        <div className="flex flex-col gap-6 min-[1150px]:flex-row min-[1150px]:items-start">
          <div className="flex flex-col gap-6">
            <ReportPicker />
            <Suspense fallback={null}>
              <RecentReports companyId={companyCtx.companyId} />
            </Suspense>
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </Container>
    </Fragment>
  );
}
