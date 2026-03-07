import { AccountStatusBadge, ProfilePicture, Typography } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayUser } from "@/types";
import Link from "next/link";
import { ReactNode } from "react";

type EmployeeCardProps = {
  user: DisplayUser;
  actions: ReactNode;
};

export function EmployeeCard({ user, actions }: EmployeeCardProps) {
  return (
    <Card size="sm" className="flex flex-col justify-center">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-3 text-sm">
          <Link href={`/profile/${user.username}`} className="group flex items-center gap-2">
            <ProfilePicture image={user.image} size={32} name={user.name} />
            <span className="underline-offset-2 group-hover:underline">{user.name}</span>
          </Link>

          <AccountStatusBadge status={user.accountStatus} />
        </CardTitle>

        <div className="">{actions}</div>
      </CardHeader>

      <CardContent className="space-y-2">
        <Typography variant="p-sm" className="flex items-center gap-3">
          Role: <span className="font-medium">{user.role?.name ?? "No Role"}</span>
        </Typography>

        <Typography variant="p-sm" className="flex items-center gap-2">
          Email: <span className="font-medium">{user.email}</span>
        </Typography>
      </CardContent>
    </Card>
  );
}
