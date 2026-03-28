"use client";

import { SIcon } from "@/components/shared";
import { Field, FieldError, FieldGroup, FieldLabel } from "@serva/ui/components/field";
import { isValidDate, parseInUTC } from "@serva/shared";
import { format } from "date-fns";
import { useState, type ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Calendar } from "@serva/ui/components/calendar";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@serva/ui/components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@serva/ui/components/popover";

type Props = {
  fieldName: string;
  label: string;
  htmlFor: string;
  labelClassName?: string;
};

export function DatePickerInput({
  fieldName,
  label,
  htmlFor,
  labelClassName,
  ...props
}: Props & ComponentProps<"input">) {
  const form = useFormContext();
  const [open, setOpen] = useState(false);

  const defaultDate = parseInUTC(form.getValues(fieldName) ?? "");
  const [month, setMonth] = useState<Date>(defaultDate);
  const [date, setDate] = useState<Date>(defaultDate);

  return (
    <FieldGroup>
      <Controller
        name={fieldName}
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="sm:w-74 w-full gap-1.5">
            <FieldLabel htmlFor={htmlFor} className={labelClassName}>
              {label}
            </FieldLabel>

            <InputGroup>
              <InputGroupInput
                {...field}
                id={htmlFor}
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  field.onChange(e.target.value);
                  if (isValidDate(date)) {
                    setMonth(date);
                    setDate(date);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
                {...props}
              />
              <InputGroupAddon align="inline-end">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger
                    render={
                      <InputGroupButton
                        id="date-picker"
                        variant="accent"
                        size="icon-xs"
                        aria-label="Select date"
                      >
                        <SIcon icon="CALENDAR" />
                        <span className="sr-only">Select date</span>
                      </InputGroupButton>
                    }
                  />

                  <PopoverContent
                    className="w-full p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        if (!date) return;
                        field.onChange(format(date, "yyyy-MM-dd"));
                        setDate(date);
                        setOpen(false);
                      }}
                      month={month}
                      onMonthChange={setMonth}
                      weekStartsOn={1}
                      captionLayout="dropdown"
                      startMonth={new Date(2024, 9)}
                    />
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
            </InputGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
