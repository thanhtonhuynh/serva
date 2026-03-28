import { Header } from "@/components/layout/header";
import { getIdentityAdminDetail } from "@serva/database";
import { Typography } from "@serva/ui";
import { Container } from "@serva/ui/components/serva/container";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { IdentityForm } from "../../identity-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditIdentityPage({ params }: Props) {
  const { id } = await params;
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
