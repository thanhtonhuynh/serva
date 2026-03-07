import { Typography } from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/session";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export default async function Page() {
  const { session } = await getCurrentSession();
  if (session) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-3">
      <Image priority src={"/serva-logo-full.svg"} alt="Serva Logo" width={240} height={80} />

      <Card className="w-full max-w-xl items-center">
        <Typography variant="h1" className="text-xl">
          Login
        </Typography>

        <CardContent className="flex w-full flex-col items-center space-y-3">
          <LoginForm />

          <Button
            variant={"link"}
            nativeButton={false}
            className={"group gap-0.5 hover:no-underline"}
            render={
              <Link href={`/signup`}>
                Don&apos;t have an account? Sign Up
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            }
          />
        </CardContent>
      </Card>
    </main>
  );
}
