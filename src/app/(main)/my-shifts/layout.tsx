import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { Fragment } from "react";
import { PeriodSelector } from "./_components";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { years } = await populateMonthSelectData();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">My Shifts</Typography>
      </Header>

      <Container>
        {years.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PeriodSelector years={years} />
          </div>
        )}

        {children}
      </Container>
    </Fragment>
  );
}
