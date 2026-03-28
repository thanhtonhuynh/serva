import { getEmployeeStatusConfig } from "@serva/shared";
import { ICONS } from "@/constants/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@serva/ui/components/badge";

type Props = {
  status: string;
};

export function AccountStatusBadge({ status }: Props) {
  const statusConfig = getEmployeeStatusConfig(status);

  return (
    <Badge variant={statusConfig.variant} className="gap-1.5">
      <HugeiconsIcon icon={ICONS.DOT} fill="currentColor" className="size-2" />
      {statusConfig.label}
    </Badge>
  );
}
