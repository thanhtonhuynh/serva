"use client";

import { BILL_FIELDS, COIN_FIELDS, MONEY_FIELDS, MONEY_VALUES, ROLL_FIELDS } from "@/app/constants";
import { Typography } from "@/components/shared/typography";
import { Card } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import type { CashType } from "@/types";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export function CashCalculator() {
  const form = useForm<{ [key in CashType]: string }>({
    defaultValues: {
      coin5c: "",
      coin10c: "",
      coin25c: "",
      coin1: "",
      coin2: "",
      bill5: "",
      bill10: "",
      bill20: "",
      bill50: "",
      bill100: "",
      roll5c: "",
      roll10c: "",
      roll25c: "",
      roll1: "",
      roll2: "",
    },
  });
  const [total, setTotal] = useState(0);

  function calculateCashInTill() {
    setTotal(
      MONEY_FIELDS.reduce((acc, field) => {
        return acc + (Number(form.getValues(field)) ?? 0) * MONEY_VALUES.get(field)!.value;
      }, 0),
    );
  }

  return (
    <form className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="bg-primary gap-3 p-6">
        <Typography variant="h2" className="text-primary-foreground uppercase">
          Total Cash in Till
        </Typography>
        <span className="text-primary-foreground text-xl font-bold">{formatMoney(total)}</span>
      </Card>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <Typography variant="h2">Bills</Typography>

          <div className="flex flex-row gap-3 sm:flex-col">
            {BILL_FIELDS.map((key) => (
              <FieldGroup key={key}>
                <Controller
                  name={key}
                  control={form.control}
                  render={({ field }) => (
                    <Field className="space-y-1">
                      <FieldLabel>{MONEY_VALUES.get(key)!.label}</FieldLabel>
                      <Input
                        {...field}
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
        </Card>

        <Card className="p-6">
          <Typography variant="h2">Coins</Typography>

          <div className="flex flex-row gap-3 sm:flex-col">
            {COIN_FIELDS.map((key) => (
              <FieldGroup key={key}>
                <Controller
                  name={key}
                  control={form.control}
                  render={({ field }) => (
                    <Field className="space-y-1">
                      <FieldLabel>{MONEY_VALUES.get(key)!.label}</FieldLabel>
                      <Input
                        {...field}
                        placeholder="0"
                        type="number"
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
        </Card>

        <Card className="p-6">
          <Typography variant="h2">Rolls</Typography>

          <div className="flex flex-row gap-3 sm:flex-col">
            {ROLL_FIELDS.map((key) => (
              <FieldGroup key={key}>
                <Controller
                  name={key}
                  control={form.control}
                  render={({ field }) => (
                    <Field className="space-y-1">
                      <FieldLabel>{MONEY_VALUES.get(key)!.label}</FieldLabel>
                      <Input
                        {...field}
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
        </Card>
      </div>
    </form>
  );
}
