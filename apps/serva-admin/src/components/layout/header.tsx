"use client";

import { usePageTitleContext } from "@/contexts/page-title-provider";
import { useSession } from "@/contexts/SessionProvider";
import { cn, Separator, SidebarTrigger } from "@serva/serva-ui";
import type { ComponentProps } from "react";
import { memo } from "react";
import { UserMenu } from "./user-menu";

const UserMenuMemo = memo(
  UserMenu,
  (prev, next) =>
    prev.identity.id === next.identity.id &&
    prev.identity.name === next.identity.name &&
    prev.identity.image === next.identity.image,
);

export function Header({ className, ...props }: Omit<ComponentProps<"header">, "children">) {
  const { identity } = useSession();
  const { title } = usePageTitleContext();

  return (
    <header
      className={cn(
        "bg-card mx-2 mt-2 flex h-14 shrink-0 items-center gap-3 px-3 md:m-0",
        className,
      )}
      {...props}
    >
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2" />
      <div className="flex min-w-0 flex-1 items-center gap-4">{title}</div>
      <div className="shrink-0">{identity && <UserMenuMemo identity={identity} />}</div>
    </header>
  );
}
