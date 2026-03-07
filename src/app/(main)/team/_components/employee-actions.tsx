"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICONS } from "@/constants/icons";
import { PERMISSIONS } from "@/constants/permissions";
import { useSession } from "@/contexts/SessionProvider";
import { DisplayUser } from "@/types";
import type { RoleWithDetails } from "@/types/rbac";
import { hasPermission } from "@/utils/access-control";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { activateUserAction, deactivateUserAction } from "../_actions";
import { ChangeRoleModal } from "./change-role-modal";

type EmployeeActionsProps = {
  employee: DisplayUser;
  rolesPromise: Promise<RoleWithDetails[]>;
};

type ConfirmAction = {
  type: "deactivate" | "verify" | "reactivate";
  title: string;
  description: string;
  confirmText: string;
  variant: "destructive" | "default";
};

const CONFIRM_ACTIONS: Record<ConfirmAction["type"], Omit<ConfirmAction, "type">> = {
  deactivate: {
    title: "Deactivate employee?",
    description: "Deactivating will revoke their access to the system.",
    confirmText: "Yes, deactivate",
    variant: "destructive",
  },
  verify: {
    title: "Grant access?",
    description:
      "User will have general access to the system. You can then assign them a specific role.",
    confirmText: "Yes, grant access",
    variant: "default",
  },
  reactivate: {
    title: "Reactivate employee?",
    description: "Reactivating will grant them access to the system again.",
    confirmText: "Yes, reactivate",
    variant: "default",
  },
};

export function EmployeeActions({ employee, rolesPromise }: EmployeeActionsProps) {
  const { user } = useSession();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction["type"] | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const status = employee.accountStatus;
  const actionConfig = confirmAction ? CONFIRM_ACTIONS[confirmAction] : null;

  const canManageTeamAccess = hasPermission(user?.role, PERMISSIONS.TEAM_MANAGE_ACCESS);
  const canAssignRole = hasPermission(user?.role, PERMISSIONS.TEAM_ASSIGN_ROLES);

  async function handleConfirm() {
    if (!confirmAction) return;

    startTransition(async () => {
      let result: { error?: string };

      switch (confirmAction) {
        case "deactivate":
          result = await deactivateUserAction(employee.id);
          if (!result.error) {
            toast.success(`${employee.name} has been deactivated.`);
          }
          break;
        case "verify":
          result = await activateUserAction(employee.id);
          if (!result.error) {
            toast.success(`${employee.name} has been verified.`);
          }
          break;
        case "reactivate":
          result = await activateUserAction(employee.id);
          if (!result.error) {
            toast.success(`${employee.name} has been reactivated.`);
          }
          break;
      }

      if (result.error) {
        toast.error(result.error);
      }

      setConfirmAction(null);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HugeiconsIcon icon={ICONS.MORE_HORIZONTAL} />
              <span className="sr-only">Open menu</span>
            </Button>
          }
        />

        <DropdownMenuContent align="end">
          {status === "active" && (
            <>
              <DropdownMenuItem onClick={() => setRoleDialogOpen(true)} disabled={!canAssignRole}>
                <UserCog className="mr-2 h-4 w-4" />
                Change role
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmAction("deactivate")}
                disabled={!canManageTeamAccess}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            </>
          )}

          {status === "inactive" && (
            <DropdownMenuItem
              onClick={() => setConfirmAction("verify")}
              disabled={!canManageTeamAccess}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Grant access
            </DropdownMenuItem>
          )}

          {status === "deactivated" && (
            <DropdownMenuItem
              onClick={() => setConfirmAction("reactivate")}
              disabled={!canManageTeamAccess}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Reactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader showBorder>
            <DialogTitle>{actionConfig?.title.replace("?", ` ${employee.name}?`)}</DialogTitle>
          </DialogHeader>

          <DialogBody>{actionConfig?.description}</DialogBody>

          <DialogFooter showCloseButton closeText="Cancel">
            <Button variant={actionConfig?.variant} onClick={handleConfirm} disabled={isPending}>
              {actionConfig?.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <ChangeRoleModal
        selectedUser={employee}
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        rolesPromise={rolesPromise}
      />
    </>
  );
}
