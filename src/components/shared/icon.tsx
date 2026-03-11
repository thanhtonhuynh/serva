import { ICONS, type IconKey } from "@/constants/icons";
import { HugeiconsIcon } from "@hugeicons/react";

type Props = {
  icon: IconKey;
  className?: string;
};

export function Icon({ icon, className }: Props) {
  return <HugeiconsIcon icon={ICONS[icon]} className={className} />;
}
