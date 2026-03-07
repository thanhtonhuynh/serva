import { ErrorMessage } from "@/components/shared/noti-message";
import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/session";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

type SearchParams = Promise<{ resetLinkExpired?: boolean }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const { resetLinkExpired } = searchParams;

  const { session } = await getCurrentSession();
  if (session) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-3">
      <Image priority src={"/serva-logo-full.svg"} alt="Serva Logo" width={240} height={80} />

      <Card className="w-full max-w-xl items-center">
        {resetLinkExpired && (
          <ErrorMessage message="The reset password link has expired. Please request a new one." />
        )}

        <Typography variant="h1" className="text-xl">
          Forgot your password?
        </Typography>

        <CardContent className="flex w-full flex-col space-y-3">
          <div className="mb-5 space-y-1">
            <p className="text-sm text-gray-500">
              Enter your email address and we'll send you
              {resetLinkExpired ? " another" : " a"} link to reset your password.
            </p>
            <p className="text-sm text-gray-500">
              For security reasons, the link will expire in 30 minutes.
            </p>
            <p className="text-sm text-gray-500">
              Please allow a few minutes for the email to arrive.
            </p>
          </div>

          <ForgotPasswordForm />

          <Button
            variant={"link"}
            nativeButton={false}
            className={"group gap-0.5 hover:no-underline"}
            render={
              <Link href={"/login"}>
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                Back to Login
              </Link>
            }
          />
        </CardContent>
      </Card>
    </main>
  );
}
