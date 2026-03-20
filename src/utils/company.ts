import type { BasicCompany } from "@/types/company";

/**
 * Build a set of unique companies from an array of operator and employee accounts.
 */
export function buildUniqueCompaniesFromAccounts(
  operators: { company: BasicCompany }[],
  employees: { company: BasicCompany }[],
): BasicCompany[] {
  const map = new Map<string, BasicCompany>();
  operators.forEach(
    (operator) => !map.has(operator.company.id) && map.set(operator.company.id, operator.company),
  );
  employees.forEach(
    (employee) => !map.has(employee.company.id) && map.set(employee.company.id, employee.company),
  );
  return [...map.values()];
}
