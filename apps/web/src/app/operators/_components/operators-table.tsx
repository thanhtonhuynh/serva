"use client";

import { AccountStatusBadge } from "@/components/shared";
import { DisplayOperator, type RoleWithDetails } from "@serva/shared";
import { ProfilePicture } from "@serva/serva-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui";
import { useState } from "react";
import { ChangeRoleModal } from "./change-role-modal";
import { OperatorActions } from "./operator-actions";

type Props = {
  operators: DisplayOperator[];
  rolesPromise: Promise<RoleWithDetails[]>;
};

export function OperatorsTable({ operators, rolesPromise }: Props) {
  // const router = useRouter();
  const [roleModalUser, setRoleModalUser] = useState<DisplayOperator | null>(null);

  if (operators.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">No results found.</div>;
  }

  // const handleRowClick = (username: string) => {
  //   router.push(`/profile/${username}`);
  // };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operators.map((operator) => (
            <TableRow
              key={operator.id}
              className="cursor-pointer"
              // onClick={() => handleRowClick(operator.identity.username)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProfilePicture
                    image={operator.identity.image}
                    size={32}
                    name={operator.identity.name}
                  />
                  <span className="font-medium">{operator.identity.name}</span>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground">{operator.identity.email}</TableCell>

              <TableCell>{operator.role?.name ?? "—"}</TableCell>

              <TableCell>
                <AccountStatusBadge status={operator.status} />
              </TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <OperatorActions
                  operator={operator}
                  onChangeRole={() => setRoleModalUser(operator)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {roleModalUser && (
        <ChangeRoleModal
          key={roleModalUser.id}
          selectedUser={roleModalUser}
          open={!!roleModalUser}
          onOpenChange={(open) => !open && setRoleModalUser(null)}
          rolesPromise={rolesPromise}
        />
      )}
    </>
  );
}
