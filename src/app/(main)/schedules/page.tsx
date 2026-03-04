import { Container, Header, Loader } from "@/components/layout";
import { NotiMessage, Typography } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getEmployees } from "@/data-access/employee";
import { getScheduleDaysByDateRangeUTC } from "@/data-access/schedule";
import { getCurrentSession } from "@/lib/auth/session";
import type { DayRange } from "@/types";
import { hasPermission } from "@/utils/access-control";
import { getEndOfWeekUTC, getStartOfWeekUTC, getTodayStartOfDay } from "@/utils/datetime";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { utc } from "@date-fns/utc";
import { addDays, format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { Fragment, Suspense } from "react";
import { ScheduleWeekGrid } from "./_components/schedule-week-grid";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function SchedulePage({ searchParams }: PageProps) {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");
  if (user.accountStatus !== "active") return notFound();

  if (!hasPermission(user.role, PERMISSIONS.SCHEDULE_VIEW)) return notFound();

  if (!(await authenticatedRateLimit(user.id))) {
    return <NotiMessage variant="error" message="Too many requests. Please try again later." />;
  }

  const params = await searchParams;
  const dateParam = params.date;

  if (!dateParam) {
    redirect(`/schedules?date=${format(getTodayStartOfDay(), "yyyy-MM-dd")}`);
  }

  const canManage = hasPermission(user.role, PERMISSIONS.SCHEDULE_MANAGE);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Schedules</Typography>
      </Header>

      <Container>
        <Suspense key={dateParam} fallback={<Loader />}>
          <ScheduleWeekContent dateParam={dateParam} canManage={canManage} />
        </Suspense>
      </Container>
    </Fragment>
  );
}

async function ScheduleWeekContent({
  dateParam,
  canManage,
}: {
  dateParam: string;
  canManage: boolean;
}) {
  const weekStartUTC = getStartOfWeekUTC(dateParam);
  const weekEndUTC = getEndOfWeekUTC(dateParam);

  const dateRangeUTC: DayRange = { start: weekStartUTC, end: weekEndUTC };
  const [scheduleDays, employees] = await Promise.all([
    getScheduleDaysByDateRangeUTC(dateRangeUTC),
    getEmployees("active"),
  ]);

  const prevWeekStart = addDays(weekStartUTC, -7);
  const prevWeekParam = format(prevWeekStart, "yyyy-MM-dd", { in: utc });
  const nextWeekStart = addDays(weekStartUTC, 7);
  const nextWeekParam = format(nextWeekStart, "yyyy-MM-dd", { in: utc });

  const daysForClient = scheduleDays.map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }));

  return (
    <Card className="p-6">
      <ScheduleWeekGrid
        weekStartUTC={weekStartUTC}
        weekEndUTC={weekEndUTC}
        prevWeekParam={prevWeekParam}
        nextWeekParam={nextWeekParam}
        days={daysForClient}
        employees={employees}
        canManage={canManage}
      />
    </Card>
  );
}
