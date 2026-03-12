import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { PERMISSIONS } from "@/constants/permissions";
import { getRecentReportsByUser } from "@/data-access/report";
import { getUserProfileByUsername } from "@/data-access/user";
import { getRecentWorkDayRecordsByUser } from "@/data-access/work-day-record/dal";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import { ProfileInfo } from "./_components/profile-info";
import { RecentReports } from "./_components/recent-reports";
import { RecentShifts } from "./_components/recent-shifts";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { user: currentUser } = await getCurrentSession();

  if (!currentUser) redirect("/login");
  if (currentUser.accountStatus !== "active") return notFound();

  const { username } = await params;
  const profileUser = await getUserProfileByUsername(username);

  if (!profileUser || (profileUser.role.isAdminUser && !currentUser.role.isAdminUser)) {
    return notFound();
  }

  const canViewAllStatuses = hasPermission(currentUser.role, PERMISSIONS.TEAM_MANAGE_ACCESS);
  if (!canViewAllStatuses && profileUser.accountStatus !== "active") {
    return notFound();
  }

  const isOwner = currentUser.username === profileUser.username;

  // Fetch recent reports submitted by this user and recent work day records (shifts)
  const [recentReports, workDayRecords] = await Promise.all([
    getRecentReportsByUser(profileUser.id, 5),
    getRecentWorkDayRecordsByUser(profileUser.id, 5),
  ]);

  const recentShifts = workDayRecords.map((r) => ({
    date: r.date,
    hours: r.totalHours,
    tips: r.tips,
  }));

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Profile</Typography>
      </Header>

      <Container className="space-y-3">
        <ProfileInfo user={profileUser} isOwner={isOwner} />
        <RecentShifts shifts={recentShifts} isOwner={isOwner} />
        <RecentReports reports={recentReports} isOwner={isOwner} />
      </Container>
    </Fragment>
  );
}
