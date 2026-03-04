import { AccountStatusBadge } from "@/components/shared";
import { ProfilePicture } from "@/components/shared/profile-picture";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getEmployeeStatusConfig } from "@/constants/employee";
import type { User } from "@/lib/auth/session";
import {
  AtIcon,
  Calendar02Icon,
  Mail01Icon,
  Settings01Icon,
  ShieldUserIcon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import Link from "next/link";

type ProfileInfoProps = {
  user: User;
  isOwner: boolean;
};

export function ProfileInfo({ user, isOwner }: ProfileInfoProps) {
  const statusConfig = getEmployeeStatusConfig(user.accountStatus);
  const joinDate = format(new Date(user.createdAt), "MMMM d, yyyy");

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <ProfilePicture image={user.image} size={256} name={user.name} />

        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            <HugeiconsIcon icon={AtIcon} className="size-4" />
            {user.username}
          </p>
        </div>

        {/* Edit Button */}
        {isOwner && (
          <Button
            nativeButton={false}
            size="sm"
            render={
              <Link href="/settings">
                <HugeiconsIcon icon={Settings01Icon} className="mr-2 size-4" />
                Edit Profile
              </Link>
            }
          />
        )}
      </div>

      <Separator />

      {/* Details Section */}
      <div className="bg-background grid gap-6 rounded-xl border border-blue-950 p-6 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Mail01Icon} className="text-muted-foreground size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Calendar02Icon} className="text-muted-foreground size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Joined</p>
            <p className="text-sm font-medium">{joinDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={ShieldUserIcon} className="text-muted-foreground size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Role</p>
            <span className="text-sm font-medium">
              {user.role?.isAdminUser ? "Platform Admin" : (user.role?.name ?? "No Role")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={UserCheck01Icon} className="text-muted-foreground size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Status</p>
            <AccountStatusBadge status={user.accountStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
