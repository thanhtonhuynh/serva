import { CashCalculator } from "@/app/cash-calculator/cash-calculator";
import { Header } from "@/components/layout";
import { authGuardWithRateLimit } from "@serva/auth/authorize";
import { Container } from "@serva/serva-ui";
import { Typography } from "@serva/serva-ui";
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
