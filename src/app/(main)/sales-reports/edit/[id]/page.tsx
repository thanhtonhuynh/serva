import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { PERMISSIONS } from "@/constants/permissions";
import { PLATFORMS, getPlatformById } from "@/constants/platforms";
import { getReportRaw } from "@/data-access/report";
import { getActivePlatforms, getStartCash } from "@/data-access/store";
import { getCurrentSession } from "@/lib/auth/session";
import { SaleReportInputs } from "@/lib/validations/report";
import { hasPermission } from "@/utils/access-control";
import { formatInUTC } from "@/utils/datetime";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { SaleReportPortal } from "../../new/sale-report-portal";

type Params = Promise<{ id: string }>;

export default async function Page(props: { params: Params }) {
  const { session, user } = await getCurrentSession();
  if (!session) redirect("/login");
  if (user.accountStatus !== "active") notFound();
  if (!hasPermission(user.role, PERMISSIONS.REPORTS_UPDATE)) notFound();

  const params = await props.params;
  const report = await getReportRaw({ id: params.id });
  if (!report) notFound();

  const [startCashPromise, activePlatformIds] = [getStartCash(), getActivePlatforms()];

  const activePlatforms = (await activePlatformIds)
    .map((id) => getPlatformById(id))
    .filter(Boolean) as typeof PLATFORMS;

  // Build platformSales from the report data (in dollars).
  // All reports should have platformSales populated after migration.
  const platformSales = report.platformSales.map((ps) => ({
    platformId: ps.platformId,
    amount: ps.amount / 100,
  }));

  // Convert cents -> dollars
  const initialValues: SaleReportInputs = {
    dateStr: formatInUTC(report.date),
    totalSales: report.totalSales / 100,
    cardSales: report.cardSales / 100,
    platformSales,
    expenses: report.expenses / 100,
    expensesReason: report.expensesReason ?? undefined,
    cardTips: report.cardTips / 100,
    cashTips: report.cashTips / 100,
    extraTips: report.extraTips / 100,
    cashInTill: report.cashInTill / 100,
  };

  return (
    <Fragment>
      <Header>
        <div>
          <Typography variant="h1">Edit sales report</Typography>
          <p className="text-sm">{formatInUTC(report.date, "EEEE, MMMM d, yyyy")}</p>
        </div>
      </Header>

      <Container>
        <section className="mx-auto w-full max-w-5xl">
          <SaleReportPortal
            startCashPromise={startCashPromise}
            activePlatforms={activePlatforms}
            initialValues={initialValues}
            mode="edit"
            reporterName={report.reporterName}
            reporterImage={report.reporterImage}
            reporterUsername={report.reporterUsername}
          />
        </section>
      </Container>
    </Fragment>
  );
}
