import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { NotiMessage, Typography } from "@/components/shared";
import { PERMISSIONS } from "@/constants/permissions";
import { PLATFORMS, getPlatformById } from "@/constants/platforms";
import { getEmployees } from "@/data-access/employee";
import { getActivePlatforms, getStartCash } from "@/data-access/store";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { SaleReportPortal } from "./sale-report-portal";

export default async function Page() {
  const { session, user } = await getCurrentSession();
  if (!session) redirect("/login");
  if (user.accountStatus !== "active") return notFound();
  if (!hasPermission(user.role, PERMISSIONS.REPORTS_CREATE)) return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const [usersPromise, startCashPromise, activePlatformIds] = [
    getEmployees("active", true), // true = exclude hidden users
    getStartCash(),
    getActivePlatforms(),
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
            usersPromise={usersPromise}
            startCashPromise={startCashPromise}
            activePlatforms={activePlatforms}
            mode="create"
          />
        </section>
      </Container>
    </Fragment>
  );
}
