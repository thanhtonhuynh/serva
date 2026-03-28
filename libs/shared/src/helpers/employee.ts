import { EMPLOYEE_STATUS_LABELS } from "../constants/employee";

export function getEmployeeStatusConfig(accountStatus: string) {
  return (
    EMPLOYEE_STATUS_LABELS[accountStatus] || {
      label: accountStatus,
      variant: "secondary" as const,
    }
  );
}
