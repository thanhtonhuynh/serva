"use client";

import { Badge } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui/components/button";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  demoteFromPlatformAdminAction,
  promoteToPlatformAdminAction,
} from "../actions";

type Props = { identityId: string; isPlatformAdmin: boolean };

export function AdminToggle({ identityId, isPlatformAdmin }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const action = isPlatformAdmin
        ? demoteFromPlatformAdminAction
        : promoteToPlatformAdminAction;
      const result = await action(identityId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isPlatformAdmin ? "Admin status removed." : "Promoted to platform admin.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isPlatformAdmin ? "destructive" : "secondary"}>
        {isPlatformAdmin ? "Yes" : "No"}
      </Badge>
      <Button size="sm" variant="outline" onClick={handleToggle} disabled={isPending}>
        {isPlatformAdmin ? "Demote" : "Promote"}
      </Button>
    </div>
  );
}
