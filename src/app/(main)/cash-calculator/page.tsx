import { CashCalculator } from "@/app/(main)/cash-calculator/cash-calculator";
import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { getCurrentSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";

export default async function Page() {
  const { session, user } = await getCurrentSession();
  if (!session) redirect("/login");
  if (user.accountStatus !== "active") return notFound();

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
