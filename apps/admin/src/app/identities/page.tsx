import { Header } from "@/components/layout/header";
import { platformAdminGuard } from "@serva/auth";
import { listAllIdentities } from "@serva/database";
import { Badge, Typography } from "@serva/serva-ui";
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

export default async function IdentitiesPage() {
  await platformAdminGuard();
  const identities = await listAllIdentities();

  return (
    <Fragment>
      <Header>
        <Typography variant="h1">Identities</Typography>
      </Header>

      <Container>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Companies</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {identities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                      No identities found.
                    </TableCell>
                  </TableRow>
                ) : (
                  identities.map((identity) => (
                    <TableRow key={identity.id}>
                      <TableCell>
                        <Link
                          href={`/identities/${identity.id}`}
                          className="font-medium hover:underline"
                        >
                          {identity.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{identity.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={identity.accountStatus === "active" ? "default" : "secondary"}
                        >
                          {identity.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {identity.adminUser ? <Badge variant="destructive">Admin</Badge> : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {identity._count.operators + identity._count.employees}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {identity.createdAt.toLocaleDateString()}
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
