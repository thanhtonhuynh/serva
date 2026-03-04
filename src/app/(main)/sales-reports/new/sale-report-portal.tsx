"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PERMISSIONS } from "@/constants/permissions";
import { type Platform } from "@/constants/platforms";
import { useSession } from "@/contexts/SessionProvider";
import { formatVancouverDate } from "@/lib/utils";
import { SaleReportInputs, SaleReportSchema } from "@/lib/validations/report";
import { DisplayUser } from "@/types";
import { hasPermission } from "@/utils/access-control";
import { zodResolver } from "@hookform/resolvers/zod";
import { Left, Right } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveReportAction } from "./actions";
import { CashCalculatorForm } from "./cash-calculator-form";
import { EmployeeInput } from "./employee-input";
import { ReportPreview } from "./report-preview";
import { SalesDetailForm } from "./sales-detail-form";

const steps = [
  {
    id: "Step 0",
    name: "Sale Details",
    fields: [
      "totalSales",
      "cardSales",
      "platformSales",
      "expenses",
      "cardTips",
      "cashTips",
      "extraTips",
    ],
  },
  { id: "Step 1", name: "Employees", fields: ["employees"] },
  { id: "Step 2", name: "Count Cash", fields: ["cashInTill"] },
  { id: "Step 3", name: "Review", fields: [] },
  { id: "Step 4", name: "Submit", fields: [] },
];

type FieldName = keyof SaleReportInputs;

type Props = {
  usersPromise: Promise<DisplayUser[]>;
  startCashPromise: Promise<number>;
  activePlatforms: Platform[];
  initialValues?: SaleReportInputs;
  mode: "create" | "edit";
  reporterName?: string;
  reporterImage?: string | null;
  reporterUsername?: string;
};

