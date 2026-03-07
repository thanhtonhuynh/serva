import { cn } from "@/lib/utils";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

type Props = {
  showBackground?: boolean;
  icon: IconSvgElement;
  className?: string;
  iconClassName?: string;
  fill?: string;
  size?: number;
};

export function DecoIcon({
  showBackground = false,
  icon,
  className,
  iconClassName,
  fill,
  size = 5,
}: Props) {
  return (
    <div
      className={cn(
        showBackground && "bg-accent flex size-10 items-center justify-center rounded-full",
        className,
      )}
    >
      <HugeiconsIcon
        icon={icon}
        className={cn("text-accent-foreground", `size-${size}`, iconClassName)}
        {...(fill && { fill })}
      />
    </div>
  );
}
