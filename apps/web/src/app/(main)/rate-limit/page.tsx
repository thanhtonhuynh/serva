import { Container } from "@/components/layout";
import { SIcon, Typography } from "@/components/shared";
import { Button } from "@serva/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/ui/components/card";
import Link from "next/link";

export default async function RateLimit() {
  return (
    <Container position="center">
      <Card className="w-full max-w-xl items-center py-12">
        <CardHeader>
          <CardTitle className="text-destructive flex flex-col items-center gap-3 text-lg tracking-wide">
            <SIcon icon="ALERT" className="size-7" strokeWidth={2} />
            Too Many Requests!
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <Typography>You have made too many requests. Please try again later.</Typography>

          <Button nativeButton={false} render={<Link href="/">Return to Home</Link>} />
        </CardContent>
      </Card>
    </Container>
  );
}
