"use client";

import { Button } from "@/components/ui/button";
import { ICONS } from "@/constants/icons";
import { useDraggable } from "@dnd-kit/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useClipboard } from "../_context/clipboard-context";
import { minutesToTimeString, type ShiftFormValue } from "../_lib/types";
import { ShiftEditor } from "./shift-editor";

type ShiftChipProps = {
  shift: ShiftFormValue;
  dragId: string;
  dragData: { dayIndex: number; entryIndex: number; shiftIndex: number };
  canManage: boolean;
  onEdit: (shift: ShiftFormValue) => void;
  onDelete: () => void;
};

export function ShiftChip({
  shift,
  dragId,
  dragData,
  canManage,
  onEdit,
  onDelete,
}: ShiftChipProps) {
  const { copyShift } = useClipboard();
  const { ref, isDragging } = useDraggable({ id: dragId, data: dragData });

  return (
    <div
      ref={canManage ? ref : undefined}
      className={`group/chip bg-accent border-accent-foreground/10 relative flex w-full flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs ${
        isDragging ? "opacity-50" : ""
      } ${canManage ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <span className="block leading-tight">
          {minutesToTimeString(shift.startMinutes)} - {minutesToTimeString(shift.endMinutes)}
        </span>
        {shift.note && (
          <span className="text-muted-foreground block truncate leading-tight">{shift.note}</span>
        )}
      </div>

      {canManage && (
        <div className="absolute -top-6 left-1/2 hidden shrink-0 -translate-x-1/2 items-center gap-0.5 group-hover/chip:flex">
          <Button
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              copyShift(shift);
            }}
          >
            <HugeiconsIcon icon={Copy01Icon} />
            <span className="sr-only">Copy</span>
          </Button>

          <ShiftEditor
            initial={shift}
            onSave={onEdit}
            trigger={
              <Button size="icon-xs" onClick={(e) => e.stopPropagation()}>
                <HugeiconsIcon icon={ICONS.EDIT} className="size-3" />
              </Button>
            }
          />

          <Button
            variant="default-destructive"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <HugeiconsIcon icon={ICONS.DELETE} />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
}
