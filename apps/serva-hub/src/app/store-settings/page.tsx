import { Header } from "@/components/layout";
import { authWithRateLimit, hasSessionPermission } from "@/libs/auth";
import { getActivePlatforms, getStartCash } from "@serva/database/dal";
import { Container, Typography } from "@serva/serva-ui";
import { PERMISSIONS } from "@serva/shared";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { PlatformsForm } from "./platforms-form";
import { StartCashForm } from "./start-cash-form";

export default async function Page() {
  const { companyCtx } = await authWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.STORE_SETTINGS_MANAGE))) return notFound();

  const [currentStartCash, activePlatformIds] = await Promise.all([
    getStartCash(companyCtx.companyId),
    getActivePlatforms(companyCtx.companyId),
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
