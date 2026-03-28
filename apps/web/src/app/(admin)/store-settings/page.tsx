import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { PERMISSIONS } from "@serva/shared";
import { getActivePlatforms, getStartCash } from "@/data-access/company-settings";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { PlatformsForm } from "./platforms-form";
import { StartCashForm } from "./start-cash-form";

export default async function Page() {
  const { companyCtx } = await authGuardWithRateLimit();
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
