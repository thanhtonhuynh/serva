import { Container } from "@/components/layout";
import { SIcon } from "@/components/shared";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getIdentityByEmail } from "@/data-access/identity";
import { getInviteByToken } from "@/data-access/invite";
import { getCurrentSession } from "@/lib/auth/session";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SignUpForm } from "./signup-form";

type Props = {
  searchParams: Promise<{ invite?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { session } = await getCurrentSession();
  if (session) redirect("/");

  const { invite: inviteToken } = await searchParams;
  const inviteMode = !!inviteToken;
  let inviteEmail: string | undefined;
  let inviteName: string | undefined;

  if (inviteToken) {
    const invite = await getInviteByToken(inviteToken);

    if (!invite || invite.status !== "awaiting" || invite.expiresAt.getTime() <= Date.now()) {
      notFound();
    }

    inviteEmail = invite.email;
    inviteName = invite.name;

    // If the invite email belongs to an existing identity,
    // redirect to login instead
    const existing = await getIdentityByEmail(invite.email);
    if (existing) redirect(`/login?invite=${encodeURIComponent(inviteToken)}`);
  }

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
          <Typography variant="h1" className="text-xl">
            {inviteMode ? "Set password" : "Sign Up"}
          </Typography>
        </CardHeader>

        <CardContent className="flex w-full flex-col items-center space-y-3">
          <SignUpForm inviteToken={inviteToken} inviteEmail={inviteEmail} inviteName={inviteName} />

          {!inviteMode && (
            <Button
              variant={"link"}
              nativeButton={false}
              className={"group gap-0.5 hover:no-underline"}
              render={<Link href="/login" />}
            >
              Already have an account? Login
              <SIcon
                icon="ARROW_RIGHT"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
