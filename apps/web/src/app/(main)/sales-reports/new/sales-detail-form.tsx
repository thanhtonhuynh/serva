"use client";

import { Typography } from "@/components/shared";
import { DatePickerInput } from "@/components/ui/form/date-picker-input";
import { InputFieldV2 } from "@serva/ui/components/form/input-field-v2";
import { getPlatformById } from "@serva/shared";
import { SaleReportInputs } from "@/lib/validations/report";
import { useFormContext } from "react-hook-form";

export function SalesDetailForm() {
  const form = useFormContext<SaleReportInputs>();

  return (
    <form className="space-y-6">
      <div className="bg-background space-y-3 rounded-xl border p-3">
        <DatePickerInput
          fieldName="dateStr"
          label="Date"
          htmlFor="dateStr"
          labelClassName="text-primary-dark text-base font-bold tracking-wide uppercase"
        />
      </div>

      <div className="bg-background space-y-3 rounded-xl border p-3">
        <Typography variant="h2" className="uppercase">
          Sales
        </Typography>

        <div className="grid grid-cols-2 gap-3 px-3">
          <InputFieldV2
            fieldName="totalSales"
            label="Total Sales"
            htmlFor="totalSales"
            placeholder="0.00"
            type="number"
          />

          <InputFieldV2
            fieldName="cardSales"
            label="Card Net Sales"
            htmlFor="cardSales"
            placeholder="0.00"
            type="number"
          />
        </div>

        <Typography variant="h3">Online Platforms Sales</Typography>

        <div className="grid grid-cols-2 gap-3 px-3 md:auto-cols-fr md:grid-flow-col">
          {form.getValues("platformSales")?.map((platform, index) => {
            const platformInfo = getPlatformById(platform.platformId);
            if (!platformInfo) return null;

            return (
              <InputFieldV2
                key={platform.platformId}
                fieldName={`platformSales.${index}.amount`}
                label={platformInfo.label}
                htmlFor={`platformSales.${index}.amount`}
                placeholder="0.00"
                type="number"
              />
            );
          })}
        </div>
      </div>

      <div className="bg-background space-y-3 rounded-xl border p-3">
        <Typography variant="h2" className="uppercase">
          Expenses
        </Typography>

        <div className="px-3">
          <InputFieldV2
            fieldName="expenses"
            label="Amount"
            htmlFor="expenses"
            placeholder="0.00"
            type="number"
          />

          <InputFieldV2
            fieldName="expensesReason"
            label="Reason"
            htmlFor="expensesReason"
            placeholder="e.g., lime"
          />
        </div>
      </div>

      <div className="bg-background space-y-3 rounded-xl border p-3">
        <Typography variant="h2" className="uppercase">
          Tips
        </Typography>

        <div className="grid grid-cols-3 gap-3 px-3">
          <InputFieldV2
            fieldName="cardTips"
            label="Card"
            htmlFor="cardTips"
            placeholder="0.00"
            type="number"
          />

          <InputFieldV2
            fieldName="cashTips"
            label="Cash"
            htmlFor="cashTips"
            placeholder="0.00"
            type="number"
          />

          <InputFieldV2
            fieldName="extraTips"
            label="Extra"
            htmlFor="extraTips"
            placeholder="0.00"
            type="number"
          />
        </div>
      </div>
    </form>
  );
}
