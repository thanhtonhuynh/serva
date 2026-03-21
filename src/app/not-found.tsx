import { Container } from "@/components/layout";
import { SIcon, Typography } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function NotFound() {
  return (
    <>
      <Container className="flex-1 items-center justify-center">
        <Card className="ring-primary shadow-[0px_0px_10px_1px_var(--color-primary)]">
          <CardHeader>
            <CardTitle className="text-primary flex flex-col items-center gap-3 text-xl tracking-wider uppercase md:text-2xl">
              <SIcon icon="FILE_NOT_FOUND" className="text-primary size-7" strokeWidth={2} />
              Page Not Found
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <div className="space-y-1">
              <Typography className="text-base">
                Sorry, we couldn't find the page you're looking for.
              </Typography>
              <Typography className="text-base">
                It might have been moved or no longer exists.
              </Typography>
            </div>

            <Button nativeButton={false} render={<Link href="/">Go back</Link>} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
