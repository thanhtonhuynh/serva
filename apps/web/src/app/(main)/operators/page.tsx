import { Container } from "@/components/layout/container";
import { Header } from "@/components/layout/header";
import { Typography } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { PERMISSIONS, DisplayOperator, type EmployeeStatus } from "@serva/shared";
import { getAwaitingInvitesByCompanyAndType } from "@/data-access/invite";
import { getOperatorsByCompany } from "@/data-access/operator";
import { getRoles } from "@/data-access/roles";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { StatusFilter } from "../../../components/shared/status-filter";
import { ViewToggle, type ViewMode } from "../../../components/shared/view-toggle";
import { OperatorsList } from "./_components/operators-list";

type PageProps = {
  searchParams: Promise<{ status?: string; view?: string }>;
};

export default async function OperatorsPage({ searchParams }: PageProps) {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.TEAM_VIEW))) return notFound();

  const params = await searchParams;
  const canManageTeamAccess = await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS);

  const status: EmployeeStatus = canManageTeamAccess
    ? (params.status as EmployeeStatus) || "active"
    : "active";

  const view: ViewMode = (params.view as ViewMode) || "table";

  const [operatorsRaw, roles, awaitingInvites] = await Promise.all([
    status === "awaiting" ? Promise.resolve([]) : getOperatorsByCompany(companyCtx.companyId, status),
    getRoles(companyCtx.companyId),
    status === "awaiting"
      ? getAwaitingInvitesByCompanyAndType(companyCtx.companyId, "operator")
      : Promise.resolve([]),
  ]);
  const rolesPromise = Promise.resolve(roles);

  const operators: DisplayOperator[] = operatorsRaw.map((o) => ({
    id: o.id,
    identityId: o.identityId,
    companyId: o.companyId,
    status: o.status,
    role: o.role
      ? {
          id: o.role.id,
          name: o.role.name,
          permissions: o.role.permissions.map((p) => ({ code: p.code })),
        }
      : null,
    identity: o.identity,
  }));

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Operators</Typography>
      </Header>

      <Container>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusFilter canManageTeamAccess={canManageTeamAccess} basePath="/operators" />
            </div>

            <ViewToggle basePath="/operators" />
          </div>

          <OperatorsList
            operators={operators}
            view={view}
            rolesPromise={rolesPromise}
            roles={roles}
            status={status}
            canManageTeamAccess={canManageTeamAccess}
            awaitingInvites={awaitingInvites.map((invite) => ({
              id: invite.id,
              email: invite.email,
              createdAt: invite.createdAt,
              roleName: invite.role?.name ?? null,
            }))}
          />
        </Card>
      </Container>
    </Fragment>
  );
}
