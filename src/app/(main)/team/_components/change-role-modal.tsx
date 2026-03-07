"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Typography } from "@/components/shared";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateEmployeeRoleInput, UpdateEmployeeRoleSchema } from "@/lib/validations/employee";
import { DisplayUser } from "@/types";
import type { RoleWithDetails } from "@/types/rbac";
import { zodResolver } from "@hookform/resolvers/zod";
import { use, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateUserRoleAction } from "../_actions";

type Props = {
  selectedUser: DisplayUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rolesPromise: Promise<RoleWithDetails[]>;
};

export function ChangeRoleModal({ selectedUser, open, onOpenChange, rolesPromise }: Props) {
  const [isPending, startTransition] = useTransition();
  const roles = use(rolesPromise);

  const form = useForm<UpdateEmployeeRoleInput>({
    resolver: zodResolver(UpdateEmployeeRoleSchema),
    defaultValues: {
      userId: selectedUser.id,
      roleId: "",
    },
  });

  async function onSubmit(data: UpdateEmployeeRoleInput) {
    startTransition(async () => {
      const { error } = await updateUserRoleAction(data);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Role updated.");
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) form.reset();
      }}
    >
      <DialogContent>
        <DialogHeader showBorder>
          <DialogTitle>Change role</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <div className="space-y-1">
            <Typography variant="h2">{selectedUser.name}</Typography>
            <Typography variant="p" className="font-semibold">
              Current role: {selectedUser.role?.name ?? "No Role"}
            </Typography>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Controller
                name="roleId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="select-role" className="flex flex-col gap-1 font-normal">
                      <span>Select a new role for the team member. </span>
                      <span>This will change their permissions in the system.</span>
                    </FieldLabel>

                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="select-role"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select a role">
                          {roles.find((role) => role.id === field.value)?.name ?? "Select a role"}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent alignItemWithTrigger={false}>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter showCloseButton closeText="Cancel">
              <LoadingButton loading={isPending} type="submit">
                {isPending ? "Saving..." : "Save"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
