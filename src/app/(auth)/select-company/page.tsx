import { SIcon } from "@/components/shared";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCompaniesByIdentityId } from "@/data-access/company/dal";
import { getCurrentSession } from "@/lib/auth/session";
import Image from "next/image";
import { redirect } from "next/navigation";
import { logoutAction } from "../actions";
import { CompanyList } from "./company-list";

export default async function SelectCompanyPage() {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");

  const companies = await getCompaniesByIdentityId(identity.id);

  if (companies.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-3">
        <Image priority src="/serva-logo-full.svg" alt="Serva Logo" width={240} height={80} />
        <Card className="w-full max-w-xl items-center">
          <Typography variant="h1" className="text-xl">
            No Company Access
          </Typography>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              You don&apos;t belong to any company yet. Ask your manager for an invite.
            </p>
          </CardContent>
        </Card>
        <form action={logoutAction}>
          <Button
            variant={"outline-accent"}
            className="w-full justify-start rounded-xl"
            type="submit"
          >
            <SIcon icon="LOGOUT" strokeWidth={1.5} />
            <span className="ml-2">Logout</span>
          </Button>
        </form>
      </main>
    );
  }

  if (companies.length === 1) {
    // Auto-select single company (this page shouldn't normally be reached in that case)
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-3">
      <Image priority src="/serva-logo-full.svg" alt="Serva Logo" width={240} height={80} />
      <Card className="w-full max-w-xl items-center">
        <Typography variant="h1" className="text-xl">
          Select Company
        </Typography>
        <CardContent className="w-full">
          <CompanyList companies={companies} />
        </CardContent>
      </Card>
      <form action={logoutAction}>
        <Button
          variant={"outline-accent"}
          className="w-full justify-start rounded-xl"
          type="submit"
        >
          <SIcon icon="LOGOUT" strokeWidth={1.5} />
          <span className="ml-2">Logout</span>
        </Button>
      </form>
    </main>
  );
}
