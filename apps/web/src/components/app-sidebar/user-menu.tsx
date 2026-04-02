"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { CompanyContext, Identity } from "@serva/auth/session";
import { ProfilePicture, Typography } from "@serva/serva-ui";
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
import { ICONS } from "@serva/serva-ui/constants/icons";
import { cn } from "@serva/serva-ui/lib/utils";
import { getPublicAdminUrl, getPublicAuthUrl } from "@serva/shared";
import Link from "next/link";

type Props = {
  identity: Identity;
  companyCtx: CompanyContext;
};

const userMenuItems = [
  {
    label: "Switch company",
    icon: ICONS.EXCHANGE,
    href: `${getPublicAuthUrl()}/select-company`,
    hidden: (identity: Identity) => identity.companyCount <= 1,
  },
  {
    label: "Account settings",
    icon: ICONS.ACCOUNT_SETTINGS,
    href: "/settings",
    hidden: false,
  },
];

export function UserMenu({ identity, companyCtx }: Props) {
  const { operator, employee } = companyCtx;

  const roleName = identity.isPlatformAdmin
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
            <HugeiconsIcon icon={ICONS.ARROW_UP} strokeWidth={1.5} className="ml-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" className="w-(--anchor-width)">
            {userMenuItems.map(
              (item) =>
                !item.hidden && (
                  <DropdownMenuItem key={item.href} className="p-0">
                    <Button
                      nativeButton={false}
                      variant={`accent`}
                      className="w-full justify-start rounded-xl"
                      render={<Link href={item.href} />}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.5} />
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </DropdownMenuItem>
                ),
            )}

            {identity.isPlatformAdmin && (
              <DropdownMenuItem className="p-0">
                <Button
                  nativeButton={false}
                  variant={`accent`}
                  className="w-full justify-start rounded-xl"
                  render={<Link href={getPublicAdminUrl()} />}
                >
                  <HugeiconsIcon icon={ICONS.ADMIN} strokeWidth={1.5} />
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
                <HugeiconsIcon icon={ICONS.LOGOUT} strokeWidth={1.5} />
                <span className="ml-2">Logout</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
