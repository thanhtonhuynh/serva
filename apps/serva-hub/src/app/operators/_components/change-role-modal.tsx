"use client";

import { UpdateOperatorRoleInput, UpdateOperatorRoleSchema } from "@/libs/validations/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldGroup,
  FieldLabel,
  LoadingButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typography,
} from "@serva/serva-ui";
import type { DisplayOperator, RoleWithDetails } from "@serva/shared/types";
import { use, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateOperatorRoleAction } from "../actions";

type Props = {
  selectedUser: DisplayOperator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rolesPromise: Promise<RoleWithDetails[]>;
};

export function ChangeRoleModal({ selectedUser, open, onOpenChange, rolesPromise }: Props) {
  const [isPending, startTransition] = useTransition();
  const roles = use(rolesPromise);

  const form = useForm<UpdateOperatorRoleInput>({
    resolver: zodResolver(UpdateOperatorRoleSchema),
    defaultValues: {
      identityId: selectedUser.identityId,
      roleId: selectedUser.role?.id ?? "",
    },
  });

  async function onSubmit(data: UpdateOperatorRoleInput) {
    startTransition(async () => {
      const { error } = await updateOperatorRoleAction(data);
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
            <Typography variant="h2">{selectedUser.identity.name}</Typography>
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
                        variant="input"
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
