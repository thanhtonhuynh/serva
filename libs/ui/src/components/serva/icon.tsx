import { ICONS, type IconKey } from "@serva/serva-ui/constants/icons";
import { HugeiconsIcon } from "@hugeicons/react";

type Props = {
  icon: IconKey;
  className?: string;
  strokeWidth?: number;
};

export function SIcon({ icon, className, strokeWidth }: Props) {
  return <HugeiconsIcon icon={ICONS[icon]} className={className} strokeWidth={strokeWidth} />;
}
