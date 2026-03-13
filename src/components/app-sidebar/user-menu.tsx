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
import type { User } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";

type Props = {
  user: User;
};

export function UserMenu({ user }: Props) {
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
            <ProfilePicture image={user.image} size={32} name={user.name} />
            <div className="flex-1">
              <Typography variant="p-sm" className="truncate font-medium">
                {user.name}
              </Typography>

              <Typography variant="p-xs" className="capitalize">
                {user.role.isAdminUser ? "Platform Admin" : (user.role.name ?? "No Role")}
              </Typography>

              {/* <Typography variant="p-xs" className="truncate">
                {user.email}
              </Typography> */}
            </div>
            <HugeiconsIcon icon={ICONS.ARROW_UP} strokeWidth={1.5} className="ml-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" className="w-(--anchor-width)">
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
