import { Header } from "@/components/layout";
import { auth } from "@/libs/auth";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { Container, Typography } from "@serva/serva-ui";
import { Fragment } from "react";
import { PeriodSelector } from "./_components";

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
