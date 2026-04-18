"use client";

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
} from "@serva/serva-ui";
import type { DisplayEmployee } from "@serva/shared/types";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateEmployeeJobAction } from "../actions";

const AssignJobFormSchema = z.object({
  jobId: z.string(),
});
type AssignJobFormInput = z.infer<typeof AssignJobFormSchema>;

type JobOption = { id: string; name: string };

type Props = {
  employee: DisplayEmployee;
  jobs: JobOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssignJobModal({ employee, jobs, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AssignJobFormInput>({
    resolver: zodResolver(AssignJobFormSchema),
    defaultValues: {
      jobId: employee.job?.id ?? "__none__",
    },
  });

  async function onSubmit(data: AssignJobFormInput) {
    startTransition(async () => {
      const { error } = await updateEmployeeJobAction({
        employeeId: employee.id,
        jobId: data.jobId,
      });
      if (error) {
        toast.error(error);
      } else {
        toast.success("Job updated.");
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) form.reset({ jobId: employee.job?.id ?? "__none__" });
      }}
    >
      <DialogContent>
        <DialogHeader showBorder>
          <DialogTitle>Assign job — {employee.identity.name}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form id="assign-job-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Controller
                name="jobId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="space-y-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="assign-job-select">Job</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="assign-job-select"
                        variant="input"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select a job" />
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
          <LoadingButton type="submit" form="assign-job-form" loading={isPending}>
            {isPending ? "Saving..." : "Save"}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
