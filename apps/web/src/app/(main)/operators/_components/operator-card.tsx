import { AccountStatusBadge } from "@/components/shared";
import { DisplayOperator } from "@serva/shared";
import { ProfilePicture, Typography } from "@serva/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@serva/ui/components/card";
import { ReactNode } from "react";

type Props = {
  user: DisplayOperator;
  actions: ReactNode;
};

export function OperatorCard({ user, actions }: Props) {
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

        <div>{actions}</div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Typography variant="p-sm" className="flex items-center gap-3">
          Role: <span className="font-medium">{user.role?.name ?? "—"}</span>
        </Typography>

        <Typography variant="p-sm" className="flex items-center gap-2">
          Email: <span className="font-medium">{user.identity.email}</span>
        </Typography>
      </CardContent>
    </Card>
  );
}
