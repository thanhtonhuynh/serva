import { HugeiconsIcon } from "@hugeicons/react";
import { ICONS, type IconKey } from "../../constants/icons";

type Props = {
  icon: IconKey;
  className?: string;
  strokeWidth?: number;
};

export function SIcon({ icon, className, strokeWidth }: Props) {
  return <HugeiconsIcon icon={ICONS[icon]} className={className} strokeWidth={strokeWidth} />;
}
