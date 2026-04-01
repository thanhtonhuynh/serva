"use client";

import { Callout, LoadingButton } from "@serva/serva-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/serva-ui/components/card";
import { FieldGroup, FieldLabel } from "@serva/serva-ui/components/field";
import { Input } from "@serva/serva-ui/components/input";
import { useState, useTransition } from "react";
import { createCompanyAction, updateCompanyAction, type CompanyInput } from "./actions";

type Props = {
  mode: "create" | "edit";
  companyId?: string;
  defaultValues?: CompanyInput;
};

export function CompanyForm({ mode, companyId, defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const data: CompanyInput = { name, slug };
      const result =
        mode === "edit" && companyId
          ? await updateCompanyAction(companyId, data)
          : await createCompanyAction(data);

      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{mode === "create" ? "New Company" : "Edit Company"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Callout variant="error" message={error} />}

          <FieldGroup>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Restaurant"
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="acme-restaurant"
              required
            />
          </FieldGroup>

          <LoadingButton type="submit" loading={isPending}>
            {mode === "create" ? "Create Company" : "Save Changes"}
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}
