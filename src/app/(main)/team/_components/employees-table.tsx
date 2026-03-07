"use client";

import { AccountStatusBadge, ProfilePicture } from "@/components/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DisplayUser } from "@/types";
import type { RoleWithDetails } from "@/types/rbac";
import { useRouter } from "next/navigation";
import { EmployeeActions } from "./employee-actions";

type EmployeesTableProps = {
  employees: DisplayUser[];
  rolesPromise: Promise<RoleWithDetails[]>;
};

export function EmployeesTable({ employees, rolesPromise }: EmployeesTableProps) {
  const router = useRouter();

  if (employees.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">No results found.</div>;
  }

  const handleRowClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  return (
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
        {employees.map((employee) => {
          return (
            <TableRow
              key={employee.id}
              className="cursor-pointer"
              onClick={() => handleRowClick(employee.username)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProfilePicture image={employee.image} size={32} name={employee.name} />
                  <span className="font-medium">{employee.name}</span>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground">{employee.email}</TableCell>

              <TableCell>{employee.role?.name ?? "No Role"}</TableCell>

              <TableCell>
                <AccountStatusBadge status={employee.accountStatus} />
              </TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <EmployeeActions employee={employee} rolesPromise={rolesPromise} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
