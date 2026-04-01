import { Header } from "@/components/layout";
import { authGuardWithRateLimit } from "@serva/auth/authorize";
import { Card, CardContent, CardHeader, CardTitle, Container, Typography } from "@serva/serva-ui";
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
