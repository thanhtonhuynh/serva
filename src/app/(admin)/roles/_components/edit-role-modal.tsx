"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Typography } from "@/components/shared";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UpdateRoleInput, UpdateRoleSchema } from "@/lib/validations/roles";
import type { RoleWithDetails } from "@/types/rbac";
import { zodResolver } from "@hookform/resolvers/zod";
import { Permission } from "@prisma/client";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateRoleAction } from "../actions";

type EditRoleModalProps = {
  role: RoleWithDetails;
  permissionsGrouped: Record<string, Permission[]>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditRoleModal({
  role,
  permissionsGrouped,
  open,
  onOpenChange,
}: EditRoleModalProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateRoleInput>({
    resolver: zodResolver(UpdateRoleSchema),
    defaultValues: {
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      permissionIds: role.permissions.map((p) => p.id),
    },
  });
  const isAdminRole = role.name.toLowerCase() === "admin";

  async function onSubmit(data: UpdateRoleInput) {
    startTransition(async () => {
      const result = await updateRoleAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Role updated successfully.");
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
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader showBorder>
          <DialogTitle>Edit role: {role.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DialogBody className="space-y-6">
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="gap-0">
                      <FieldLabel htmlFor="edit-role-name">Name</FieldLabel>
                      <FieldDescription>Role name must be unique.</FieldDescription>
                    </FieldContent>

                    <Input
                      {...field}
                      id="edit-role-name"
                      placeholder="e.g., Shift Lead"
                      aria-invalid={fieldState.invalid}
                      disabled={!role.editable}
                    />

                    {!role.editable && (
                      <Typography variant="p-xs" className="text-muted-foreground">
                        Default role names cannot be changed
                      </Typography>
                    )}

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-role-description">Description (optional)</FieldLabel>
                    <Textarea
                      {...field}
                      id="edit-role-description"
                      aria-invalid={fieldState.invalid}
                      placeholder="Brief description of this role's responsibilities"
                      className="resize-none"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <Controller
                name="permissionIds"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid}>
                    <FieldLegend variant="label">Permissions</FieldLegend>
                    <FieldGroup data-slot="checkbox-group">
                      {Object.entries(permissionsGrouped).map(([resource, permissions]) => (
                        <div key={resource} className="space-y-2">
                          <Typography variant="p-sm" className="font-medium capitalize">
                            {resource.replace("_", " ")}
                          </Typography>
                          <div className="ml-2 space-y-1">
                            {permissions.map((permission) => (
                              <Field
                                key={permission.id}
                                orientation="horizontal"
                                data-invalid={fieldState.invalid}
                              >
                                <Checkbox
                                  id={`edit-role-permission-${permission.id}`}
                                  name={field.name}
                                  aria-invalid={fieldState.invalid}
                                  disabled={!role.editable}
                                  checked={isAdminRole ? true : field.value.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value, permission.id]
                                      : field.value.filter((id) => id !== permission.id);
                                    field.onChange(newValue);
                                  }}
                                />
                                <FieldContent className="gap-0">
                                  <FieldLabel
                                    htmlFor={`edit-role-permission-${permission.id}`}
                                    className="font-normal"
                                  >
                                    {permission.name}
                                  </FieldLabel>
                                  <FieldDescription>{permission.description}</FieldDescription>
                                </FieldContent>
                              </Field>
                            ))}
                          </div>
                        </div>
                      ))}
                    </FieldGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldSet>
                )}
              />
            </FieldGroup>
          </DialogBody>

          <DialogFooter showCloseButton closeText="Cancel">
            <LoadingButton loading={isPending} type="submit">
              {isPending ? "Saving..." : "Save changes"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
