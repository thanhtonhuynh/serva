import { Typography } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ICONS } from "@/constants/icons";
import { PERMISSIONS } from "@/constants/permissions";
import type { Identity } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { Calculator01Icon, Calendar02Icon, UserAccountIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

type Props = {
  identity: Identity;
};

export function QuickActions({ identity }: Props) {
  return (
    <>
      <Typography variant="h3">Quick Actions</Typography>

      <div className="flex flex-col items-start gap-1">
        {hasPermission(identity.role, PERMISSIONS.REPORTS_CREATE) && (
          <Button
            nativeButton={false}
            size="sm"
            variant={"link"}
            className="text-foreground border-0 p-0"
            render={
              <Link href={`/sales-reports/new`}>
                <HugeiconsIcon icon={ICONS.REPORT_ADD} />
                Create report
              </Link>
            }
          />
        )}

        <Button
          nativeButton={false}
          variant="link"
          size="sm"
          className="text-foreground border-0 p-0"
          render={
            <Link href="/cash-counter">
              <HugeiconsIcon icon={Calculator01Icon} />
              Cash calculator
            </Link>
          }
        />

        <Button
          nativeButton={false}
          variant="link"
          size="sm"
          className="text-foreground border-0 p-0"
          render={
            <Link href="/my-shifts">
              <HugeiconsIcon icon={Calendar02Icon} />
              My shifts
            </Link>
          }
        />

        <Button
          nativeButton={false}
          variant="link"
          size="sm"
          className="text-foreground border-0 p-0"
          render={
            <Link href={`/profile/${identity.username}`}>
              <HugeiconsIcon icon={UserAccountIcon} />
              My profile
            </Link>
          }
        />
      </div>
    </>
  );
}
