"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Awaiting Verification" },
  { value: "deactivated", label: "Deactivated" },
] as const;

type Props = {
  canManageTeamAccess: boolean;
};

export function StatusFilter({ canManageTeamAccess }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "active";

  function handleStatusChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.push(`/team?${params.toString()}`);
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      items={STATUS_OPTIONS}
      disabled={!canManageTeamAccess}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>

      <SelectContent alignItemWithTrigger={false}>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
