"use client";

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
import { useSession } from "@/contexts/SessionProvider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarMenuGroups } from "./sidebar-menu-groups";
import { UserMenu } from "./user-menu";

export function AppSidebar() {
  const { identity } = useSession();
  const { state, isMobile, toggleSidebar } = useSidebar();

  if (!identity) return null;

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
        <UserMenu identity={identity} />
      </SidebarFooter>
    </Sidebar>
  );
}
