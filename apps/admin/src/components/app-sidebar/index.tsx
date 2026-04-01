"use client";

import { useSession } from "@/contexts/SessionProvider";
import { ProfilePicture, SIcon, Typography } from "@serva/serva-ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@serva/serva-ui/components/sidebar";
import { cn } from "@serva/serva-ui/lib/utils";
import { getPublicAuthUrl } from "@serva/shared";
import Image from "next/image";
import Link from "next/link";
import { SidebarMenuGroups } from "./sidebar-menu-groups";

export function AppSidebar() {
  const { identity } = useSession();
  const { state, isMobile, toggleSidebar } = useSidebar();

  if (!identity || !identity.isPlatformAdmin) return null;

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link
                  className="hover:bg-transparent"
                  href="/"
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <Image
                    priority
                    src={
                      state === "collapsed" && !isMobile
                        ? "/serva-logo-icon.svg"
                        : "/serva-logo-full-white-border-and-text.svg"
                    }
                    alt="Serva Admin"
                    width={240}
                    height={80}
                    className={cn(state === "collapsed" && !isMobile ? "h-5" : "h-10 w-fit")}
                  />
                  <span className="sr-only">Serva Admin home</span>
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
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              )}
            >
              <ProfilePicture image={identity.image} size={32} name={identity.name} />
              <div className="flex-1 group-data-[collapsible=icon]:hidden">
                <Typography variant="p-sm" className="truncate font-medium">
                  {identity.name}
                </Typography>
                <Typography variant="p-xs">Platform Admin</Typography>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href={`${getPublicAuthUrl()}/logout`} />}>
              <SIcon icon="LOGOUT" strokeWidth={1.5} />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
