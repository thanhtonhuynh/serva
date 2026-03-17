import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/constants/icons";
import { PERMISSIONS } from "@/constants/permissions";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Fragment, ReactNode, Suspense } from "react";
import { SalesAnalyticsDashboard } from "../_components/sales-analytics";
import { SalesAnalyticsSkeleton } from "../_components/sales-analytics/sales-analytics-skeleton";
import { RecentReports, ReportPicker } from "./_components";

export default async function ReportViewLayout({ children }: { children: ReactNode }) {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");
  if (identity.accountStatus !== "active") return notFound();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Sales Reports</Typography>
      </Header>

      <Container>
        {hasPermission(identity.role, PERMISSIONS.REPORTS_CREATE) && (
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
          <SalesAnalyticsDashboard />
        </Suspense>

        <div className="flex flex-col gap-6 min-[1150px]:flex-row min-[1150px]:items-start">
          <div className="flex flex-col gap-6">
            <ReportPicker />
            <Suspense fallback={null}>
              <RecentReports />
            </Suspense>
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </Container>
    </Fragment>
  );
}
