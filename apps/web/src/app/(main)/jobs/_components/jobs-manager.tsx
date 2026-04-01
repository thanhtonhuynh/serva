"use client";

import { LoadingButton } from "@serva/serva-ui/components/serva/loading-button";
import { Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@serva/serva-ui/components/dialog";
import { Field, FieldLabel } from "@serva/serva-ui/components/field";
import { Input } from "@serva/serva-ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui/components/table";
import type { Job } from "@serva/database";
import { Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createJobAction, updateJobAction } from "../actions";

type Props = {
  jobs: Job[];
  canManage: boolean;
};

export function JobsManager({ jobs, canManage }: Props) {
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<Job | null>(null);
  const [editName, setEditName] = useState("");

  function openEdit(job: Job) {
    setEditing(job);
    setEditName(job.name);
  }

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const { error } = await createJobAction({ name: newName });
      if (error) toast.error(error);
      else {
        toast.success("Job created.");
        setNewName("");
      }
    });
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      const { error } = await updateJobAction({ jobId: editing.id, name: editName });
      if (error) toast.error(error);
      else {
        toast.success("Job updated.");
        setEditing(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      {canManage && (
        <section className="space-y-3">
          <Typography variant="h2">Add job</Typography>
          <form onSubmit={submitCreate} className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
            <Field className="flex-1 space-y-1">
              <FieldLabel htmlFor="new-job-name">Name</FieldLabel>
              <Input
                id="new-job-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Chef, Server"
                disabled={isPending}
              />
            </Field>
            <LoadingButton type="submit" loading={isPending} disabled={!newName.trim()}>
              Create
            </LoadingButton>
          </form>
        </section>
      )}

      <section className="space-y-3">
        <Typography variant="h2">Jobs in this company</Typography>
        {jobs.length === 0 ? (
          <Typography variant="p-sm" className="text-muted-foreground">
            No jobs yet. Create one so you can assign employees.
          </Typography>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {canManage && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.name}</TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(job)}
                        className="gap-1"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader showBorder>
            <DialogTitle>Edit job name</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEdit}>
            <DialogBody className="space-y-4">
              <Field className="space-y-1">
                <FieldLabel htmlFor="edit-job-name">Name</FieldLabel>
                <Input
                  id="edit-job-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isPending}
                />
              </Field>
            </DialogBody>
            <DialogFooter showCloseButton closeText="Cancel">
              <LoadingButton type="submit" loading={isPending} disabled={!editName.trim()}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
