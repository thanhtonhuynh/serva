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
import { PERMISSIONS, DisplayEmployee } from "@serva/shared";
import { useSession } from "@/contexts/SessionProvider";
import { hasPermission } from "@/lib/auth/permission";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase, ShieldCheck, ShieldOff } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateEmployeeStatusAction } from "../actions";
import { AssignJobModal } from "./assign-job-modal";

type EmployeeActionsProps = {
  employee: DisplayEmployee;
  jobs: { id: string; name: string }[];
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
    title: "Deactivate employee?",
    description: "Deactivating will mark this employee record as inactive in your company.",
    confirmText: "Yes, deactivate",
    variant: "destructive",
  },
  activate: {
    title: "Activate employee?",
    description:
      "This sets the employee record to active so they can be scheduled and use employee features.",
    confirmText: "Yes, activate",
    variant: "default",
  },
  reactivate: {
    title: "Reactivate employee?",
    description: "This sets the employee record back to active.",
    confirmText: "Yes, reactivate",
    variant: "default",
  },
};

export function EmployeeActions({ employee, jobs }: EmployeeActionsProps) {
  const { identity, companyCtx } = useSession();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction["type"] | null>(null);
  const [assignJobOpen, setAssignJobOpen] = useState(false);

  const status = employee.status;
  const actionConfig = confirmAction ? CONFIRM_ACTIONS[confirmAction] : null;

  const canManageTeamAccess = hasPermission(identity, companyCtx, PERMISSIONS.TEAM_MANAGE_ACCESS);

  async function handleConfirm() {
    if (!confirmAction) return;

    startTransition(async () => {
      let result: { error?: string };

      switch (confirmAction) {
        case "deactivate":
          result = await updateEmployeeStatusAction(employee.id, "deactivated");
          if (!result.error) {
            toast.success(`${employee.identity.name} has been deactivated.`);
          }
          break;
        case "activate":
          result = await updateEmployeeStatusAction(employee.id, "active");
          if (!result.error) {
            toast.success(`${employee.identity.name} is now active.`);
          }
          break;
        case "reactivate":
          result = await updateEmployeeStatusAction(employee.id, "active");
          if (!result.error) {
            toast.success(`${employee.identity.name} has been reactivated.`);
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
          {canManageTeamAccess && (
            <DropdownMenuItem onClick={() => setAssignJobOpen(true)}>
              <Briefcase className="mr-2 h-4 w-4" />
              Assign job
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

      <AssignJobModal
        key={employee.id}
        employee={employee}
        jobs={jobs}
        open={assignJobOpen}
        onOpenChange={setAssignJobOpen}
      />

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader showBorder>
            <DialogTitle>
              {actionConfig?.title.replace("?", ` ${employee.identity.name}?`)}
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
