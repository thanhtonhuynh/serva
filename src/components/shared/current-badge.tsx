import { Badge } from "@/components/ui/badge";
import { RecordIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function CurrentBadge() {
  return (
    <Badge variant="default">
      <HugeiconsIcon icon={RecordIcon} fill="currentColor" className="size-2" />
      Current
    </Badge>
  );
}
