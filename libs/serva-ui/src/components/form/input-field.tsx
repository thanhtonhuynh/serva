import type { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "../../lib/utils";
import { Field, FieldError, FieldGroup, FieldLabel } from "../field";
import { Input } from "../input";

type Props = {
  fieldName: string;
  label?: string;
  htmlFor: string;
};

export function InputField({
  fieldName,
  label,
  htmlFor,
  ...props
}: Props & ComponentProps<"input">) {
  const form = useFormContext();

  return (
    <FieldGroup>
      <Controller
        name={fieldName}
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1.5">
            <FieldLabel htmlFor={htmlFor} className={cn(!label && "sr-only")}>
              {label}
            </FieldLabel>
            <Input {...field} id={htmlFor} aria-invalid={fieldState.invalid} {...props} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
