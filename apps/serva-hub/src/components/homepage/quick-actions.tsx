import { hasPermission } from "@/utils/permission";
import { Calculator01Icon, Calendar02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { CompanyContext, Identity } from "@serva/auth/session";
import { Button, ICONS, Typography } from "@serva/serva-ui";
import { PERMISSIONS } from "@serva/shared";
import Link from "next/link";

type Props = {
  identity: Identity;
  companyCtx: CompanyContext;
};

export function QuickActions({ identity, companyCtx }: Props) {
  return (
    <>
      <Typography variant="h3">Quick Actions</Typography>

      <div className="flex flex-col items-start gap-1">
        {hasPermission(identity, companyCtx, PERMISSIONS.REPORTS_CREATE) && (
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
      </div>
    </>
  );
}
