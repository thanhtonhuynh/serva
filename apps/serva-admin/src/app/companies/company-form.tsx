"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Callout,
  DialogBody,
  DialogFooter,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  LoadingButton,
} from "@serva/serva-ui";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { createCompanyAction, updateCompanyAction } from "./actions";
import { companyFormSchema, type CompanyFormValues } from "./company-schema";

type Props = {
  mode: "create" | "edit";
  companyId?: string;
  defaultValues?: CompanyFormValues;
  /** When the parent dialog opens, reset values (create clears; edit loads server data). */
  dialogOpen: boolean;
  onSuccess: () => void;
};

export function CompanyForm({ mode, companyId, defaultValues, dialogOpen, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: defaultValues ?? { name: "", slug: "" },
  });

  React.useEffect(() => {
    if (!dialogOpen) return;
    setServerError(null);
    form.reset(defaultValues ?? { name: "", slug: "" });
  }, [dialogOpen, defaultValues, form]);

  function onSubmit(data: CompanyFormValues) {
    setServerError(null);
    startTransition(async () => {
      if (mode === "edit" && companyId) {
        const result = await updateCompanyAction(companyId, data);
        if ("error" in result && result.error) {
          setServerError(result.error);
          return;
        }
        onSuccess();
        router.refresh();
        return;
      }

      const result = await createCompanyAction(data);
      if ("error" in result && result.error) {
        setServerError(result.error);
        return;
      }
      if ("companyId" in result) {
        onSuccess();
        router.refresh();
        router.push(`/companies/${result.companyId}`);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
      <DialogBody className="flex flex-col gap-4">
        {serverError && <Callout variant="error" message={serverError} />}

        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="admin-company-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="admin-company-name"
                  placeholder="Acme Restaurant"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="admin-company-slug">Slug</FieldLabel>
                <Input
                  {...field}
                  id="admin-company-slug"
                  value={field.value}
                  onChange={(e) => {
                    const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    field.onChange(v);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  placeholder="acme-restaurant"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>Lowercase letters, numbers, and hyphens only.</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </DialogBody>

      <DialogFooter showCloseButton closeText="Cancel">
        <LoadingButton type="submit" loading={isPending}>
          {mode === "create" ? "Create company" : "Save changes"}
        </LoadingButton>
      </DialogFooter>
    </form>
  );
}
