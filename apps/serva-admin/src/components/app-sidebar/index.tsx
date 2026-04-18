"use client";

import { useSession } from "@/contexts/session-provider";
import { ROUTES } from "@/lib/routes";
import {
  cn,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@serva/serva-ui";
import Image from "next/image";
import Link from "next/link";
import { SidebarMenuGroups } from "./sidebar-menu-groups";

export function AppSidebar() {
  const { identity } = useSession();
  const { state, isMobile, toggleSidebar } = useSidebar();

  if (!identity || !identity.isPlatformAdmin) return null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size={"lg"}
              render={
                <Link
                  className="hover:bg-transparent"
                  href={ROUTES.home}
                  onClick={() => isMobile && toggleSidebar()}
                />
              }
            >
              <Image
                priority
                src={
                  state === "collapsed" && !isMobile
                    ? "/serva-logo-icon.svg"
                    : "/serva-logo-full.svg"
                }
                alt="Serva"
                width={240}
                height={80}
                className={cn(
                  "transition-transform duration-150 ease-linear group-hover/menu-item:scale-105",
                  state === "collapsed" && !isMobile && "group-hover/menu-item:scale-115",
                  state === "collapsed" && !isMobile ? "h-5" : "h-10 w-fit",
                )}
              />
              <span className="sr-only">Serva home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="mt-3 gap-0">
        <SidebarMenuGroups />
      </SidebarContent>
    </Sidebar>
  );
}
