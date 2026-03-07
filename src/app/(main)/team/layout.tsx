import { Header } from "@/components/layout";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/shared/typography";
import { Metadata } from "next/types";
import { Fragment } from "react";

export const metadata: Metadata = { title: "Team - Serva" };

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Team</Typography>
      </Header>

      <Container>{children}</Container>
    </Fragment>
  );
}
