import { Header } from "@/components/layout/header";
import { platformAdminGuard } from "@serva/auth";
import { listAllIdentities } from "@serva/database/dal";
import {
  Badge,
  Card,
  CardContent,
  Container,
  ProfilePicture,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@serva/serva-ui";
import { format } from "date-fns";
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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Profiles</TableHead>
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
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          <ProfilePicture image={identity.image} size={32} name={identity.name} />
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
                      <TableCell>
                        <Badge variant="outline">
                          {identity._count.operators} ops + {identity._count.employees} emps
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(identity.createdAt, "MMMM d, yyyy")}
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
