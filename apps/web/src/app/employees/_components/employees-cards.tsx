import { DisplayEmployee } from "@serva/shared";
import { EmployeeActions } from "./employee-actions";
import { EmployeeCard } from "./employee-card";

type EmployeesCardsProps = {
  employees: DisplayEmployee[];
  jobs: { id: string; name: string }[];
};

export function EmployeesCards({ employees, jobs }: EmployeesCardsProps) {
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
            actions={<EmployeeActions employee={employee} jobs={jobs} />}
          />
        );
      })}
    </section>
  );
}
