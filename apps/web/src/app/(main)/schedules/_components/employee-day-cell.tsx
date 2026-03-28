"use client";

import { Button } from "@serva/ui/components/button";
import { ICONS } from "@/constants/icons";
import { cn } from "@serva/ui/lib/utils";
import type { WeekScheduleInput, WorkShiftInput } from "@/lib/validations";
import { useDroppable } from "@dnd-kit/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Control } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { useClipboard } from "../_context/clipboard-context";
import { ShiftChip } from "./shift-chip";
import { ShiftEditor } from "./shift-editor";

type Props = {
  control: Control<WeekScheduleInput>;
  dayIndex: number;
  recordIndex: number;
  canManage: boolean;
  dropId: string;
  onSnapshot: () => void;
};

export function EmployeeDayCell(props: Props) {
  const { control, dayIndex, recordIndex, canManage, dropId, onSnapshot } = props;
  const { copiedShift } = useClipboard();
  const { ref, isDropTarget } = useDroppable({ id: dropId });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `days.${dayIndex}.records.${recordIndex}.shifts`,
  });

  const hasShifts = fields.length > 0;

  function handleAddShift(newShift: WorkShiftInput) {
    append(newShift);
    onSnapshot();
  }

  function handleEditShift(shiftIndex: number, updatedShift: WorkShiftInput) {
    update(shiftIndex, updatedShift);
    onSnapshot();
  }

  function handleDeleteShift(shiftIndex: number) {
    remove(shiftIndex);
    onSnapshot();
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-[60px] flex-col items-center justify-center gap-1 p-1 transition-colors",
        isDropTarget && "bg-primary/10 ring-primary/30 rounded-xl ring-2",
      )}
    >
      {fields.map((field, shiftIdx) => (
        <ShiftChip
          key={field.id}
          shift={field}
          dragId={`shift-${dayIndex}-${recordIndex}-${shiftIdx}`}
          dragData={{ dayIndex, recordIndex, shiftIndex: shiftIdx }}
          canManage={canManage}
          onEdit={(updated) => handleEditShift(shiftIdx, updated)}
          onDelete={() => handleDeleteShift(shiftIdx)}
        />
      ))}

      {canManage && (
        <div className="flex items-center gap-1">
          <ShiftEditor
            onSave={handleAddShift}
            trigger={
              <Button variant="accent" size="icon-xs">
                <HugeiconsIcon icon={ICONS.ADD} />
                <span className="sr-only">Add shift</span>
              </Button>
            }
          />

          {copiedShift && (
            <Button
              variant="accent"
              size="icon-xs"
              onClick={() => handleAddShift({ ...copiedShift })}
            >
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
