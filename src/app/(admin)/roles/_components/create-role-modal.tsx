"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Typography } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ICONS } from "@/constants/icons";
import { CreateRoleInput, CreateRoleSchema } from "@/lib/validations/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { Permission } from "@prisma/client";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createRoleAction } from "../actions";

type CreateRoleModalProps = {
  permissionsGrouped: Record<string, Permission[]>;
};

export function CreateRoleModal({ permissionsGrouped }: CreateRoleModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateRoleInput>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  async function onSubmit(data: CreateRoleInput) {
    startTransition(async () => {
      const result = await createRoleAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Role created successfully.");
        setOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) form.reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <HugeiconsIcon icon={ICONS.ADD} />
            Add new role
          </Button>
        }
      />

      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader showBorder>
          <DialogTitle>New role</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DialogBody className="space-y-6">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldContent className="gap-0">
                      <FieldLabel htmlFor="create-role-name">Role name</FieldLabel>
                      <FieldDescription>Role name must be unique.</FieldDescription>
                    </FieldContent>

                    <Input
                      {...field}
                      id="create-role-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g., Shift Lead"
                    />

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
                    <FieldLabel htmlFor="create-role-description">
                      Description (optional)
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="create-role-description"
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
                                  id={`create-role-permission-${permission.id}`}
                                  name={field.name}
                                  aria-invalid={fieldState.invalid}
                                  checked={field.value.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value, permission.id]
                                      : field.value.filter((id) => id !== permission.id);
                                    field.onChange(newValue);
                                  }}
                                />
                                <FieldContent className="gap-0">
                                  <FieldLabel
                                    htmlFor={`create-role-permission-${permission.id}`}
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
              {isPending ? "Creating..." : "Create"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
