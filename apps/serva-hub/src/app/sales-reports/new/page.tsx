import { Header } from "@/components/layout";
import { authWithRateLimit, hasSessionPermission } from "@/libs/auth";
import { getActivePlatforms, getStartCash } from "@serva/database/dal";
import { Container, Typography } from "@serva/serva-ui";
import { PERMISSIONS, PLATFORMS, getPlatformById } from "@serva/shared";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { SaleReportPortal } from "./sale-report-portal";

export default async function Page() {
  const { companyCtx } = await authWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.REPORTS_CREATE))) return notFound();

  const [startCashPromise, activePlatformIds] = [
    getStartCash(companyCtx.companyId),
    getActivePlatforms(companyCtx.companyId),
  ];

  const activePlatforms = (await activePlatformIds)
    .map((id) => getPlatformById(id))
    .filter(Boolean) as typeof PLATFORMS;

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">New sales report</Typography>
      </Header>

      <Container>
        <section className="mx-auto w-full max-w-5xl">
          <SaleReportPortal
            startCashPromise={startCashPromise}
            activePlatforms={activePlatforms}
            mode="create"
          />
        </section>
      </Container>
    </Fragment>
  );
}
