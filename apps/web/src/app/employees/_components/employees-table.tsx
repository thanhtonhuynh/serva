"use client";

import { AccountStatusBadge } from "@/components/shared";
import { DisplayEmployee } from "@serva/shared";
import { ProfilePicture } from "@serva/serva-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui/components/table";
import { EmployeeActions } from "./employee-actions";

type EmployeesTableProps = {
  employees: DisplayEmployee[];
  jobs: { id: string; name: string }[];
};

export function EmployeesTable({ employees, jobs }: EmployeesTableProps) {
  // const router = useRouter();

  if (employees.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">No results found.</div>;
  }

  // const handleRowClick = (username: string) => {
  //   router.push(`/profile/${username}`);
  // };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Job</TableHead>
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
              // onClick={() => handleRowClick(employee.identity.username)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProfilePicture
                    image={employee.identity.image}
                    size={32}
                    name={employee.identity.name}
                  />
                  <span className="font-medium">{employee.identity.name}</span>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground">{employee.identity.email}</TableCell>

              <TableCell>{employee.job?.name ?? "—"}</TableCell>

              <TableCell>
                <AccountStatusBadge status={employee.status} />
              </TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <EmployeeActions employee={employee} jobs={jobs} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
