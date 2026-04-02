"use client";

import type { CompanyContext, Identity } from "@serva/auth/session";
import { ProfilePicture, SIcon, Typography, type IconKey } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@serva/serva-ui/components/dropdown-menu";
import {
  SidebarMenu,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
} from "@serva/serva-ui/components/sidebar";
import { cn } from "@serva/serva-ui/lib/utils";
import { getPublicAdminUrl, getPublicAuthUrl } from "@serva/shared";
import Link from "next/link";
import { useTransition } from "react";
import { exitImpersonatedCompany } from "./actions";

type Props = {
  identity: Identity;
  companyCtx: CompanyContext;
};

const userMenuItems = [
  {
    label: "Switch company",
    icon: "EXCHANGE",
    href: `${getPublicAuthUrl()}/select-company`,
    hidden: (identity: Identity, companyCtx: CompanyContext) =>
      identity.companyCount <= 1 || !!companyCtx.isImpersonatingCompany,
  },
  {
    label: "Account settings",
    icon: "ACCOUNT_SETTINGS",
    href: "/settings",
    hidden: (_identity: Identity, _companyCtx: CompanyContext) => false,
  },
];

export function UserMenu({ identity, companyCtx }: Props) {
  const { operator, employee } = companyCtx;
  const [impersonationExitPending, startImpersonationExit] = useTransition();

  const roleName = companyCtx.isImpersonatingCompany
    ? "Impersonation session"
    : identity.isPlatformAdmin
      ? "Platform Admin"
      : (operator?.role.name ?? employee?.job?.name ?? "");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            id="sidebar-user-menu-trigger"
            className={cn(
              sidebarMenuButtonVariants(),
              "text-primary-dark h-fit cursor-pointer group-data-[collapsible=icon]:p-0!",
            )}
          >
            <ProfilePicture image={identity.image} size={32} name={identity.name} />
            <div className="flex-1">
              <Typography variant="p-sm" className="truncate font-medium">
                {identity.name}
              </Typography>

              <Typography variant="p-xs" className="capitalize">
                {roleName}
              </Typography>
            </div>
            <SIcon icon="ARROW_UP" strokeWidth={1.5} className="ml-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" className="w-(--anchor-width)">
            {userMenuItems.map(
              (item) =>
                !item.hidden(identity, companyCtx) && (
                  <DropdownMenuItem key={item.href} className="p-0">
                    <Button
                      nativeButton={false}
                      variant={`accent`}
                      className="w-full justify-start rounded-xl"
                      render={<Link href={item.href} />}
                    >
                      <SIcon icon={item.icon as IconKey} strokeWidth={1.5} />
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </DropdownMenuItem>
                ),
            )}

            {companyCtx.isImpersonatingCompany && (
              <DropdownMenuItem className="p-0">
                <Button
                  type="button"
                  variant="accent"
                  disabled={impersonationExitPending}
                  className="w-full justify-start rounded-xl"
                  onClick={() => startImpersonationExit(() => void exitImpersonatedCompany())}
                >
                  <SIcon icon="CANCEL_CIRCLE" strokeWidth={1.5} />
                  <span className="ml-2">Exit impersonation</span>
                </Button>
              </DropdownMenuItem>
            )}

            {identity.isPlatformAdmin && (
              <DropdownMenuItem className="p-0">
                <Button
                  nativeButton={false}
                  variant={`accent`}
                  className="w-full justify-start rounded-xl"
                  render={<Link href={getPublicAdminUrl()} />}
                >
                  <SIcon icon="ADMIN" strokeWidth={1.5} />
                  <span className="ml-2">Platform admin portal</span>
                </Button>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="p-0">
              <Button
                nativeButton={false}
                variant={`accent`}
                className="w-full justify-start rounded-xl"
                render={<a href={`${getPublicAuthUrl()}/logout`} />}
              >
                <SIcon icon="LOGOUT" strokeWidth={1.5} />
                <span className="ml-2">Logout</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
