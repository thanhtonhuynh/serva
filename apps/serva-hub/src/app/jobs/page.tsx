import { Header } from "@/components/layout";
import { Container } from "@serva/serva-ui";
import { Typography } from "@serva/serva-ui";
import { Card } from "@serva/serva-ui";
import { PERMISSIONS } from "@serva/shared";
import { getJobsByCompany } from "@serva/database/dal";
import { authGuardWithRateLimit, hasSessionPermission } from "@serva/auth/authorize";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { JobsManager } from "./_components/jobs-manager";

export default async function TeamJobsPage() {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.TEAM_VIEW))) return notFound();

  const [jobs, canManage] = await Promise.all([
    getJobsByCompany(companyCtx.companyId),
    hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS),
  ]);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Jobs</Typography>
      </Header>

      <Container>
        <Card className="p-6">
          <JobsManager jobs={jobs} canManage={canManage} />
        </Card>
      </Container>
    </Fragment>
  );
}
