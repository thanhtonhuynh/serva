import { Container } from "@serva/ui";
import { SIcon } from "@serva/ui";
import { Typography } from "@serva/ui/components/serva/typography";
import { Button } from "@serva/ui/components/button";
import { Card, CardContent, CardHeader } from "@serva/ui/components/card";
import { getIdentityByEmail, getInviteByToken } from "@serva/database";
import { getCurrentSession } from "@serva/auth/session";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ invite?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { identity } = await getCurrentSession();
  if (identity) redirect("/");

  const { invite: inviteToken } = await searchParams;
  const inviteMode = !!inviteToken;
  let inviteEmail: string | undefined;

  if (inviteToken) {
    const invite = await getInviteByToken(inviteToken);

    if (!invite || invite.status !== "awaiting" || invite.expiresAt.getTime() <= Date.now()) {
      notFound();
    }

    inviteEmail = invite.email;

    // If the invite email doesn't belong to an existing identity,
    // redirect to signup instead
    const existing = await getIdentityByEmail(invite.email);
    if (existing) redirect(`/signup?invite=${encodeURIComponent(inviteToken)}`);
  }

  return (
    <Container position="center">
      <Card className="w-full max-w-xl items-center gap-10 py-12">
        <CardHeader className="flex flex-col items-center gap-6">
          <Image
            priority
            src={"/serva-logo-icon-2.svg"}
            alt="Serva Logo"
            width={100}
            height={100}
          />
          <Typography variant="h1" className="text-xl">
            {inviteMode ? "Login to join company" : "Welcome back!"}
          </Typography>
        </CardHeader>

        <CardContent className="flex w-full flex-col items-center space-y-3">
          <LoginForm inviteToken={inviteToken} inviteEmail={inviteEmail} />

          {!inviteMode && (
            <Button
              variant={"link"}
              nativeButton={false}
              className={"group gap-0.5 hover:no-underline"}
              render={<Link href="/signup" />}
            >
              Don&apos;t have an account? Sign Up
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
