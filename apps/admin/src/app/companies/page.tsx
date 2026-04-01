import { Header } from "@/components/layout/header";
import { platformAdminGuard } from "@serva/auth";
import { listAllCompanies } from "@serva/database/dal";
import { Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import { Card, CardContent } from "@serva/serva-ui/components/card";
import { Container } from "@serva/serva-ui/components/serva/container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui/components/table";
import Link from "next/link";
import { Fragment } from "react";

export default async function CompaniesPage() {
  await platformAdminGuard();
  const companies = await listAllCompanies();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Companies</Typography>
        <div className="ml-auto">
          <Button nativeButton={false} size="sm" render={<Link href="/companies/new" />}>
            New Company
          </Button>
        </div>
      </Header>

      <Container>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Operators</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                      No companies yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link href={`/companies/${c.id}`} className="font-medium hover:underline">
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                      <TableCell className="text-right">{c._count.operators}</TableCell>
                      <TableCell className="text-right">{c._count.employees}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.createdAt.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Fragment>
  );
}
