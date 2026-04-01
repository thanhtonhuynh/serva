import { Header } from "@/components/layout/header";
import { platformAdminGuard } from "@serva/auth";
import { Typography } from "@serva/serva-ui";
import { Container } from "@serva/serva-ui/components/serva/container";
import { Fragment } from "react";
import { CompanyForm } from "../company-form";

export default async function NewCompanyPage() {
  await platformAdminGuard();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">New Company</Typography>
      </Header>

      <Container>
        <CompanyForm mode="create" />
      </Container>
    </Fragment>
  );
}
