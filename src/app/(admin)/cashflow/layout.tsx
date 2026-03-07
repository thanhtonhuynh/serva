import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { Fragment } from "react";
import { PeriodSelector, TabNav } from "./_components";

export default async function CashflowLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { years } = await populateMonthSelectData();

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
