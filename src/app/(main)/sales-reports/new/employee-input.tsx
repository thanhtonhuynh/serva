"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SaleReportInputs } from "@/lib/validations/report";
import { DisplayUser } from "@/types";
import { Plus, X } from "lucide-react";
import { use } from "react";
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { EmployeeCombobox } from "./employee-combobox";

type Props = {
  form: UseFormReturn<SaleReportInputs>;
  usersPromise: Promise<DisplayUser[]>;
};

export function EmployeeInput({ form, usersPromise }: Props) {
  const users = use(usersPromise);
  const employees = useFieldArray({
    control: form.control,
    name: "employees",
  });

  const selectedUserIds = form
    .watch("employees")
    .map((e) => e.userId)
    .filter(Boolean);

  function handleSelectUser(index: number, user: DisplayUser) {
    const currentItem = form.getValues(`employees.${index}`);

    employees.update(index, {
      ...currentItem,
      userId: user.id,
      name: user.name,
      image: user.image || undefined,
    });
  }
  return (
    <div className="bg-background space-y-3 rounded-xl border p-3">
      <div className="space-y-3">
        {employees.fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-1">
            <FieldGroup>
              <Controller
                control={form.control}
                name={`employees.${index}.userId` as const}
                render={({ field: userField, fieldState }) => (
                  <Field aria-invalid={fieldState.invalid} className="gap-1">
                    <EmployeeCombobox
                      users={users}
                      selectedUserId={userField.value}
                      selectedUserIds={selectedUserIds}
                      onSelect={(user) => handleSelectUser(index, user)}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} className="ml-3" />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup className="w-20 shrink-0">
              <Controller
                control={form.control}
                name={`employees.${index}.hour`}
                render={({ field: hourField, fieldState }) => (
                  <Field aria-invalid={fieldState.invalid}>
                    <Input
                      type="number"
                      step="0.25"
                      {...hourField}
                      onChange={(e) =>
                        hourField.onChange(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      onFocus={(e) => e.target.select()}
                      className="text-sm"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              variant="ghost"
              type="button"
              size={"icon-sm"}
              className="text-muted-foreground hover:text-destructive mt-1"
              onClick={() => employees.remove(index)}
            >
              <X />
              <span className="sr-only">Remove employee</span>
            </Button>
          </div>
        ))}

        <FieldError errors={[form.formState.errors.employees]} />

        <Button
          variant={"outline"}
          type="button"
          className="mt-3"
          size={"sm"}
          onClick={() =>
            employees.append({ userId: "", hour: 0, name: "" }, { shouldFocus: false })
          }
        >
          <Plus />
          Add an employee
        </Button>
      </div>
    </div>
  );
}
