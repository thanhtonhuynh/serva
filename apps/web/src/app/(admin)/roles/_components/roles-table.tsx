"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ICONS } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { RoleWithDetails } from "@/types/rbac";
import { HugeiconsIcon } from "@hugeicons/react";
import { Permission } from "@serva/database";
import { format } from "date-fns";
import { RoleActions } from "./role-actions";

type RolesTableProps = {
  roles: RoleWithDetails[];
  canManageRoles: boolean;
  permissionsGrouped: Record<string, Permission[]>;
};

export function RolesTable({ roles, canManageRoles, permissionsGrouped }: RolesTableProps) {
  if (roles.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">No roles found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-center">Permissions</TableHead>
          <TableHead className="text-center">Operators</TableHead>
          <TableHead className="text-center">Created on</TableHead>
          {canManageRoles && <TableHead className="w-20">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => {
          const isAdminRole = role.name.toLowerCase() === "admin";

          return (
            <TableRow
              key={role.id}
              className={cn(!role.editable && "bg-muted/50 hover:bg-muted/50")}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={cn("font-medium", isAdminRole && "text-primary")}>
                    {role.name}
                  </span>
                  {!role.editable && <Badge variant="outline">Default</Badge>}
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground max-w-xs truncate">
                {role.description || "-"}
              </TableCell>

              <TableCell className="text-center">
                <Badge variant="outline">{isAdminRole ? "All" : role.permissions.length}</Badge>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs">{role._count.operators}</span>
                  <HugeiconsIcon icon={ICONS.USER_TWO} className="size-4" />
                </div>
              </TableCell>

              <TableCell className="text-center">{format(role.createdAt, "MMM d, yyyy")}</TableCell>

              {canManageRoles && (
                <TableCell>
                  <RoleActions role={role} permissionsGrouped={permissionsGrouped} />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
