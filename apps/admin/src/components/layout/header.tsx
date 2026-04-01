import { Separator } from "@serva/serva-ui/components/separator";
import { SidebarTrigger } from "@serva/serva-ui/components/sidebar";
import { cn } from "@serva/serva-ui/lib/utils";
import type { ComponentProps } from "react";

export function Header({ children, className, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "bg-card mx-2 mt-2 flex h-14 shrink-0 items-center gap-3 rounded-xl border px-3 md:m-0",
        className,
      )}
      {...props}
    >
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2" />
      {children}
    </header>
  );
}
