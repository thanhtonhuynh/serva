"use client";

import { type ViewMode } from "@/components/shared";
import { Button } from "@serva/serva-ui/components/button";
import { Input } from "@serva/serva-ui/components/input";
import { DisplayOperator, type RoleWithDetails } from "@serva/shared";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { InviteOperatorModal } from "./invite-operator-modal";
import { OperatorInviteActions } from "./operator-invite-actions";
import { OperatorsCards } from "./operators-cards";
import { OperatorsTable } from "./operators-table";

type Props = {
  operators: DisplayOperator[];
  view: ViewMode;
  rolesPromise: Promise<RoleWithDetails[]>;
  roles: RoleWithDetails[];
  awaitingInvites: { id: string; email: string; createdAt: Date; roleName: string | null }[];
  status: string;
  canManageTeamAccess: boolean;
};

export function OperatorsList({
  operators,
  view,
  rolesPromise,
  roles,
  awaitingInvites,
  status,
  canManageTeamAccess,
}: Props) {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const filtered = useMemo(() => {
    if (!search.trim()) return operators;
    const query = search.toLowerCase().trim();
    return operators.filter(
      (op) =>
        op.identity.name?.toLowerCase().includes(query) ||
        op.identity.email.toLowerCase().includes(query),
    );
  }, [operators, search]);

  const filteredInvites = useMemo(() => {
    if (!search.trim()) return awaitingInvites;
    const query = search.toLowerCase().trim();
    return awaitingInvites.filter((invite) => invite.email.toLowerCase().includes(query));
  }, [awaitingInvites, search]);

  return (
    <div className="space-y-6">
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
            Invite operator
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
            filteredInvites.map((invite) => (
              <div
                key={invite.id}
                className="border-border bg-card flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <div className="font-medium">{invite.email}</div>
                  <div className="text-muted-foreground text-xs">
                    Role: {invite.roleName ?? "No role"} - Invited on{" "}
                    {invite.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Awaiting</span>
                  {canManageTeamAccess && (
                    <OperatorInviteActions inviteId={invite.id} inviteEmail={invite.email} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {view === "table" ? (
            <OperatorsTable operators={filtered} rolesPromise={rolesPromise} />
          ) : (
            <OperatorsCards operators={filtered} rolesPromise={rolesPromise} />
          )}
        </>
      )}

      <InviteOperatorModal open={inviteOpen} onOpenChange={setInviteOpen} roles={roles} />
    </div>
  );
}
