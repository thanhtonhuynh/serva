// @ts-nocheck

import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Callout } from "@/components/shared";
import { Typography } from "@/components/shared/typography";
import { Card } from "@/components/ui/card";
import { PERMISSIONS } from "@serva/shared";
import { getEmployeeByIdentityAndCompany } from "@/data-access/employee";
import { getIdentityProfileInCompanyByEmail } from "@/data-access/identity";
import { getRecentReportsByIdentity } from "@/data-access/report";
import { getRecentWorkDayRecordsByEmployee } from "@/data-access/work-day-record/dal";
import { authGuardWithRateLimit, hasSessionPermission } from "@/lib/auth/authorize";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { ProfileInfo } from "./_components/profile-info";
import { RecentReports } from "./_components/recent-reports";
import { RecentShifts } from "./_components/recent-shifts";

type ProfilePageProps = {
  params: Promise<{ email: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { identity, companyCtx } = await authGuardWithRateLimit();

  // Maintainence
  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Profile</Typography>
      </Header>

      <Container position="center">
        <Card className="p-6">
          <Callout
            variant="info"
            title="Maintenance"
            message="This page is currently under maintenance. Please check back later."
          />
        </Card>
      </Container>
    </Fragment>
  );

  const { email: emailParam } = await params;
  const email = decodeURIComponent(emailParam);
  const profileIdentity = await getIdentityProfileInCompanyByEmail(email, companyCtx.companyId);

  if (!profileIdentity || (profileIdentity.isPlatformAdmin && !identity.isPlatformAdmin))
    return notFound();

  const canViewAllStatuses = await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS);
  if (!canViewAllStatuses && profileIdentity.accountStatus !== "active") return notFound();

  const isOwner = identity.email === profileIdentity.email;

  const employee = await getEmployeeByIdentityAndCompany(profileIdentity.id, companyCtx.companyId);

  const [recentReports, workDayRecords] = await Promise.all([
    getRecentReportsByIdentity(profileIdentity.id, companyCtx.companyId, 5),
    employee ? getRecentWorkDayRecordsByEmployee(employee.id, 5) : Promise.resolve([]),
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
