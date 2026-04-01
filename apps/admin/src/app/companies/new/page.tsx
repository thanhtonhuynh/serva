import { Header } from "@/components/layout/header";
import { Typography } from "@serva/serva-ui";
import { Container } from "@serva/serva-ui/components/serva/container";
import { Fragment } from "react";
import { CompanyForm } from "../company-form";

export default function NewCompanyPage() {
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
