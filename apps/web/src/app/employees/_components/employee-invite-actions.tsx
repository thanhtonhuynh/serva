"use client";

import { Button } from "@serva/serva-ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@serva/serva-ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@serva/serva-ui/components/dropdown-menu";
import { ICONS } from "@serva/serva-ui/constants/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Ban, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEmployeeInviteAction, revokeEmployeeInviteAction } from "../actions";

type Props = {
  inviteId: string;
  inviteEmail: string;
  disabled?: boolean;
};

type ConfirmAction = "revoke" | "delete";

export function EmployeeInviteActions({ inviteId, inviteEmail, disabled = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const isDelete = confirmAction === "delete";

  function handleConfirm() {
    if (!confirmAction) return;
    startTransition(async () => {
      const result =
        confirmAction === "revoke"
          ? await revokeEmployeeInviteAction(inviteId)
          : await deleteEmployeeInviteAction(inviteId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(confirmAction === "revoke" ? "Invite revoked." : "Invite deleted.");
      }
      setConfirmAction(null);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={disabled}>
              <HugeiconsIcon icon={ICONS.MORE_HORIZONTAL} />
              <span className="sr-only">Open invite actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setConfirmAction("revoke")} disabled={disabled}>
            <Ban className="mr-2 h-4 w-4" />
            Revoke
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmAction("delete")}
            disabled={disabled}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader showBorder>
            <DialogTitle>
              {isDelete ? "Delete invite" : "Revoke invite"} for {inviteEmail}?
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {isDelete
              ? "This permanently removes the invite record."
              : "This marks the invite as revoked and prevents acceptance."}
          </DialogBody>
          <DialogFooter showCloseButton closeText="Cancel">
            <Button
              variant={isDelete ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isDelete ? "Delete" : "Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
