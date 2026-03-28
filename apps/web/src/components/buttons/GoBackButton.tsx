"use client";

import { Button } from "@serva/ui/components/button";
import { cn } from "@serva/ui/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function GoBackButton({
  className,
  url,
  ...props
}: React.ComponentProps<typeof Button> & {
  url?: string;
}) {
  const router = useRouter();

  return (
    <Button
      className={cn("flex items-center gap-2", className)}
      {...props}
      onClick={() => (url ? router.push(url) : router.back())}
    >
      <ChevronLeft />
      {props.children}
    </Button>
  );
}
