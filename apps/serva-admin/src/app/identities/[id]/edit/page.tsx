import { Header } from "@/components/layout/header";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { getIdentityAdminDetail } from "@serva/database/dal";
import { Container, Typography } from "@serva/serva-ui";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { IdentityForm } from "../../identity-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditIdentityPage({ params }: Props) {
  const { id } = await params;
  await auth(ROUTES.identityEdit(id));
  const identity = await getIdentityAdminDetail(id);
  if (!identity) notFound();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Edit {identity.name}</Typography>
      </Header>

      <Container>
        <IdentityForm
          identityId={id}
          defaultValues={{
            name: identity.name,
            email: identity.email,
            accountStatus: identity.accountStatus as "active" | "inactive" | "suspended",
          }}
        />
      </Container>
    </Fragment>
  );
}
