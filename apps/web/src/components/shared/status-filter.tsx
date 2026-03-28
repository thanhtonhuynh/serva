"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@serva/ui/components/select";
import { useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "awaiting", label: "Awaiting" },
  { value: "deactivated", label: "Deactivated" },
] as const;

type Props = {
  canManageTeamAccess: boolean;
  /** e.g. `/employees` or `/operators` */
  basePath: string;
};

export function StatusFilter({ canManageTeamAccess, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "active";

  function handleStatusChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.push(`${basePath}?${params.toString()}`);
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
