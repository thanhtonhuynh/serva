import { getIdentityByEmail, getInviteByToken } from "@serva/database/dal";
import { Container, Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui";
import { Card, CardContent, CardHeader } from "@serva/serva-ui";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite) notFound();

  const existingIdentity = await getIdentityByEmail(invite.email);
  const hasExistingIdentity = !!existingIdentity;

  return (
    <Container position="center">
      <Card className="w-full max-w-xl items-center gap-10 py-12">
        <CardHeader className="flex flex-col items-center gap-6">
          <Image priority src={"/serva-logo-icon.svg"} alt="Serva Logo" width={100} height={100} />
          <Typography variant="h1" className="text-xl">
            Welcome, {invite.name}!
          </Typography>
        </CardHeader>

        <CardContent className="flex w-full flex-col gap-6">
          <Typography className="text-primary text-center text-base">
            <span className="font-bold">{invite.company.name}</span> invites you to join the
            company.
          </Typography>

          <div className="space-y-1">
            <Typography variant="h2" className="ml-3 font-semibold">
              {hasExistingIdentity ? "Join with existing account" : "Join with a new account"}
            </Typography>

            <div className="bg-accent flex items-center justify-between rounded-xl p-3">
              <Typography variant="p-sm">{invite.email}</Typography>
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={
                      hasExistingIdentity
                        ? `/login?invite=${encodeURIComponent(token)}`
                        : `/signup?invite=${encodeURIComponent(token)}`
                    }
                  >
                    {hasExistingIdentity ? "Login" : "Sign up"}
                  </Link>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
