import { Container } from "@/components/layout/container";
import { Header } from "@/components/layout/header";
import { Typography } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getEmployeesByCompany } from "@/data-access/employee";
import { getAwaitingInvitesByCompanyAndType } from "@/data-access/invite";
import { getJobsByCompany } from "@/data-access/job";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { type EmployeeStatus } from "@/types";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { StatusFilter } from "../../../components/shared/status-filter";
import { ViewToggle, type ViewMode } from "../../../components/shared/view-toggle";
import { EmployeesList } from "./_components/employees-list";

type PageProps = {
  searchParams: Promise<{ status?: string; view?: string }>;
};

export default async function TeamEmployeesPage({ searchParams }: PageProps) {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.TEAM_VIEW))) return notFound();

  const params = await searchParams;
  const canManageTeamAccess = await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS);

  const status: EmployeeStatus = canManageTeamAccess
    ? (params.status as EmployeeStatus) || "active"
    : "active";

  const view: ViewMode = (params.view as ViewMode) || "table";

  const [employees, jobs] = await Promise.all([
    status === "awaiting" ? Promise.resolve([]) : getEmployeesByCompany(companyCtx.companyId, status),
    getJobsByCompany(companyCtx.companyId),
  ]);
  const awaitingInvites =
    status === "awaiting"
      ? await getAwaitingInvitesByCompanyAndType(companyCtx.companyId, "employee")
      : [];

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Employees</Typography>
      </Header>

      <Container>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusFilter canManageTeamAccess={canManageTeamAccess} basePath="/employees" />
            </div>

            <ViewToggle basePath="/employees" />
          </div>

          <EmployeesList
            employees={employees}
            view={view}
            jobs={jobs}
            status={status}
            canManageTeamAccess={canManageTeamAccess}
            awaitingInvites={awaitingInvites.map((invite) => ({
              id: invite.id,
              email: invite.email,
              createdAt: invite.createdAt,
              jobName: invite.job?.name ?? null,
            }))}
          />
        </Card>
      </Container>
    </Fragment>
  );
}
