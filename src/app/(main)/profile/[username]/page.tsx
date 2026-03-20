import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { PERMISSIONS } from "@/constants/permissions";
import { getRecentReportsByIdentity } from "@/data-access/report";
import { getIdentityProfileInCompany } from "@/data-access/user";
import { getRecentWorkDayRecordsByIdentity } from "@/data-access/work-day-record/dal";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { ProfileInfo } from "./_components/profile-info";
import { RecentReports } from "./_components/recent-reports";
import { RecentShifts } from "./_components/recent-shifts";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { identity, companyCtx } = await authGuardWithRateLimit();

  const { username } = await params;
  const profileIdentity = await getIdentityProfileInCompany(username, companyCtx.companyId);

  // If the profile user is not found or the profile user is a platform admin and the current identity is not a platform admin, return not found.
  if (!profileIdentity || (profileIdentity.isPlatformAdmin && !identity.isPlatformAdmin))
    return notFound();

  const canViewAllStatuses = await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS);
  if (!canViewAllStatuses && profileIdentity.accountStatus !== "active") return notFound();

  const isOwner = identity.username === profileIdentity.username;

  const [recentReports, workDayRecords] = await Promise.all([
    getRecentReportsByIdentity(profileIdentity.id, 5),
    getRecentWorkDayRecordsByIdentity(profileIdentity.id, 5),
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
        <ProfileInfo identity={profileIdentity} isOwner={isOwner} />
        <RecentShifts shifts={recentShifts} isOwner={isOwner} />
        <RecentReports reports={recentReports} isOwner={isOwner} />
      </Container>
    </Fragment>
  );
}
