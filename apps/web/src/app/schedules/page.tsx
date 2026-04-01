import { Header } from "@/components/layout";
import { Container, Loader } from "@serva/serva-ui";
import { Typography } from "@serva/serva-ui";
import { Card } from "@serva/serva-ui/components/card";
import { getEmployeesByCompany, getWorkDayRecordsByDateRange } from "@serva/database/dal";
import { authGuardWithRateLimit, hasSessionPermission } from "@serva/auth/authorize";
import { buildWorkDayRecordsByDate } from "@/utils/work-day-record";
import {
  PERMISSIONS,
  formatInUTC,
  getEndOfWeekUTC,
  getStartOfWeekUTC,
  getTodayUTCMidnight,
  type DateRange,
} from "@serva/shared";
import { addDays } from "date-fns";
import { redirect } from "next/navigation";
import { Fragment, Suspense } from "react";
import { ScheduleWeekGrid } from "./_components/schedule-week-grid";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function SchedulePage({ searchParams }: PageProps) {
  const { companyCtx } = await authGuardWithRateLimit();

  const params = await searchParams;
  const dateParam = params.date;

  if (!dateParam) {
    redirect(`/schedules?date=${formatInUTC(getTodayUTCMidnight())}`);
  }

  const canManageSchedule = await hasSessionPermission(PERMISSIONS.SCHEDULE_MANAGE);

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Schedules</Typography>
      </Header>

      <Container>
        <Suspense key={dateParam} fallback={<Loader />}>
          <SchedulePageContent
            dateParam={dateParam}
            canManage={canManageSchedule}
            companyId={companyCtx.companyId}
          />
        </Suspense>
      </Container>
    </Fragment>
  );
}

// Keep this as a separate component so the app shows Loader again while the new week's data is loading.
async function SchedulePageContent({
  dateParam,
  canManage,
  companyId,
}: {
  dateParam: string;
  canManage: boolean;
  companyId: string;
}) {
  const weekStartUTC = getStartOfWeekUTC(dateParam);
  const weekEndUTC = getEndOfWeekUTC(dateParam);

  const dateRangeUTC: DateRange = { start: weekStartUTC, end: weekEndUTC };
  const [workDayRecords, employees] = await Promise.all([
    getWorkDayRecordsByDateRange(companyId, dateRangeUTC),
    getEmployeesByCompany(companyId, "active"),
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
