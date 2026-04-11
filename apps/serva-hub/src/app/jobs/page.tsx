import { Header } from "@/components/layout";
import { authWithRateLimit, hasSessionPermission } from "@/libs/auth";
import { getJobsByCompany } from "@serva/database/dal";
import { Card, Container, Typography } from "@serva/serva-ui";
import { PERMISSIONS } from "@serva/shared";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { JobsManager } from "./_components/jobs-manager";

export default async function TeamJobsPage() {
  const { companyCtx } = await authWithRateLimit();
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
