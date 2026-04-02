"use client";

import { Button } from "@serva/serva-ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@serva/serva-ui";
import { LayoutGrid, TableIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export type ViewMode = "table" | "cards";

type Props = {
  basePath: string;
};

export function ViewToggle({ basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get("view") as ViewMode) || "table";

  function handleViewChange(view: ViewMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-full border p-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant={currentView === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => handleViewChange("table")}
            >
              <TableIcon className="h-4 w-4" />
              <span className="sr-only">Table view</span>
            </Button>
          }
        />
        <TooltipContent>Table view</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant={currentView === "cards" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => handleViewChange("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">Card view</span>
            </Button>
          }
        />
        <TooltipContent>Card view</TooltipContent>
      </Tooltip>
    </div>
  );
}
