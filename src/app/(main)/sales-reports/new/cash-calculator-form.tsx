"use client";

import { BILL_FIELDS, COIN_FIELDS, MONEY_FIELDS, MONEY_VALUES, ROLL_FIELDS } from "@/app/constants";
import { Typography } from "@/components/shared/typography";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SaleReportInputs } from "@/lib/validations/report";
import { CashType } from "@/types";
import { Controller, UseFormReturn } from "react-hook-form";

type Props = {
  saleReportForm: UseFormReturn<SaleReportInputs>;
  cashCounterForm: UseFormReturn<{ [key in CashType]: string }>;
};

export function CashCalculatorForm({ saleReportForm, cashCounterForm }: Props) {
  function calculateCashInTill() {
    let total = 0;
    for (const field of MONEY_FIELDS) {
      total += (Number(cashCounterForm.getValues(field)) * MONEY_VALUES.get(field)!.value) / 100;
    }
    saleReportForm.setValue("cashInTill", Math.round(total * 100) / 100);
  }

  return (
    <form className="space-y-6">
      <div className="bg-primary flex flex-col items-center rounded-xl p-6">
        <FieldGroup>
          <Controller
            name="cashInTill"
            control={saleReportForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <FieldLabel
                  htmlFor="cashInTill"
                  className="text-primary-foreground font-semibold tracking-wide uppercase"
                >
                  Total Cash in Till
                </FieldLabel>
                <Input
                  {...field}
                  value={field.value as string}
                  onChange={(e) => field.onChange(e.target.value)}
                  id="cashInTill"
                  aria-invalid={fieldState.invalid}
                  type="number"
                  className="text-primary-foreground placeholder:text-primary-foreground/70 font-bold"
                  placeholder="0.00"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-background space-y-3 rounded-xl border p-3">
          <Typography variant="h2" className="uppercase">
            Bills
          </Typography>

          <div className="flex flex-row gap-3 sm:flex-col">
            {BILL_FIELDS.map((key) => (
              <FieldGroup key={key}>
                <Controller
                  name={key}
                  control={cashCounterForm.control}
                  render={({ field }) => (
                    <Field className="gap-1.5">
                      <FieldLabel htmlFor={key}>{MONEY_VALUES.get(key)!.label}</FieldLabel>
                      <Input
                        {...field}
                        id={key}
                        type="number"
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          calculateCashInTill();
                        }}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            ))}
          </div>
        </div>

        <div className="bg-background space-y-3 rounded-xl border p-3">
          <Typography variant="h2" className="uppercase">
            Coins
          </Typography>
          <div className="flex flex-row gap-3 sm:flex-col">
            {COIN_FIELDS.map((key) => (
              <FieldGroup key={key}>
                <Controller
                  name={key}
                  control={cashCounterForm.control}
                  render={({ field }) => (
                    <Field className="gap-1.5">
                      <FieldLabel htmlFor={key}>{MONEY_VALUES.get(key)!.label}</FieldLabel>
                      <Input
                        {...field}
                        id={key}
                        type="number"
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          calculateCashInTill();
                        }}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            ))}
          </div>
        </div>

        <div className="bg-background space-y-3 rounded-xl border p-3">
          <Typography variant="h2" className="uppercase">
            Rolls
          </Typography>
          <div className="flex flex-row gap-3 sm:flex-col">
            {ROLL_FIELDS.map((key) => (
              <FieldGroup key={key}>
                <Controller
                  name={key}
                  control={cashCounterForm.control}
                  render={({ field }) => (
                    <Field className="gap-1.5">
                      <FieldLabel htmlFor={key}>{MONEY_VALUES.get(key)!.label}</FieldLabel>
                      <Input
                        {...field}
                        id={key}
                        type="number"
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          calculateCashInTill();
                        }}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
