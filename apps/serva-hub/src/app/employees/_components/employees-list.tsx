"use client";

import { type ViewMode } from "@/components/shared";
import { Button, Input } from "@serva/serva-ui";
import type { DisplayEmployee } from "@serva/shared/types";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmployeeInviteActions } from "./employee-invite-actions";
import { EmployeesCards } from "./employees-cards";
import { EmployeesTable } from "./employees-table";
import { InviteEmployeeModal } from "./invite-employee-modal";

type EmployeesListProps = {
  employees: DisplayEmployee[];
  view: ViewMode;
  jobs: { id: string; name: string }[];
  awaitingInvites: { id: string; email: string; createdAt: Date; jobName: string | null }[];
  status: string;
  canManageTeamAccess: boolean;
};

export function EmployeesList({
  employees,
  view,
  jobs,
  awaitingInvites,
  status,
  canManageTeamAccess,
}: EmployeesListProps) {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;

    const query = search.toLowerCase().trim();
    return employees.filter(
      (employee) =>
        employee.identity.name?.toLowerCase().includes(query) ||
        employee.identity.email.toLowerCase().includes(query),
    );
  }, [employees, search]);

  const filteredInvites = useMemo(() => {
    if (!search.trim()) return awaitingInvites;
    const query = search.toLowerCase().trim();
    return awaitingInvites.filter((invite) => invite.email.toLowerCase().includes(query));
  }, [awaitingInvites, search]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
        <Input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex justify-end">
        {canManageTeamAccess && (
          <Button type="button" onClick={() => setInviteOpen(true)}>
            Invite employee
          </Button>
        )}
      </div>

      {status === "awaiting" ? (
        <div className="space-y-2">
          {filteredInvites.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              No awaiting invites.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="border-border bg-card flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <div className="font-medium">{invite.email}</div>
                    <div className="text-muted-foreground text-xs">
                      Job: {invite.jobName ?? "No job"} - Invited on{" "}
                      {invite.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">Awaiting</span>
                    {canManageTeamAccess && (
                      <EmployeeInviteActions inviteId={invite.id} inviteEmail={invite.email} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {view === "table" ? (
            <EmployeesTable employees={filteredEmployees} jobs={jobs} />
          ) : (
            <EmployeesCards employees={filteredEmployees} jobs={jobs} />
          )}
        </>
      )}

      <InviteEmployeeModal open={inviteOpen} onOpenChange={setInviteOpen} jobs={jobs} />
    </div>
  );
}
