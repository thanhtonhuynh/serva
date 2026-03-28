import { CashCalculator } from "@/app/(main)/cash-calculator/cash-calculator";
import { Header } from "@/components/layout";
import { Container } from "@serva/ui/components/serva/container";
import { Typography } from "@serva/ui/components/serva/typography";
import { authGuardWithRateLimit } from "@/lib/auth/authorize";
import { Fragment } from "react";

export default async function Page() {
  await authGuardWithRateLimit();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Cash calculator</Typography>
      </Header>

      <Container>
        <CashCalculator />
      </Container>
    </Fragment>
  );
}
