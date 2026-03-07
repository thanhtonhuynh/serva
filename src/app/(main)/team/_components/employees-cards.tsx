import { DisplayUser } from "@/types";
import type { RoleWithDetails } from "@/types/rbac";
import { EmployeeActions } from "./employee-actions";
import { EmployeeCard } from "./employee-card";

type EmployeesCardsProps = {
  employees: DisplayUser[];
  rolesPromise: Promise<RoleWithDetails[]>;
};

export function EmployeesCards({ employees, rolesPromise }: EmployeesCardsProps) {
  if (employees.length === 0) {
    return <div className="text-muted-foreground py-8 text-center">No results found.</div>;
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      {employees.map((employee) => {
        return (
          <EmployeeCard
            key={employee.id}
            user={employee}
            actions={<EmployeeActions employee={employee} rolesPromise={rolesPromise} />}
          />
        );
      })}
    </section>
  );
}
