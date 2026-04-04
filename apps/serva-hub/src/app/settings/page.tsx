import { Header } from "@/components/layout";
import { Container } from "@serva/serva-ui";
import { Typography } from "@serva/serva-ui";
import { authGuardWithRateLimit } from "@serva/auth/authorize";
import { Fragment } from "react";
import { UpdateAvatar, UpdateEmailForm, UpdateNameForm, UpdatePasswordForm } from "./_components";

export default async function Page() {
  const { identity } = await authGuardWithRateLimit();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Settings</Typography>
      </Header>

      <Container>
        <UpdateAvatar identity={identity} />
        <UpdateNameForm identity={identity} />
        <UpdateEmailForm identity={identity} />
        <UpdatePasswordForm />
      </Container>
    </Fragment>
  );
}
