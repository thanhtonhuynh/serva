import type { IconKey } from "@/constants/icons";
import { cn } from "@serva/ui/lib/utils";
import { useMemo, type ComponentProps } from "react";
import { SIcon } from "./icon";

type Props = {
  title?: string;
  message: React.ReactNode;
  variant?: "error" | "success" | "info";
};

export function Callout({
  title,
  message,
  variant,
  className,
  ...props
}: Props & ComponentProps<"div">) {
  const icon = useMemo((): IconKey | null => {
    switch (variant) {
      case "error":
        return "ALERT";
      case "success":
        return "CHECKMARK_CIRCLE";
      case "info":
        return "INFORMATION";
      default:
        return null;
    }
  }, [variant]);

  return (
    <div
      data-variant={variant}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl bg-neutral-600/10 px-4 py-3 text-sm whitespace-pre-line outline-1 outline-neutral-600",
        "data-[variant=error]:outline-error data-[variant=success]:outline-success data-[variant=info]:outline-info",
        "data-[variant=error]:text-error data-[variant=success]:text-success data-[variant=info]:text-info",
        "data-[variant=error]:bg-error/10 data-[variant=success]:bg-success/10 data-[variant=info]:bg-info/10",
        className,
      )}
      {...props}
    >
      {icon && <SIcon icon={icon} className="size-5" strokeWidth={2} />}

      <div>
        {title && <div className="font-bold">{title}</div>}
        {message}
      </div>
    </div>
  );
}
