import { Header } from "@/components/layout";
import { Container } from "@serva/serva-ui";
import { Typography } from "@serva/serva-ui";
import { authGuard } from "@serva/auth/authorize";
import { populateMonthSelectData } from "@/utils/hours-tips";
import { Fragment } from "react";
import { PeriodSelector } from "./_components";

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
        <Typography variant="h1">Hours & Tips</Typography>
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
