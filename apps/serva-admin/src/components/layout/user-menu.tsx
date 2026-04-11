"use client";

import type { Identity } from "@serva/auth/session";
import { ProfilePicture, SIcon, Typography } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@serva/serva-ui/components/dropdown-menu";
import { sidebarMenuButtonVariants } from "@serva/serva-ui/components/sidebar";
import { cn } from "@serva/serva-ui/lib/utils";
import { getAppBaseUrl } from "@serva/shared/config";

type Props = {
  identity: Identity;
};

export function UserMenu({ identity }: Props) {
  return (
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
        </div>
        <SIcon icon="ARROW_DOWN" strokeWidth={1.5} className="ml-auto" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" className="w-(--anchor-width)">
        <DropdownMenuItem className="p-0">
          <Button
            nativeButton={false}
            variant={`accent`}
            className="w-full justify-start rounded-xl"
            render={<a href={`${getAppBaseUrl("auth-portal")}/logout`} />}
          >
            <SIcon icon="LOGOUT" strokeWidth={1.5} />
            <span className="ml-2">Logout</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
