import { Container, Header, Loader } from "@/components/layout";
import { NotiMessage, Typography } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getEmployees } from "@/data-access/employee";
import { getWorkDayRecordsByDateRange } from "@/data-access/work-day-record";
import { getCurrentSession } from "@/lib/auth/session";
import type { DateRange } from "@/types/datetime";
import { hasPermission } from "@/utils/access-control";
import {
  formatInUTC,
  getEndOfWeekUTC,
  getStartOfWeekUTC,
  getTodayUTCMidnight,
} from "@/utils/datetime";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { buildWorkDayRecordsByDate } from "@/utils/work-day-record";
import { addDays } from "date-fns";
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
    redirect(`/schedules?date=${formatInUTC(getTodayUTCMidnight())}`);
  }

  const canManage = hasPermission(user.role, PERMISSIONS.SCHEDULE_MANAGE);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Schedules</Typography>
      </Header>

      <Container>
        <Suspense key={dateParam} fallback={<Loader />}>
          <SchedulePageContent dateParam={dateParam} canManage={canManage} />
        </Suspense>
      </Container>
    </Fragment>
  );
}

// Keep this as a separate component so the app shows Loader again while the new week's data is loading.
async function SchedulePageContent({
  dateParam,
  canManage,
}: {
  dateParam: string;
  canManage: boolean;
}) {
  const weekStartUTC = getStartOfWeekUTC(dateParam);
  const weekEndUTC = getEndOfWeekUTC(dateParam);

  const dateRangeUTC: DateRange = { start: weekStartUTC, end: weekEndUTC };
  const [workDayRecords, employees] = await Promise.all([
    getWorkDayRecordsByDateRange(dateRangeUTC),
    getEmployees({ status: "active", excludeAdmin: true }),
  ]);

  const prevWeekStart = addDays(weekStartUTC, -7);
  const prevWeekParam = formatInUTC(prevWeekStart);
  const nextWeekStart = addDays(weekStartUTC, 7);
  const nextWeekParam = formatInUTC(nextWeekStart);

  const recordsByDate = buildWorkDayRecordsByDate(workDayRecords, weekStartUTC);
  const weekDates = Object.keys(recordsByDate);

  return (
    <Card className="p-6">
      <ScheduleWeekGrid
        dateRangeUTC={dateRangeUTC}
        prevWeekParam={prevWeekParam}
        nextWeekParam={nextWeekParam}
        weekDates={weekDates}
        recordsByDate={recordsByDate}
        employees={employees}
        canManage={canManage}
      />
    </Card>
  );
}
