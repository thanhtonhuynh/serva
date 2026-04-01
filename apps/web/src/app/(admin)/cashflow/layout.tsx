import { Header } from "@/components/layout";
import { authGuard } from "@serva/auth/authorize";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { Container, Typography } from "@serva/serva-ui";
import { Fragment } from "react";
import { PeriodSelector, TabNav } from "./_components";

export default async function CashflowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companyCtx } = await authGuard();
  const { years } = await populateMonthSelectData(companyCtx.companyId);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Cash Flow</Typography>
      </Header>

      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {years.length > 0 && <PeriodSelector years={years} />}
          <TabNav />
        </div>

        {children}
      </Container>
    </Fragment>
  );
}
