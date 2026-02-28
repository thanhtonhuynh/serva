"use client";

import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ICONS } from "@/constants/icons";
import { useSession } from "@/contexts/SessionProvider";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { Typography } from "../shared";
import { ProfilePicture } from "../shared/profile-picture";
import { SidebarMenuGroups } from "./sidebar-menu-groups";

export function AppSidebar() {
  const { user } = useSession();
  const { state, isMobile, toggleSidebar } = useSidebar();

  if (!user) return null;

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size={"lg"}
              render={
                <Link
                  className="hover:bg-transparent"
                  href={"/"}
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <Image
                    priority
                    src={
                      state === "collapsed" && !isMobile
                        ? "/serva-logo-icon.svg"
                        : "/serva-logo-full-white-border-and-text.svg"
                    }
                    alt="Serva"
                    width={240}
                    height={80}
                    className={cn(state === "collapsed" && !isMobile ? "h-5" : "h-10 w-fit")}
                  />
                  <span className="sr-only">Serva home</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="mt-3 gap-0">
        <SidebarMenuGroups />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-fit cursor-pointer"
                render={
                  <SidebarMenuButton className="text-primary-foreground group-data-[collapsible=icon]:p-0!">
                    <ProfilePicture image={user?.image} size={32} name={user?.name} />
                    <div className="flex-1">
                      <Typography variant="p-sm" className="truncate font-medium">
                        {user?.name}
                      </Typography>

                      <Typography variant="p-xs" className="capitalize">
                        {user.role.isAdminUser ? "Platform Admin" : (user.role.name ?? "No Role")}
                      </Typography>

                      <Typography variant="p-xs" className="truncate">
                        {user?.email}
                      </Typography>
                    </div>
                    <HugeiconsIcon icon={ICONS.ARROW_UP} strokeWidth={1.5} className="ml-auto" />
                  </SidebarMenuButton>
                }
              />

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
      </SidebarFooter>
    </Sidebar>
  );
}
