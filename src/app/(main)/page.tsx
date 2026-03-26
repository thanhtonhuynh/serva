import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authGuardWithRateLimit } from "@/lib/auth/authorize";
import { Fragment } from "react";
import { CurrentPayPeriodSummary } from "./_components";
import { QuickActions } from "./_components/quick-actions";

export default async function Home() {
  const { identity, companyCtx } = await authGuardWithRateLimit();

  return (
    <Fragment>
      <Header>
        {/* Business name, will change later when scaling */}
        <Typography variant="h1">{companyCtx.companyName}</Typography>
      </Header>

      <Container>
        <Card>
          <CardHeader>
            <CardTitle>Good day, {identity.name}!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <QuickActions identity={identity} companyCtx={companyCtx} />
          </CardContent>
        </Card>

        {companyCtx.employee && <CurrentPayPeriodSummary employeeId={companyCtx.employee.id} />}
      </Container>
    </Fragment>
  );
}
