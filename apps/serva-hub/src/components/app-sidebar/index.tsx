"use client";

import { useSession } from "@/contexts/SessionProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@serva/serva-ui";
import { cn } from "@serva/serva-ui";
import Image from "next/image";
import Link from "next/link";
import { SidebarMenuGroups } from "./sidebar-menu-groups";
import { UserMenu } from "./user-menu";

export function AppSidebar() {
  const { identity, companyCtx } = useSession();
  const { state, isMobile, toggleSidebar } = useSidebar();

  if (!identity || !companyCtx?.companyId) return null;

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

      <SidebarFooter>
        <UserMenu identity={identity} companyCtx={companyCtx} />
      </SidebarFooter>
    </Sidebar>
  );
}
