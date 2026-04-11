import { CurrentPayPeriodSummary, QuickActions } from "@/components/homepage";
import { Header } from "@/components/layout";
import { authWithRateLimit } from "@/libs/auth";
import { Card, CardContent, CardHeader, CardTitle, Container, Typography } from "@serva/serva-ui";
import { Fragment } from "react";

export default async function Home() {
  const { identity, companyCtx } = await authWithRateLimit();

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
