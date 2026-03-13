"use client";

import { Button } from "@/components/ui/button";
import { ICONS } from "@/constants/icons";
import type { WorkShiftInput } from "@/data-access/work-day-record";
import { useDraggable } from "@dnd-kit/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useClipboard } from "../_context/clipboard-context";
import { minutesToTimeString } from "../_lib";
import { ShiftEditor } from "./shift-editor";

type ShiftChipProps = {
  shift: WorkShiftInput;
  dragId: string;
  dragData: { dayIndex: number; entryIndex: number; shiftIndex: number };
  canManage: boolean;
  onEdit: (shift: WorkShiftInput) => void;
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
      className={`group/chip bg-primary/20 border-accent-foreground/50 relative flex w-full flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs ${
        isDragging ? "opacity-50" : ""
      } ${canManage ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <span className="block leading-tight font-medium">
          {minutesToTimeString(shift.startMinutes)} - {minutesToTimeString(shift.endMinutes)}
        </span>
        {shift.note && (
          <span className="text-muted-foreground block truncate leading-tight">{shift.note}</span>
        )}
      </div>

      {canManage && (
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            className="hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              copyShift(shift);
            }}
          >
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} />
            <span className="sr-only">Copy</span>
          </Button>

          <ShiftEditor
            initial={shift}
            onSave={onEdit}
            trigger={
              <Button
                variant="ghost"
                className="hover:text-primary"
                size="icon-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <HugeiconsIcon icon={ICONS.EDIT} strokeWidth={1.5} />
              </Button>
            }
          />

          <Button
            variant="ghost"
            className="hover:text-destructive"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <HugeiconsIcon icon={ICONS.DELETE} strokeWidth={1.5} />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
}
