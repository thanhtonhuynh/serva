import { Header } from "@/components/layout";
import { Container } from "@serva/serva-ui";
import { Typography } from "@serva/serva-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/serva-ui";
import { authGuardWithRateLimit, hasSessionPermission } from "@serva/auth/authorize";
import { getPermissionsGrouped, getRoles } from "@serva/database/dal";
import { PERMISSIONS } from "@serva/shared";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { CreateRoleModal, RolesTable } from "./_components";

export default async function RolesPage() {
  const { companyCtx } = await authGuardWithRateLimit();
  if (!(await hasSessionPermission(PERMISSIONS.ROLES_VIEW))) return notFound();

  const canManageRoles = await hasSessionPermission(PERMISSIONS.ROLES_MANAGE);
  const [roles, permissionsGrouped] = await Promise.all([
    getRoles(companyCtx.companyId),
    getPermissionsGrouped(),
  ]);

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
