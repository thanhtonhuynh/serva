import { cn } from "@/lib/utils";
import {
  Alert01Icon,
  AlertDiamondIcon,
  CheckmarkCircle01Icon,
  InformationDiamondIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";

type Props = {
  title?: string;
  message: string;
  className?: string;
  variant: "error" | "success" | "info";
};

export function NotiMessage({ title, message, className, variant }: Props) {
  const Icon = useMemo(() => {
    switch (variant) {
      case "error":
        return AlertDiamondIcon;
      case "success":
        return CheckmarkCircle01Icon;
      case "info":
        return InformationDiamondIcon;
    }
  }, [variant]);

  return (
    <div
      data-variant={variant}
      className={cn(
        "mx-auto mt-10 flex items-center gap-2 rounded-xl p-3 text-sm outline-1",
        "data-[variant=error]:outline-error data-[variant=success]:outline-success data-[variant=info]:outline-info",
        "data-[variant=error]:text-error data-[variant=success]:text-success data-[variant=info]:text-info",
        "data-[variant=error]:bg-error/5 data-[variant=success]:bg-success/5 data-[variant=info]:bg-info/5",
        className,
      )}
    >
      <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-4" />

      <div>
        {title && <div className="font-bold">{title}</div>}
        {message}
      </div>
    </div>
  );
}

/** @deprecated Use NotiMessage instead. */
export function ErrorMessage({
  title,
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `outline-destructive text-destructive mx-auto flex items-center gap-2 rounded-xl p-3 text-sm outline-1`,
        className,
      )}
    >
      <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} className="size-4" />

      <div>
        <div className="font-bold">{title}</div>
        {message}
      </div>
    </div>
  );
}

/** @deprecated Use NotiMessage instead. */
export function SuccessMessage({
  title,
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `bg-success mx-auto flex items-center gap-2 rounded-xl p-3 text-xs text-white`,
        className,
      )}
    >
      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />

      <div>
        <div className="font-bold">{title}</div>
        {message}
      </div>
    </div>
  );
}
