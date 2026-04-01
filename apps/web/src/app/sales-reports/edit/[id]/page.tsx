import { Header } from "@/components/layout";
import { Container } from "@serva/serva-ui/components/serva/container";
import { Typography } from "@serva/serva-ui/components/serva/typography";
import { getActivePlatforms, getStartCash, getReportRaw } from "@serva/database/dal";
import { authGuardWithRateLimit, hasSessionPermission } from "@serva/auth/authorize";
import { SaleReportInputs } from "@/lib/validations/report";
import { PERMISSIONS, PLATFORMS, formatInUTC, getPlatformById } from "@serva/shared";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { SaleReportPortal } from "../../new/sale-report-portal";

type Params = Promise<{ id: string }>;

export default async function Page(props: { params: Params }) {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.REPORTS_UPDATE))) return notFound();

  const params = await props.params;
  const report = await getReportRaw({ id: params.id });
  if (!report) notFound();

  const [startCashPromise, activePlatformIds] = [
    getStartCash(companyCtx.companyId),
    getActivePlatforms(companyCtx.companyId),
  ];

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
          />
        </section>
      </Container>
    </Fragment>
  );
}
