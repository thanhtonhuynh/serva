import { Container, Header } from "@/components/layout";
import { SIcon, Typography } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fragment } from "react";

export default async function RateLimit() {
  return (
    <>
      <Fragment>
        <Header></Header>

        <Container className="flex h-full items-center justify-center p-3">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <SIcon icon="ALERT" />
                Too Many Requests!
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Typography>You have made too many requests. Please try again later.</Typography>
            </CardContent>
          </Card>
        </Container>
      </Fragment>
    </>
  );
}
