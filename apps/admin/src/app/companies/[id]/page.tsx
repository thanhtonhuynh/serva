import { Header } from "@/components/layout/header";
import { getCompanyAdminDetail } from "@serva/database";
import { Badge, Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/serva-ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui/components/table";
import { Container } from "@serva/serva-ui/components/serva/container";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

type Props = { params: Promise<{ id: string }> };

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const company = await getCompanyAdminDetail(id);
  if (!company) notFound();

  return (
    <Fragment>
      <Header>
        <div>
          <Typography variant="h1">{company.name}</Typography>
          <Typography variant="p-xs" className="text-muted-foreground">
            {company.slug}
          </Typography>
        </div>
        <div className="ml-auto">
          <Button
            nativeButton={false}
            size="sm"
            variant="outline"
            render={<Link href={`/companies/${id}/edit`} />}
          >
            Edit
          </Button>
        </div>
      </Header>

      <Container className="flex flex-col gap-6">
        {/* Operators */}
        <Card>
          <CardHeader>
            <CardTitle>Operators ({company.operators.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.operators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground py-6 text-center">
                      No operators.
                    </TableCell>
                  </TableRow>
                ) : (
                  company.operators.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>
                        <Link
                          href={`/identities/${op.identity.id}`}
                          className="hover:underline"
                        >
                          {op.identity.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {op.identity.email}
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

        {/* Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Employees ({company.employees.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground py-6 text-center">
                      No employees.
                    </TableCell>
                  </TableRow>
                ) : (
                  company.employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Link
                          href={`/identities/${emp.identity.id}`}
                          className="hover:underline"
                        >
                          {emp.identity.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.identity.email}
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

        {/* Pending invites */}
        {company.invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invites ({company.invites.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.invites.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.name}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{inv.profileType}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Roles & Jobs summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Roles ({company.roles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {company.roles.length === 0 ? (
                <Typography variant="p-sm" className="text-muted-foreground">
                  No roles defined.
                </Typography>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {company.roles.map((role) => (
                    <Badge key={role.id} variant="outline">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jobs ({company.jobs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {company.jobs.length === 0 ? (
                <Typography variant="p-sm" className="text-muted-foreground">
                  No jobs defined.
                </Typography>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {company.jobs.map((job) => (
                    <Badge key={job.id} variant="outline">
                      {job.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </Fragment>
  );
}
