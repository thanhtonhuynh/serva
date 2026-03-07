"use client";

import { Typography } from "@/components/shared";
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
import type { RoleWithDetails } from "@/types/rbac";
import { HugeiconsIcon } from "@hugeicons/react";
import { Permission } from "@prisma/client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteRoleAction } from "../actions";
import { EditRoleModal } from "./edit-role-modal";

type RoleActionsProps = {
  role: RoleWithDetails;
  permissionsGrouped: Record<string, Permission[]>;
};

export function RoleActions({ role, permissionsGrouped }: RoleActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const canDelete = role.editable;

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteRoleAction(role.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Role "${role.name}" has been deleted.`);
      }
      setShowDeleteModal(false);
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
          <DropdownMenuItem onClick={() => setShowEditModal(true)}>
            <HugeiconsIcon icon={ICONS.EDIT} />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!canDelete}
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            <HugeiconsIcon icon={ICONS.DELETE} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRoleModal
        role={role}
        permissionsGrouped={permissionsGrouped}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader showBorder>
            <DialogTitle>Delete role "{role.name}"?</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-6">
            <Typography
              variant="p-sm"
              className="text-warning flex items-center gap-2 font-semibold"
            >
              <HugeiconsIcon icon={ICONS.ALERT} className="size-4" strokeWidth={2} />
              This role is currently assigned to {role._count.users} members.
            </Typography>

            <Typography variant="p-sm">
              <div className="font-semibold">Are you sure you want to delete this role?</div>
              <div>Members with this role will have "No role" assigned to them.</div>
            </Typography>
          </DialogBody>

          <DialogFooter showCloseButton closeText="Cancel">
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
