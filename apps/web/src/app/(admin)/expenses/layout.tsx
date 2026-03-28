import { Header } from "@/components/layout";
import { Container } from "@serva/ui/components/serva/container";
import { Typography } from "@serva/ui";
import { Button } from "@serva/ui/components/button";
import { ICONS } from "@serva/ui/constants/icons";
import { authGuard } from "@/lib/auth/authorize";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { HugeiconsIcon } from "@hugeicons/react";
import { Fragment } from "react";
import { AddExpenseModal, PeriodSelector } from "./_components";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companyCtx } = await authGuard();
  const { years } = await populateMonthSelectData(companyCtx.companyId);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Expenses</Typography>
      </Header>

      <Container>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {years.length > 0 && <PeriodSelector years={years} />}

          <AddExpenseModal>
            <Button size="sm">
              <HugeiconsIcon icon={ICONS.EXPENSE} />
              Add expense
            </Button>
          </AddExpenseModal>
        </div>

        {children}
      </Container>
    </Fragment>
  );
}
