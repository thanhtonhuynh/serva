import { Container } from "@/components/layout/container";
import { SIcon } from "@/components/shared";
import { Typography } from "@/components/shared/typography";
import { Button } from "@serva/ui/components/button";
import { Card, CardContent, CardHeader } from "@serva/ui/components/card";
import { getCompaniesByIdentityId } from "@serva/database";
import { getCurrentSession } from "@/lib/auth/session";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { logoutAction } from "../actions";
import { CompanyList } from "./company-list";

export default async function SelectCompanyPage() {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");
  if (identity.accountStatus !== "active") notFound();
  if (await authenticatedRateLimit(identity.id)) redirect("/rate-limit");

  const companies = await getCompaniesByIdentityId(identity.id);

  // Only one company, nothing to select, redirect to home
  if (companies.length === 1) redirect("/");

  return (
    <Container position="center">
      <Card className="w-full max-w-xl items-center py-12">
        <CardHeader className="flex flex-col items-center gap-6">
          <Image
            priority
            src={"/serva-logo-icon-2.svg"}
            alt="Serva Logo"
            width={100}
            height={100}
          />
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
            <Typography>Please contact your manager to get access to your company.</Typography>
          ) : (
            <CompanyList companies={companies} />
          )}

          <form action={logoutAction}>
            <Button variant={"outline-accent"} type="submit">
              <SIcon icon="LOGOUT" strokeWidth={1.5} />
              Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
