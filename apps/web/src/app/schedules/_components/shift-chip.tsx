"use client";

import { SIcon } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui";
import { cn } from "@serva/serva-ui";
import type { WorkShiftInput } from "@/lib/validations";
import { useDraggable } from "@dnd-kit/react";
import { useClipboard } from "../_context/clipboard-context";
import { minutesToTimeString } from "../_lib";
import { ShiftEditor } from "./shift-editor";

type Props = {
  shift: WorkShiftInput;
  dragId: string;
  dragData: { dayIndex: number; recordIndex: number; shiftIndex: number };
  canManage: boolean;
  onEdit: (shift: WorkShiftInput) => void;
  onDelete: () => void;
};

export function ShiftChip(props: Props) {
  const { shift, dragId, dragData, canManage, onEdit, onDelete } = props;
  const { copyShift } = useClipboard();
  const { ref, isDragging } = useDraggable({ id: dragId, data: dragData });

  return (
    <div
      ref={canManage ? ref : undefined}
      className={cn(
        "group/chip bg-primary/20 border-accent-foreground/50 relative flex w-full flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs",
        isDragging ? "opacity-50" : "",
        canManage ? "cursor-grab active:cursor-grabbing" : "",
      )}
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
            onClick={() => copyShift(shift)}
          >
            <SIcon icon="COPY" strokeWidth={1.5} />
            <span className="sr-only">Copy</span>
          </Button>

          <ShiftEditor
            initial={shift}
            onSave={onEdit}
            trigger={
              <Button variant="ghost" className="hover:text-primary" size="icon-xs">
                <SIcon icon="EDIT" strokeWidth={1.5} />
              </Button>
            }
          />

          <Button
            variant="ghost"
            className="hover:text-destructive"
            size="icon-xs"
            onClick={onDelete}
          >
            <SIcon icon="DELETE" strokeWidth={1.5} />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
}
