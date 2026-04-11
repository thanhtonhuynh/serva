"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@serva/serva-ui";
import * as React from "react";
import { CompanyForm } from "./company-form";

export function NewCompanyDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        New Company
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New company</DialogTitle>
            <DialogDescription>Add a company to the platform.</DialogDescription>
          </DialogHeader>
          <CompanyForm mode="create" dialogOpen={open} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

type EditCompanyDialogProps = {
  companyId: string;
  name: string;
  slug: string;
};

export function EditCompanyDialog({ companyId, name, slug }: EditCompanyDialogProps) {
  const [open, setOpen] = React.useState(false);
  const defaultValues = React.useMemo(() => ({ name, slug }), [name, slug]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {name}</DialogTitle>
            <DialogDescription>Update the company name and slug.</DialogDescription>
          </DialogHeader>
          <CompanyForm
            mode="edit"
            companyId={companyId}
            defaultValues={defaultValues}
            dialogOpen={open}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
