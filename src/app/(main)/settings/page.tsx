import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { getCurrentSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { Fragment } from "react";
import {
  UpdateAvatar,
  UpdateEmailForm,
  UpdateNameForm,
  UpdatePasswordForm,
  UpdateUsernameForm,
} from "./_components";

export default async function Page() {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");
  if (identity.accountStatus !== "active") return notFound();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Settings</Typography>
      </Header>

      <Container>
        <UpdateAvatar identity={identity} />
        <UpdateNameForm identity={identity} />
        <UpdateUsernameForm identity={identity} />
        <UpdateEmailForm identity={identity} />
        <UpdatePasswordForm />
      </Container>
    </Fragment>
  );
}