export function SaleReportPortal({
  usersPromise,
  startCashPromise,
  activePlatforms,
  initialValues,
  mode,
  reporterName,
  reporterImage,
  reporterUsername,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const saleReportForm = useForm<SaleReportInputs>({
    resolver: zodResolver(SaleReportSchema),
    defaultValues: {
      date: initialValues?.date || new Date(),
      totalSales: initialValues?.totalSales || 0.0,
      cardSales: initialValues?.cardSales || 0.0,
      platformSales:
        initialValues?.platformSales ||
        activePlatforms.map((p) => ({ platformId: p.id, amount: 0 })),
      expenses: initialValues?.expenses || 0.0,
      expensesReason: initialValues?.expensesReason || "",
      cardTips: initialValues?.cardTips || 0.0,
      cashTips: initialValues?.cashTips || 0.0,
      extraTips: initialValues?.extraTips || 0.0,
      cashInTill: initialValues?.cashInTill || 0.0,
      employees: initialValues?.employees || [],
    },
    reValidateMode: "onBlur",
  });
  const cashCounterForm = useForm({
    defaultValues: {
      coin5c: 0,
      coin10c: 0,
      coin25c: 0,
      coin1: 0,
      coin2: 0,
      bill5: 0,
      bill10: 0,
      bill20: 0,
      bill50: 0,
      bill100: 0,
      roll5c: 0,
      roll10c: 0,
      roll25c: 0,
      roll1: 0,
      roll2: 0,
    },
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const delta = currentStep - previousStep;
  const router = useRouter();
  const { user } = useSession();

  async function processForm(data: SaleReportInputs) {
    data.date.setHours(0, 0, 0, 0);
    const { error, reportDate } = await saveReportAction(data, mode);
    if (error || !reportDate) toast.error(error);
    else {
      if (mode === "create") {
        router.push("/");
      } else {
        if (hasPermission(user?.role, PERMISSIONS.REPORTS_VIEW)) {
          router.push(`/sales-reports?date=${formatVancouverDate(reportDate)}`);
        }
      }
      toast.success("Report saved successfully.");
    }
  }

  async function nextStep() {
    const fields = steps[currentStep].fields as FieldName[];
    startTransition(async () => {
      const isValid = await saleReportForm.trigger(fields, {
        shouldFocus: true,
      });
      if (!isValid) {
        return;
      }

      if (currentStep < steps.length - 1) {
        if (currentStep === steps.length - 2) {
          await saleReportForm.handleSubmit(processForm)();
          return;
        }

        setPreviousStep(currentStep);
        setCurrentStep((step) => step + 1);
      }
    });
  }

  function prevStep() {
    if (currentStep > 0) {
      if (currentStep === steps.length - 1) {
        setPreviousStep(currentStep);
        setCurrentStep((step) => step - 2);
        return;
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="h-1 pt-2 md:h-fit">
        <ol className="flex space-x-8">
          {steps.map((step, index) => (
            <li key={step.name} className="flex-1">
              {currentStep > index ? (
                <div className="border-primary/70 text-primary/80 flex w-full flex-col border-t-4 border-l-0 py-2 pl-4 transition-colors md:border-l-0 md:pt-2 md:pb-0 md:pl-0">
                  <span className="hidden text-sm font-semibold md:block">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div className="border-primary text-primary flex w-full flex-col border-t-4 border-l-0 py-2 pl-4 md:border-l-0 md:pt-2 md:pb-0 md:pl-0">
                  <span className="hidden text-sm font-semibold md:block">{step.name}</span>
                </div>
              ) : (
                <div className="border-primary/10 flex w-full flex-col border-t-4 border-l-0 py-2 pl-4 transition-colors md:border-l-0 md:pt-2 md:pb-0 md:pl-0">
                  <span className="hidden text-sm font-semibold md:block">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {currentStep === 0 && (
        <MotionContainer delta={delta}>
          <Typography variant="h2" className="mt-2 text-center uppercase md:hidden">
            Sale Details
          </Typography>
          <Form {...saleReportForm}>
            <SalesDetailForm usersPromise={usersPromise} />
          </Form>
        </MotionContainer>
      )}

      {currentStep === 1 && (
        <MotionContainer delta={delta}>
          <Typography variant="h2" className="mt-2 text-center uppercase md:hidden">
            Employees
          </Typography>
          <EmployeeInput form={saleReportForm} usersPromise={usersPromise} />
        </MotionContainer>
      )}

      {currentStep === 2 && (
        <MotionContainer delta={delta}>
          <Typography variant="h2" className="mt-2 text-center uppercase md:hidden">
            Count Cash
          </Typography>
          <CashCalculatorForm saleReportForm={saleReportForm} cashCounterForm={cashCounterForm} />
        </MotionContainer>
      )}

      {currentStep === 3 && (
        <MotionContainer delta={delta}>
          <Typography variant="h2" className="mt-2 text-center uppercase md:hidden">
            Review
          </Typography>

          <div className="bg-background border-warning mb-2 space-y-1 rounded-xl border p-3 text-sm">
            <p className="text-warning flex items-center gap-2 font-medium">
              <TriangleAlert className="size-4" />
              Please review the report before submitting.
            </p>
            <p className="text-muted-foreground">
              You can go back to make changes or click submit when you're ready!
            </p>
          </div>

          <ReportPreview
            saleReportForm={saleReportForm}
            startCashPromise={startCashPromise}
            reporterName={reporterName}
            reporterImage={reporterImage}
            reporterUsername={reporterUsername}
          />
        </MotionContainer>
      )}

      <div className="bg-background flex justify-between rounded-xl border p-3">
        <Button
          variant={`outline`}
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex w-1/4 items-center gap-2"
        >
          <HugeiconsIcon icon={Left} />
          Back
        </Button>

        {currentStep < steps.length - 1 && (
          <LoadingButton
            type="button"
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            loading={isPending}
            className="w-1/4"
          >
            {currentStep < steps.length - 2 ? "Next" : "Save"}
            {currentStep < steps.length - 2 && <HugeiconsIcon icon={Right} />}
          </LoadingButton>
        )}
      </div>
    </div>
  );
}

function MotionContainer({ delta, children }: { delta: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="space-y-2">{children}</div>
    </motion.div>
  );
}
