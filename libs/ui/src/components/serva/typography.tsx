import { cn } from "@serva/ui/lib/utils";
import { ComponentProps } from "react";

type Props = {
  variant?: "h1" | "h2" | "h3" | "p" | "caption" | "p-sm" | "p-xs";
};

export function Typography({
  variant = "p",
  className,
  children,
  ...props
}: Props & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        // page-title
        variant === "h1" && "text-primary-dark text-lg font-bold tracking-wide",
        // section-title
        variant === "h2" && "text-primary-dark text-base font-bold tracking-wide",
        // subsection-title
        variant === "h3" && "text-primary-dark text-sm font-semibold tracking-wide uppercase",
        // caption
        variant === "caption" && "text-sm font-semibold",
        // body
        variant === "p" && "space-y-1",
        variant === "p-sm" && "space-y-1 text-sm",
        variant === "p-xs" && "space-y-1 text-xs",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
