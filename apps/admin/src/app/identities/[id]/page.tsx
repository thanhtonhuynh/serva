import { Header } from "@/components/layout/header";
import { platformAdminGuard } from "@serva/auth";
import { getIdentityAdminDetail } from "@serva/database/dal";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { AdminToggle } from "./admin-toggle";

type Props = { params: Promise<{ id: string }> };

export default async function IdentityDetailPage({ params }: Props) {
  await platformAdminGuard();
  const { id } = await params;
  const identity = await getIdentityAdminDetail(id);
  if (!identity) notFound();

  const isPlatformAdmin = !!identity.adminUser;

  return (
    <Fragment>
      <Header>
        <div>
          <Typography variant="h1">{identity.name}</Typography>
          <Typography variant="p-xs" className="text-muted-foreground">
            {identity.email}
          </Typography>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            nativeButton={false}
            size="sm"
            variant="outline"
            render={<Link href={`/identities/${id}/edit`} />}
          >
            Edit
          </Button>
        </div>
      </Header>

      <Container className="flex flex-col gap-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Typography variant="p-xs" className="text-muted-foreground">
                Account Status
              </Typography>
              <Badge variant={identity.accountStatus === "active" ? "default" : "secondary"}>
                {identity.accountStatus}
              </Badge>
            </div>
            <div>
              <Typography variant="p-xs" className="text-muted-foreground">
                Email Verified
              </Typography>
              <Typography variant="p-sm">{identity.emailVerified ? "Yes" : "No"}</Typography>
            </div>
            <div className="space-y-1">
              <Typography variant="p-xs" className="text-muted-foreground">
                Platform Admin
              </Typography>
              <AdminToggle identityId={id} isPlatformAdmin={isPlatformAdmin} />
            </div>
            <div>
              <Typography variant="p-xs" className="text-muted-foreground">
                Created
              </Typography>
              <Typography variant="p-sm">
                {format(identity.createdAt, "MMMM d, yyyy hh:mm a")}
              </Typography>
            </div>
            <div>
              <Typography variant="p-xs" className="text-muted-foreground">
                Updated
              </Typography>
              <Typography variant="p-sm">
                {format(identity.updatedAt, "MMMM d, yyyy hh:mm a")}
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Operator memberships */}
        <Card>
          <CardHeader>
            <CardTitle>Operator Memberships ({identity.operators.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {identity.operators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground py-6 text-center">
                      No operator memberships.
                    </TableCell>
                  </TableRow>
                ) : (
                  identity.operators.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>
                        <Link href={`/companies/${op.company.id}`} className="hover:underline">
                          {op.company.name}
                        </Link>
                      </TableCell>
                      <TableCell>{op.role?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={op.status === "active" ? "default" : "secondary"}>
                          {op.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Employee memberships */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Memberships ({identity.employees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {identity.employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground py-6 text-center">
                      No employee memberships.
                    </TableCell>
                  </TableRow>
                ) : (
                  identity.employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Link href={`/companies/${emp.company.id}`} className="hover:underline">
                          {emp.company.name}
                        </Link>
                      </TableCell>
                      <TableCell>{emp.job?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                          {emp.status}
                        </Badge>
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
