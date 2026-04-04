"use client";

import { CreateOperatorInviteInput, CreateOperatorInviteSchema } from "@/libs/validations/invite";
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
  Input,
  LoadingButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@serva/serva-ui";
import type { RoleWithDetails } from "@serva/shared";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOperatorInviteAction } from "../actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleWithDetails[];
};

export function InviteOperatorModal({ open, onOpenChange, roles }: Props) {
  const form = useForm<CreateOperatorInviteInput>({
    resolver: zodResolver(CreateOperatorInviteSchema),
    defaultValues: { name: "", email: "", roleId: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: CreateOperatorInviteInput) {
    const { error } = await createOperatorInviteAction(data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Invite sent.");
    onOpenChange(false);
    form.reset({ name: "", email: "", roleId: "" });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset({ name: "", email: "", roleId: "" });
      }}
    >
      <DialogContent>
        <DialogHeader showBorder>
          <DialogTitle>Invite operator</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            id="invite-operator-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FieldGroup>
              <Field className="space-y-1">
                <FieldLabel htmlFor="invite-operator-name">Name</FieldLabel>
                <Input
                  id="invite-operator-name"
                  type="text"
                  placeholder="Operator name"
                  {...form.register("name")}
                />
              </Field>
              <Field className="space-y-1">
                <FieldLabel htmlFor="invite-operator-email">Email</FieldLabel>
                <Input
                  id="invite-operator-email"
                  type="email"
                  placeholder="name@company.com"
                  {...form.register("email")}
                />
              </Field>
              <Controller
                name="roleId"
                control={form.control}
                render={({ field }) => (
                  <Field className="space-y-1">
                    <FieldLabel htmlFor="invite-operator-role">Role</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="invite-operator-role" variant="input">
                        <SelectValue placeholder="Select role" />
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
          </form>
        </DialogBody>
        <DialogFooter showCloseButton closeText="Cancel">
          <LoadingButton type="submit" form="invite-operator-form" loading={isSubmitting}>
            Send invite
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
