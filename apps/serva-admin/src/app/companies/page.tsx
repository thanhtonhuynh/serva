import { SetPageTitle } from "@/components/layout";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { listAllCompanies } from "@serva/database/dal";
import {
  Card,
  CardContent,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@serva/serva-ui";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { NewCompanyDialog } from "./company-form-dialog";

export const metadata: Metadata = { title: "Companies — Serva Admin" };

export default async function CompaniesPage() {
  await auth(ROUTES.companies);
  const companies = await listAllCompanies();

  return (
    <Fragment>
      <SetPageTitle title={<Typography variant="h1">Companies</Typography>} />

      <Container>
        <NewCompanyDialog />

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Operators</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Created</TableHead>
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
                        <Link href={ROUTES.company(c.id)} className="font-medium hover:underline">
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                      <TableCell className="text-right">{c._count.operators}</TableCell>
                      <TableCell className="text-right">{c._count.employees}</TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {format(c.createdAt, "MMM d, yyyy hh:mm a")}
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
