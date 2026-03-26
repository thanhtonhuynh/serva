"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SidebarTrigger() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              className="h-12 cursor-pointer"
            >
              {state === "expanded" ? (
                <>
                  <ChevronLeft className="size-4" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Expand</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
