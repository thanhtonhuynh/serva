import { Container } from "@serva/ui";
import { Callout, SIcon, Typography } from "@serva/ui";
import { Button } from "@serva/ui/components/button";
import { Card, CardContent, CardHeader } from "@serva/ui/components/card";
import { getCurrentSession } from "@/lib/auth/session";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./forgot-password-form";

type SearchParams = Promise<{ resetLinkExpired?: boolean }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const { resetLinkExpired } = searchParams;

  const { session } = await getCurrentSession();
  if (session) redirect("/");

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
            Forgot your password?
          </Typography>
        </CardHeader>

        <CardContent className="flex w-full flex-col items-center space-y-3">
          {resetLinkExpired && (
            <Callout
              variant="info"
              message="The reset password link has expired. Please request a new one."
            />
          )}

          <div className="mb-6 space-y-1">
            <Typography variant="p-sm">
              Enter your email address and we'll send you
              {resetLinkExpired ? " another" : " a"} link to reset your password.
            </Typography>
            <Typography variant="p-sm">
              For security reasons, the link will expire in 30 minutes.
            </Typography>
            <Typography variant="p-sm">
              Please allow a few minutes for the email to arrive.
            </Typography>
          </div>

          <ForgotPasswordForm />

          <Button
            variant={"link"}
            nativeButton={false}
            className={"group gap-0.5 hover:no-underline"}
            render={<Link href={"/login"} />}
          >
            <SIcon
              icon="ARROW_LEFT"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
