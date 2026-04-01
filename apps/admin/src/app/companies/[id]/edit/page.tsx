import { Header } from "@/components/layout/header";
import { getCompanyAdminDetail } from "@serva/database/dal";
import { Typography } from "@serva/serva-ui";
import { Container } from "@serva/serva-ui/components/serva/container";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { CompanyForm } from "../../company-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params;
  const company = await getCompanyAdminDetail(id);
  if (!company) notFound();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Edit {company.name}</Typography>
      </Header>

      <Container>
        <CompanyForm
          mode="edit"
          companyId={id}
          defaultValues={{ name: company.name, slug: company.slug }}
        />
      </Container>
    </Fragment>
  );
}
