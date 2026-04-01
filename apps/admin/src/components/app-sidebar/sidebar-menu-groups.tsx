"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@serva/serva-ui";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@serva/serva-ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { MENU_ITEMS } from "./sidebar-menu-config";

export function SidebarMenuGroups() {
  const { toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === href;
      return pathname.startsWith(href);
    },
    [pathname],
  );

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupContent>
        <SidebarMenu>
          {MENU_ITEMS.map((item) => {
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  className={cn(isActive(item.url) && "bg-primary-1 text-primary-dark")}
                  onClick={() => isMobile && toggleSidebar()}
                  render={
                    <Link href={item.url}>
                      <HugeiconsIcon
                        icon={item.icon}
                        strokeWidth={1.5}
                        className="transition-transform duration-150 ease-linear group-hover/menu-item:scale-115 group-hover/menu-item:-rotate-3"
                      />
                      <span>{item.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
