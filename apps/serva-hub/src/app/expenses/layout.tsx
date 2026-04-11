import { Header } from "@/components/layout";
import { auth } from "@/libs/auth";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Container, ICONS, Typography } from "@serva/serva-ui";
import { Fragment } from "react";
import { AddExpenseModal, PeriodSelector } from "./_components";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companyCtx } = await auth();
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
