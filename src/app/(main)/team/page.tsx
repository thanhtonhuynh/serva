import { NotiMessage } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getEmployees } from "@/data-access/employee";
import { getRoles } from "@/data-access/roles";
import { getCurrentSession } from "@/lib/auth/session";
import { type EmployeeStatus } from "@/types";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { notFound, redirect } from "next/navigation";
import { EmployeesList } from "./_components/employees-list";
import { StatusFilter } from "./_components/status-filter";
import { ViewToggle, type ViewMode } from "./_components/view-toggle";

type PageProps = {
  searchParams: Promise<{ status?: string; view?: string }>;
};

export default async function TeamPage({ searchParams }: PageProps) {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  if (user.accountStatus !== "active") return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const params = await searchParams;
  const canManageTeamAccess = hasPermission(user.role, PERMISSIONS.TEAM_MANAGE_ACCESS);

  const status: EmployeeStatus = canManageTeamAccess
    ? (params.status as EmployeeStatus) || "active"
    : "active";

  const view: ViewMode = (params.view as ViewMode) || "table";

  const employees = await getEmployees(status);

  const rolesPromise = getRoles();

  return (
    <Card className="p-6">
      {/* Toolbar: Filter + View Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusFilter canManageTeamAccess={canManageTeamAccess} />
        </div>

        <ViewToggle />
      </div>

      {/* Content: Search + Table/Cards view */}
      <EmployeesList employees={employees} view={view} rolesPromise={rolesPromise} />
    </Card>
  );
}
