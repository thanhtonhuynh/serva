"use client";

import { Button } from "@/components/ui/button";
import { ICONS } from "@/constants/icons";
import { useDroppable } from "@dnd-kit/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useClipboard } from "../_context/clipboard-context";
import type { EntryFormValue, ShiftFormValue } from "../_lib/types";
import { ShiftChip } from "./shift-chip";
import { ShiftEditor } from "./shift-editor";

type EmployeeDayCellProps = {
  dayIndex: number;
  entryIndex: number;
  /** One employee's WorkDayRecord for this day (shifts + note). */
  record: EntryFormValue;
  canManage: boolean;
  dropId: string;
  onEditShift: (shiftIndex: number, shift: ShiftFormValue) => void;
  onDeleteShift: (shiftIndex: number) => void;
  onAddShift: (shift: ShiftFormValue) => void;
  onNotesChange: (notes: string) => void;
};

export function EmployeeDayCell({
  dayIndex,
  entryIndex,
  record,
  canManage,
  dropId,
  onEditShift,
  onDeleteShift,
  onAddShift,
  onNotesChange,
}: EmployeeDayCellProps) {
  const { copiedShift } = useClipboard();
  const { ref, isDropTarget } = useDroppable({ id: dropId });

  const hasShifts = record.shifts.length > 0;

  return (
    <div
      ref={ref}
      className={`flex min-h-[60px] flex-col items-center justify-center gap-1 p-1 transition-colors ${
        isDropTarget ? "bg-primary/10 ring-primary/30 rounded-xl ring-2" : ""
      }`}
    >
      {record.shifts.map((shift, shiftIdx) => (
        <ShiftChip
          key={shiftIdx}
          shift={shift}
          dragId={`shift-${dayIndex}-${entryIndex}-${shiftIdx}`}
          dragData={{ dayIndex, entryIndex, shiftIndex: shiftIdx }}
          canManage={canManage}
          onEdit={(updated) => onEditShift(shiftIdx, updated)}
          onDelete={() => onDeleteShift(shiftIdx)}
        />
      ))}

      {/* {record.note && !canManage && (
        <p className="text-muted-foreground text-xs italic">{record.note}</p>
      )} */}

      {/* {canManage && hasShifts && (
        <Textarea
          value={record.note ?? ""}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Cell note..."
          rows={1}
          className="min-h-6 resize-none rounded-md px-1.5 py-0.5 text-[11px]"
        />
      )} */}

      {canManage && (
        <div className="flex items-center gap-1">
          <ShiftEditor
            onSave={onAddShift}
            trigger={
              <Button variant="accent" size="icon-xs">
                <HugeiconsIcon icon={ICONS.ADD} />
                <span className="sr-only">Add shift</span>
              </Button>
            }
          />
          {copiedShift && (
            <Button variant="accent" size="icon-xs" onClick={() => onAddShift({ ...copiedShift })}>
              <HugeiconsIcon icon={ICONS.FILE_PASTE} />
              <span className="sr-only">Paste shift</span>
            </Button>
          )}
        </div>
      )}

      {!hasShifts && !canManage && <span className="text-muted-foreground text-xs">—</span>}
    </div>
  );
}
