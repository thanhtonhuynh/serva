"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/contexts/SessionProvider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { hasPermission } from "@/lib/auth/permission";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  MENU_GROUP_LABELS,
  MENU_GROUPS,
  MENU_ITEMS,
  type MenuGroupKey,
  type MenuItem,
} from "./sidebar-menu-config";

const PROFILE_URL_PLACEHOLDER = "__profile__";

export function SidebarMenuGroups() {
  const { identity, companyCtx } = useSession();
  const { toggleSidebar } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();
  const email = identity?.email ?? "";

  const visibleItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      if (item.employeeOnly) {
        return !!companyCtx?.employee;
      }
      if (item.permission) {
        return hasPermission(identity, companyCtx, item.permission);
      }
      return true;
    });
  }, [identity, companyCtx]);

  const itemsByGroup = useMemo(() => {
    return MENU_GROUPS.reduce(
      (acc, group) => {
        acc[group] = visibleItems.filter((item) => item.group === group);
        return acc;
      },
      {} as Record<MenuGroupKey, MenuItem[]>,
    );
  }, [visibleItems]);

  const resolveUrl = useCallback(
    (url: string) =>
      url === PROFILE_URL_PLACEHOLDER ? `/profile/${encodeURIComponent(email)}` : url,
    [email],
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === href;
      return pathname.startsWith(href);
    },
    [pathname],
  );

  return (
    <>
      {Object.entries(itemsByGroup).map(([groupKey, items]) => {
        if (items.length === 0) return null;

        const label = MENU_GROUP_LABELS[groupKey as MenuGroupKey];

        return (
          <SidebarGroup key={groupKey} className="py-1">
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}

            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const href = resolveUrl(item.url);
                  const isActiveItem = isActive(href);

                  return (
                    <SidebarMenuItem key={item.url + item.title}>
                      <SidebarMenuButton
                        className={cn(isActiveItem && "bg-primary-1 text-primary-dark")}
                        onClick={() => isMobile && toggleSidebar()}
                        render={
                          <Link href={href}>
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
      })}
    </>
  );
}
