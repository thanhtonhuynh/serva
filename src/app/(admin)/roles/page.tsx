import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { NotiMessage, Typography } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getPermissionsGrouped, getRoles } from "@/data-access/roles";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { CreateRoleModal, RolesTable } from "./_components";

export default async function RolesPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  if (user.accountStatus !== "active") return notFound();
  if (!hasPermission(user.role, PERMISSIONS.ROLES_VIEW)) return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const canManageRoles = hasPermission(user.role, PERMISSIONS.ROLES_MANAGE);
  const [roles, permissionsGrouped] = await Promise.all([getRoles(), getPermissionsGrouped()]);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Roles & Permissions</Typography>
      </Header>

      <Container>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Roles</CardTitle>
                <Typography variant="p-sm" className="text-muted-foreground mt-1">
                  Manage roles and their permissions for your team
                </Typography>
              </div>

              {canManageRoles && <CreateRoleModal permissionsGrouped={permissionsGrouped} />}
            </div>
          </CardHeader>

          <CardContent>
            <RolesTable
              roles={roles}
              canManageRoles={canManageRoles}
              permissionsGrouped={permissionsGrouped}
            />
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
