import { Container } from "@/components/layout";
import { SIcon } from "@/components/shared";
import { Typography } from "@/components/shared/typography";
import { Button } from "@serva/ui/components/button";
import { Card, CardContent, CardHeader } from "@serva/ui/components/card";
import { getCurrentSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./reset-password-form";

export default async function Page() {
  const token = (await cookies()).get("pw-reset")?.value;
  if (!token) redirect("/login/forgot-password");
  const { session } = await getCurrentSession();
  if (session) redirect("/");

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
            Set new password
          </Typography>
        </CardHeader>

        <CardContent className="flex w-full flex-col items-center space-y-3">
          <ResetPasswordForm />

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
