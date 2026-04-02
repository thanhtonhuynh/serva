import { authenticatedRateLimit } from "@serva/auth/rate-limiter";
import { getCurrentSession } from "@serva/auth/session";
import { getCompaniesByIdentityId } from "@serva/database/dal";
import { SIcon } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import { Card, CardContent, CardHeader } from "@serva/serva-ui/components/card";
import { Container } from "@serva/serva-ui/components/serva/container";
import { Typography } from "@serva/serva-ui/components/serva/typography";
import { getAdminUrl, getWebUrl } from "@serva/shared";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { CompanyList } from "./company-list";

export default async function SelectCompanyPage() {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");
  if (identity.accountStatus !== "active") notFound();
  if (await authenticatedRateLimit(identity.id)) redirect("/rate-limit");

  const companies = await getCompaniesByIdentityId(identity.id);

  if (companies.length === 1) {
    redirect(getWebUrl());
  }

  return (
    <Container position="center">
      <Card className="w-full max-w-xl items-center py-12">
        <CardHeader className="flex flex-col items-center gap-6">
          <Image priority src={"/serva-logo-icon.svg"} alt="Serva Logo" width={100} height={100} />
          {companies.length === 0 ? (
            <Typography variant="h1" className="text-xl">
              No Company Access
            </Typography>
          ) : (
            <Typography variant="h1" className="text-xl">
              Select Company
            </Typography>
          )}
        </CardHeader>

        <CardContent className="flex w-full flex-col items-center gap-6">
          {companies.length === 0 ? (
            <>
              {identity.isPlatformAdmin ? (
                <div className="flex flex-col items-center gap-3">
                  <Typography>You have no company memberships.</Typography>
                  <Button nativeButton={false} render={<a href={getAdminUrl()} />}>
                    <SIcon icon="ADMIN" strokeWidth={1.5} />
                    Open Admin Dashboard
                  </Button>
                </div>
              ) : (
                <Typography>Please contact your manager to get access to your company.</Typography>
              )}
            </>
          ) : (
            <CompanyList companies={companies} />
          )}

          <Button variant="outline-accent" nativeButton={false} render={<a href="/logout" />}>
            <SIcon icon="LOGOUT" strokeWidth={1.5} />
            Logout
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
