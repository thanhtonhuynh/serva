import { Field, FieldError, FieldGroup, FieldLabel } from "@serva/serva-ui/components/field";
import { Input } from "@serva/serva-ui/components/input";
import type { ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  fieldName: string;
  label: string;
  htmlFor: string;
};

export function InputFieldV2({
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
            <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
            <Input {...field} id={htmlFor} aria-invalid={fieldState.invalid} {...props} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
