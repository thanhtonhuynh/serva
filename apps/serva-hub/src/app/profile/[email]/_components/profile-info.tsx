import { ProfilePicture } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui";
import { Separator } from "@serva/serva-ui";
import type { IdentityProfile } from "@serva/database/dal";
import {
  Calendar02Icon,
  Mail01Icon,
  Settings01Icon,
  ShieldUserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import Link from "next/link";

type ProfileInfoProps = {
  identity: IdentityProfile;
  isOwner: boolean;
};

export function ProfileInfo({ identity, isOwner }: ProfileInfoProps) {
  const joinDate = format(new Date(identity.createdAt), "MMMM d, yyyy");

  const roleName = identity.isPlatformAdmin ? "Platform Admin" : (identity.roleName ?? "No Role");

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <ProfilePicture image={identity.image} size={256} name={identity.name} />

        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold">{identity.name}</h2>
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
      <div className="bg-background grid gap-6 rounded-xl border p-6 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
            <HugeiconsIcon icon={Mail01Icon} className="text-primary size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="text-sm font-medium">{identity.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
            <HugeiconsIcon icon={Calendar02Icon} className="text-primary size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Joined</p>
            <p className="text-sm font-medium">{joinDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
            <HugeiconsIcon icon={ShieldUserIcon} className="text-primary size-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Role</p>
            <span className="text-sm font-medium">{roleName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
