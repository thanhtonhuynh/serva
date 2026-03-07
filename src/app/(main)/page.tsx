import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared";
import { NotiMessage } from "@/components/shared/noti-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/session";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { CurrentPayPeriodSummary } from "./_components";
import { QuickActions } from "./_components/quick-actions";

export default async function Home() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  if (user.accountStatus !== "active") notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  // const todayReport = await getReportRaw({ date: today });

  return (
    <Fragment>
      <Header>
        {/* Business name, will change later when scaling */}
        <Typography variant="h1">Ongba Eatery</Typography>
      </Header>

      <Container>
        {/* Greetings */}
        <Card>
          <CardHeader>
            <CardTitle>Good day, {user.name}!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <QuickActions user={user} />
          </CardContent>
        </Card>

        {/* TODO: Removed this, will replace with just general today's sales data */}
        {/* {todayReport && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Today's Sales Report</CardTitle>
              </CardHeader>
              <CardContent>
                <SaleReportCard data={processedTodayReportData} />
              </CardContent>
            </Card>
          </>
        )} */}

        {/* Current pay period summary */}
        <CurrentPayPeriodSummary user={user} />
      </Container>
    </Fragment>
  );
}
