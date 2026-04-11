import { Header } from "@/components/layout";
import { authWithRateLimit } from "@/libs/auth";
import { findGoogleOAuthAccountByIdentityId } from "@serva/database/dal";
import { Container, Typography } from "@serva/serva-ui";
import { Fragment } from "react";
import {
  GoogleAccountSection,
  UpdateAvatar,
  UpdateEmailForm,
  UpdateNameForm,
  UpdatePasswordForm,
} from "./_components";

type Props = {
  searchParams: Promise<{ google?: string; reason?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { identity } = await authWithRateLimit();
  const { google: googleParam, reason } = await searchParams;

  const googleOAuth = await findGoogleOAuthAccountByIdentityId(identity.id);
  const googleLinked = !!googleOAuth;

  const googleStatus =
    googleParam === "linked"
      ? ("linked" as const)
      : googleParam === "link_error"
        ? ("link_error" as const)
        : undefined;

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
        <GoogleAccountSection
          googleLinked={googleLinked}
          googleStatus={googleStatus}
          linkErrorReason={reason ?? null}
        />
      </Container>
    </Fragment>
  );
}
