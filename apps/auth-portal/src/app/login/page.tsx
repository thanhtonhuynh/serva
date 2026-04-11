import { parseCallbackUrl } from "@/lib/callback-url-parser";
import { getCurrentSession } from "@serva/auth/session";
import { getIdentityByEmail, getInviteByToken } from "@serva/database/dal";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  SIcon,
  Typography,
} from "@serva/serva-ui";
import { getWebUrl } from "@serva/shared";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { oauthLoginErrorMessage } from "./oauth-error-message";

type Props = {
  searchParams: Promise<{ invite?: string; error?: string; callbackUrl?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { callbackUrl, invite: inviteToken, error: oauthErrorCode } = await searchParams;
  const { identity } = await getCurrentSession();

  if (identity) {
    const parsedCallbackUrl = parseCallbackUrl(callbackUrl);
    redirect(parsedCallbackUrl ?? getWebUrl());
  }

  const oauthError = oauthLoginErrorMessage(oauthErrorCode);
  const showGoogleSignIn = Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  const inviteMode = !!inviteToken;
  let inviteEmail: string | undefined;

  if (inviteToken) {
    const invite = await getInviteByToken(inviteToken);

    if (!invite || invite.status !== "awaiting" || invite.expiresAt.getTime() <= Date.now()) {
      notFound();
    }

    inviteEmail = invite.email;

    // New invitees without an account should set a password on signup, not login
    const existing = await getIdentityByEmail(invite.email);
    if (!existing) redirect(`/signup?invite=${encodeURIComponent(inviteToken)}`);
  }

  return (
    <Container position="center">
      <Card className="w-full max-w-xl items-center gap-10 py-12">
        <CardHeader className="flex flex-col items-center gap-6">
          <Image priority src={"/serva-logo-icon.svg"} alt="Serva Logo" width={100} height={100} />
          <Typography variant="h1" className="text-xl">
            {inviteMode ? "Login to join company" : "Welcome back!"}
          </Typography>
        </CardHeader>

        <CardContent className="flex w-full flex-col items-center space-y-3">
          <LoginForm
            inviteToken={inviteToken}
            inviteEmail={inviteEmail}
            oauthError={oauthError}
            showGoogleSignIn={showGoogleSignIn}
            callbackUrl={inviteMode ? undefined : callbackUrl}
          />

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
