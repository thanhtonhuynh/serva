import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/session";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function Page() {
  const token = (await cookies()).get("pw-reset")?.value;
  if (!token) redirect("/login/forgot-password");
  const { session } = await getCurrentSession();
  if (session) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-3">
      <Image priority src={"/serva-logo-full.svg"} alt="Serva Logo" width={240} height={80} />

      <Card className="w-full max-w-xl items-center">
        <Typography variant="h1" className="text-xl">
          Enter new password
        </Typography>

        <CardContent className="flex w-full flex-col items-center space-y-3">
          <ResetPasswordForm />

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
