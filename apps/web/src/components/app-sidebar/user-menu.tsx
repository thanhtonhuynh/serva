"use client";

import { logoutAction } from "@/app/(auth)/actions";
import { ProfilePicture, Typography } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, sidebarMenuButtonVariants, SidebarMenuItem } from "@/components/ui/sidebar";
import { ICONS } from "@/constants/icons";
import type { CompanyContext, Identity } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

type Props = {
  identity: Identity;
  companyCtx: CompanyContext;
};

const userMenuItems = [
  {
    label: "Switch company",
    icon: ICONS.EXCHANGE,
    href: "/select-company",
  },
  {
    label: "Account settings",
    icon: ICONS.ACCOUNT_SETTINGS,
    href: "/settings",
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
              "text-primary-1 h-fit cursor-pointer group-data-[collapsible=icon]:p-0!",
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
            {userMenuItems.map((item) => (
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
            ))}

            <DropdownMenuItem className="p-0">
              <Button
                variant={`accent`}
                className="w-full justify-start rounded-xl"
                onClick={async () => {
                  await logoutAction();
                }}
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
