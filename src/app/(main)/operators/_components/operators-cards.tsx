"use client";

import { DisplayOperator } from "@/types";
import type { RoleWithDetails } from "@/types/rbac";
import { useState } from "react";
import { ChangeRoleModal } from "./change-role-modal";
import { OperatorActions } from "./operator-actions";
import { OperatorCard } from "./operator-card";

type Props = {
  operators: DisplayOperator[];
  rolesPromise: Promise<RoleWithDetails[]>;
};

export function OperatorsCards({ operators, rolesPromise }: Props) {
  const [roleModalUser, setRoleModalUser] = useState<DisplayOperator | null>(null);

  if (operators.length === 0) {
    return <div className="text-muted-foreground py-8 text-center">No results found.</div>;
  }

  return (
    <>
      <section className="grid gap-6 md:grid-cols-2">
        {operators.map((operator) => (
          <OperatorCard
            key={operator.id}
            user={operator}
            actions={
              <OperatorActions
                operator={operator}
                onChangeRole={() => setRoleModalUser(operator)}
              />
            }
          />
        ))}
      </section>

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
