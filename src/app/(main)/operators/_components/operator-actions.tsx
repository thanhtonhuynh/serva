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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICONS } from "@/constants/icons";
import { PERMISSIONS } from "@/constants/permissions";
import { useSession } from "@/contexts/SessionProvider";
import { hasPermission } from "@/lib/auth/permission";
import { DisplayOperator } from "@/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOperatorStatusAction } from "../actions";

type Props = {
  operator: DisplayOperator;
  onChangeRole: () => void;
};

type ConfirmAction = {
  type: "deactivate" | "activate" | "reactivate";
  title: string;
  description: string;
  confirmText: string;
  variant: "destructive" | "default";
};

const CONFIRM_ACTIONS: Record<ConfirmAction["type"], Omit<ConfirmAction, "type">> = {
  deactivate: {
    title: "Deactivate operator?",
    description:
      "Deactivating will mark this operator record as inactive for your company (RBAC access).",
    confirmText: "Yes, deactivate",
    variant: "destructive",
  },
  activate: {
    title: "Activate operator?",
    description:
      "This sets the operator record to active so they can use dashboard permissions for this company.",
    confirmText: "Yes, activate",
    variant: "default",
  },
  reactivate: {
    title: "Reactivate operator?",
    description: "This sets the operator record back to active.",
    confirmText: "Yes, reactivate",
    variant: "default",
  },
};

export function OperatorActions({ operator, onChangeRole }: Props) {
  const { identity, companyCtx } = useSession();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction["type"] | null>(null);

  const status = operator.status;
  const actionConfig = confirmAction ? CONFIRM_ACTIONS[confirmAction] : null;

  const canManageTeamAccess = hasPermission(identity, companyCtx, PERMISSIONS.TEAM_MANAGE_ACCESS);
  const canAssignRole = hasPermission(identity, companyCtx, PERMISSIONS.TEAM_ASSIGN_ROLES);

  async function handleConfirm() {
    if (!confirmAction) return;

    startTransition(async () => {
      let result: { error?: string };

      switch (confirmAction) {
        case "deactivate":
          result = await updateOperatorStatusAction(operator.id, "deactivated");
          if (!result.error) {
            toast.success(`${operator.identity.name} has been deactivated.`);
          }
          break;
        case "activate":
          result = await updateOperatorStatusAction(operator.id, "active");
          if (!result.error) {
            toast.success(`${operator.identity.name} is now active.`);
          }
          break;
        case "reactivate":
          result = await updateOperatorStatusAction(operator.id, "active");
          if (!result.error) {
            toast.success(`${operator.identity.name} has been reactivated.`);
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
          {canAssignRole && (
            <DropdownMenuItem
              onClick={() => {
                onChangeRole();
              }}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Change role
            </DropdownMenuItem>
          )}

          {status === "active" && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmAction("deactivate")}
              disabled={!canManageTeamAccess}
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          )}

          {status === "awaiting" && (
            <DropdownMenuItem
              onClick={() => setConfirmAction("activate")}
              disabled={!canManageTeamAccess}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Activate
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

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader showBorder>
            <DialogTitle>
              {actionConfig?.title.replace("?", ` ${operator.identity.name}?`)}
            </DialogTitle>
          </DialogHeader>

          <DialogBody>{actionConfig?.description}</DialogBody>

          <DialogFooter showCloseButton closeText="Cancel">
            <Button variant={actionConfig?.variant} onClick={handleConfirm} disabled={isPending}>
              {actionConfig?.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
