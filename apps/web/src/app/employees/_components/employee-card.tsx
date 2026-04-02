import { AccountStatusBadge } from "@/components/shared";
import { DisplayEmployee } from "@serva/shared";
import { ProfilePicture, Typography } from "@serva/serva-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/serva-ui";
import { ReactNode } from "react";

type EmployeeCardProps = {
  user: DisplayEmployee;
  actions: ReactNode;
};

export function EmployeeCard({ user, actions }: EmployeeCardProps) {
  return (
    <Card size="sm" className="flex flex-col justify-center">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ProfilePicture image={user.identity.image} size={32} name={user.identity.name} />
            <span className="underline-offset-2 group-hover:underline">{user.identity.name}</span>
          </div>

          <AccountStatusBadge status={user.status} />
        </CardTitle>

        <div className="">{actions}</div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Typography variant="p-sm" className="flex items-center gap-3">
          Job: <span className="font-medium">{user.job?.name ?? "—"}</span>
        </Typography>

        <Typography variant="p-sm" className="flex items-center gap-2">
          Email: <span className="font-medium">{user.identity.email}</span>
        </Typography>
      </CardContent>
    </Card>
  );
}
