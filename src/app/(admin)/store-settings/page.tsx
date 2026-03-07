import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { NotiMessage } from "@/components/shared";
import { Typography } from "@/components/shared/typography";
import { PERMISSIONS } from "@/constants/permissions";
import { getActivePlatforms, getStartCash } from "@/data-access/store";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { PlatformsForm } from "./platforms-form";
import { StartCashForm } from "./start-cash-form";

export default async function Page() {
  const { session, user } = await getCurrentSession();
  if (!session) redirect("/login");
  if (user.accountStatus !== "active") return notFound();
  if (!hasPermission(user.role, PERMISSIONS.STORE_SETTINGS_MANAGE)) return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const [currentStartCash, activePlatformIds] = await Promise.all([
    getStartCash(),
    getActivePlatforms(),
  ]);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Store Settings</Typography>
      </Header>

      <Container>
        <StartCashForm currentStartCash={currentStartCash / 100} />
        <PlatformsForm currentActivePlatformIds={activePlatformIds} />
      </Container>
    </Fragment>
  );
}
