import { Container, Header, Loader } from "@/components/layout";
import { NotiMessage, Typography } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { getEmployees } from "@/data-access/employee";
import { getWorkDayRecordsByDateRange } from "@/data-access/work-day-record";
import { getCurrentSession } from "@/lib/auth/session";
import type { DateRange } from "@/types/datetime";
import type { WorkDayRecordsByDate } from "@/app/(main)/schedules/_lib/types";
import { hasPermission } from "@/utils/access-control";
import {
  formatInUTC,
  getEndOfWeekUTC,
  getStartOfDayUTC,
  getStartOfWeekUTC,
  getTodayUTCMidnight,
} from "@/utils/datetime";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { addDays } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { Fragment, Suspense } from "react";
import { ScheduleWeekGrid } from "./_components/schedule-week-grid";

/** Build records-by-date map from flat WorkDayRecord[] for the week (7 days from weekStartUTC). */
function buildRecordsByDate(
  workDayRecords: Awaited<ReturnType<typeof getWorkDayRecordsByDateRange>>,
  weekStartUTC: Date,
): WorkDayRecordsByDate {
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStartUTC, i));
  const startOfDay = (d: Date) => getStartOfDayUTC(d).getTime();
  const byDate: WorkDayRecordsByDate = {};

  for (const weekDate of weekDates) {
    const dateKey = formatInUTC(weekDate);
    const dayRecords = workDayRecords.filter(
      (r) => startOfDay(r.date) === startOfDay(weekDate),
    );
    byDate[dateKey] = dayRecords.map((r) => ({
      userId: r.userId,
      shifts: r.shifts.map((s) => ({
        startMinutes: s.startMinutes,
        endMinutes: s.endMinutes,
        note: s.note ?? null,
      })),
      note: r.note ?? null,
    }));
  }

  return byDate;
}

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

  const dateRangeUTC: DateRange = { start: weekStartUTC, end: weekEndUTC };
  const [workDayRecords, employees] = await Promise.all([
    getWorkDayRecordsByDateRange(dateRangeUTC),
    getEmployees("active"),
  ]);

  const prevWeekStart = addDays(weekStartUTC, -7);
  const prevWeekParam = formatInUTC(prevWeekStart);
  const nextWeekStart = addDays(weekStartUTC, 7);
  const nextWeekParam = formatInUTC(nextWeekStart);

  const weekDates = Array.from({ length: 7 }, (_, i) => formatInUTC(addDays(weekStartUTC, i)));
  const recordsByDate = buildRecordsByDate(workDayRecords, weekStartUTC);

  return (
    <Card className="p-6">
      <ScheduleWeekGrid
        weekStartUTC={weekStartUTC}
        weekEndUTC={weekEndUTC}
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
