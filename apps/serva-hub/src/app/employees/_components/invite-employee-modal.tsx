"use client";

import { CreateEmployeeInviteInput, CreateEmployeeInviteSchema } from "@/libs/validations/invite";
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
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createEmployeeInviteAction } from "../actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: { id: string; name: string }[];
};

export function InviteEmployeeModal({ open, onOpenChange, jobs }: Props) {
  const form = useForm<CreateEmployeeInviteInput>({
    resolver: zodResolver(CreateEmployeeInviteSchema),
    defaultValues: { name: "", email: "", jobId: "__none__" },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: CreateEmployeeInviteInput) {
    const { error } = await createEmployeeInviteAction(data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Invite sent.");
    onOpenChange(false);
    form.reset({ name: "", email: "", jobId: "__none__" });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) form.reset({ name: "", email: "", jobId: "__none__" });
      }}
    >
      <DialogContent>
        <DialogHeader showBorder>
          <DialogTitle>Invite employee</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            id="invite-employee-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FieldGroup>
              <Field className="space-y-1">
                <FieldLabel htmlFor="invite-employee-name">Name</FieldLabel>
                <Input
                  id="invite-employee-name"
                  type="text"
                  placeholder="Employee name"
                  {...form.register("name")}
                />
              </Field>
              <Field className="space-y-1">
                <FieldLabel htmlFor="invite-employee-email">Email</FieldLabel>
                <Input
                  id="invite-employee-email"
                  type="email"
                  placeholder="name@company.com"
                  {...form.register("email")}
                />
              </Field>
              <Controller
                name="jobId"
                control={form.control}
                render={({ field }) => (
                  <Field className="space-y-1">
                    <FieldLabel htmlFor="invite-employee-job">Default job (optional)</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="invite-employee-job" variant="input">
                        <SelectValue placeholder="No job" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectItem value="__none__">No job</SelectItem>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.name}
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
          <LoadingButton type="submit" form="invite-employee-form" loading={isSubmitting}>
            Send invite
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
