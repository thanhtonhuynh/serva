"use client";

import { BILL_FIELDS, COIN_FIELDS, MONEY_FIELDS, MONEY_VALUES, ROLL_FIELDS } from "@/app/constants";
import { Typography } from "@/components/shared/typography";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SaleReportInputs } from "@/lib/validations/report";
import { CashType } from "@/types";
import { UseFormReturn } from "react-hook-form";

type Props = {
  saleReportForm: UseFormReturn<SaleReportInputs>;
  cashCounterForm: UseFormReturn<{ [key in CashType]: number }>;
};

export function CashCalculatorForm({ saleReportForm, cashCounterForm }: Props) {
  function calculateCashInTill() {
    let total = 0;
    for (const field of MONEY_FIELDS) {
      total += cashCounterForm.getValues(field) * MONEY_VALUES.get(field)!.value;
    }
    saleReportForm.setValue("cashInTill", Math.round(total * 100) / 100);
  }

  return (
    <Form {...cashCounterForm}>
      <form className="space-y-6">
        <div className="bg-primary flex flex-col items-center rounded-xl p-6">
          <Typography variant="h3" className="text-primary-foreground mb-2">
            Total Cash in Till
          </Typography>
          <FormField
            name="cashInTill"
            control={saleReportForm.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    className="text-primary-foreground text-sm font-bold"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bg-background space-y-3 rounded-xl border p-3">
            <Typography variant="h2" className="uppercase">
              Bills
            </Typography>

            <div className="flex flex-row gap-3 sm:flex-col">
              {BILL_FIELDS.map((key) => (
                <FormField
                  key={key}
                  name={key}
                  control={cashCounterForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs tracking-wide">
                        {MONEY_VALUES.get(key)!.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateCashInTill();
                          }}
                          onFocus={(e) => e.target.select()}
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="bg-background space-y-3 rounded-xl border p-3">
            <Typography variant="h2" className="uppercase">
              Coins
            </Typography>
            <div className="flex flex-row gap-3 sm:flex-col">
              {COIN_FIELDS.map((key) => (
                <FormField
                  key={key}
                  name={key}
                  control={cashCounterForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs tracking-wide">
                        {MONEY_VALUES.get(key)!.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateCashInTill();
                          }}
                          onFocus={(e) => e.target.select()}
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="bg-background space-y-3 rounded-xl border p-3">
            <Typography variant="h2" className="uppercase">
              Rolls
            </Typography>
            <div className="flex flex-row gap-3 sm:flex-col">
              {ROLL_FIELDS.map((key) => (
                <FormField
                  key={key}
                  name={key}
                  control={cashCounterForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs tracking-wide">
                        {MONEY_VALUES.get(key)!.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            calculateCashInTill();
                          }}
                          onFocus={(e) => e.target.select()}
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
