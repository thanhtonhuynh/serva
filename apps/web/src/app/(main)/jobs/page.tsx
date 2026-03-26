import { Container, Header } from "@/components/layout";
import { Typography } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getJobsByCompany } from "@/data-access/job";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
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
