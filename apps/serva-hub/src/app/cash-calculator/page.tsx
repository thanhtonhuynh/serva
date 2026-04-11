import { CashCalculator } from "@/app/cash-calculator/cash-calculator";
import { Header } from "@/components/layout";
import { authWithRateLimit } from "@/libs/auth";
import { Container, Typography } from "@serva/serva-ui";
import { Fragment } from "react";

export default async function Page() {
  await authWithRateLimit();

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
