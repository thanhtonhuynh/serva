"use client";

import { ProfilePicture } from "@/components/shared";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type WeekScheduleInput,
  type WorkDayRecordsByDate,
  type WorkShiftInput,
} from "@/data-access/work-day-record";
import { cn } from "@/lib/utils";
import type { DisplayUser } from "@/types";
import { formatInUTC, getTodayUTCMidnight } from "@/utils/datetime";
import { DragDropProvider } from "@dnd-kit/react";
import { useCallback, useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClipboardProvider } from "../_context/clipboard-context";
import { useNavigationGuard } from "../_hooks/use-navigation-guard";
import { useUndoRedo } from "../_hooks/use-undo-redo";
import { buildInitialWeekScheduleInput, getEmployeeWeekHours } from "../_lib";
import { saveWeekScheduleAction } from "../actions";
import { EmployeeDayCell } from "./employee-day-cell";
import { ScheduleToolbar } from "./schedule-toolbar";
import { WeekNav } from "./week-nav";

type Props = {
  weekStartUTC: Date;
  weekEndUTC: Date;
  prevWeekParam: string;
  nextWeekParam: string;
  weekDates: string[]; // YYYY-MM-DD for each day of the week
  recordsByDate: WorkDayRecordsByDate;
  employees: DisplayUser[];
  canManage: boolean;
};

export function ScheduleWeekGrid(props: Props) {
  const {
    weekStartUTC,
    weekEndUTC,
    prevWeekParam,
    nextWeekParam,
    weekDates,
    recordsByDate,
    employees,
    canManage,
  } = props;

  const initialWeekScheduleInput = useMemo(
    () => buildInitialWeekScheduleInput(weekDates, recordsByDate, employees),
    [weekDates, recordsByDate, employees],
  );

  const form = useForm<WeekScheduleInput>({
    defaultValues: initialWeekScheduleInput,
  });

  const { isDirty } = form.formState;
  const { snapshot, undo, redo, clearHistory, canUndo, canRedo } = useUndoRedo(form);
  const [isSaving, startSaveTransition] = useTransition();
  const { confirmDialog, guardedNavigate } = useNavigationGuard(isDirty);
  // Watch form values to re-render cells
  const watchedDays = form.watch("days");

  const isToday = useCallback((dateStr: string) => {
    return dateStr === formatInUTC(getTodayUTCMidnight());
  }, []);

  // Take initial snapshot
  useEffect(() => {
    snapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset form when server data changes (e.g. after save + revalidation)
  useEffect(() => {
    form.reset(initialWeekScheduleInput);
  }, [initialWeekScheduleInput, form]);

  /** Handle add shift button click. */
  const addShift = useCallback(
    (dayIndex: number, entryIndex: number, shift: WorkShiftInput) => {
      const shifts = form.getValues(`days.${dayIndex}.records.${entryIndex}.shifts`);
      form.setValue(`days.${dayIndex}.records.${entryIndex}.shifts`, [...shifts, shift], {
        shouldDirty: true,
      });
      snapshot();
    },
    [form, snapshot],
  );

  /** Handle edit shift button click. */
  const editShift = useCallback(
    (dayIndex: number, entryIndex: number, shiftIndex: number, shift: WorkShiftInput) => {
      form.setValue(`days.${dayIndex}.records.${entryIndex}.shifts.${shiftIndex}`, shift, {
        shouldDirty: true,
      });
      snapshot();
    },
    [form, snapshot],
  );

  /** Handle delete shift button click. */
  const deleteShift = useCallback(
    (dayIndex: number, entryIndex: number, shiftIndex: number) => {
      const shifts = form.getValues(`days.${dayIndex}.records.${entryIndex}.shifts`);
      form.setValue(
        `days.${dayIndex}.records.${entryIndex}.shifts`,
        shifts.filter((_, i) => i !== shiftIndex),
        { shouldDirty: true },
      );
      snapshot();
    },
    [form, snapshot],
  );

  /** Handle notes change event. */
  const updateNotes = useCallback(
    (dayIndex: number, entryIndex: number, notes: string) => {
      form.setValue(`days.${dayIndex}.records.${entryIndex}.note`, notes, {
        shouldDirty: true,
      });
    },
    [form],
  );

  /** Handle drag and drop end event. */
  const handleDragEnd = useCallback(
    (event: {
      operation: {
        source: { id: string | number; data?: unknown } | null;
        target: { id: string | number; data?: unknown } | null;
      };
      canceled: boolean;
      nativeEvent?: Event;
    }) => {
      if (event.canceled) return;
      const { source, target } = event.operation;
      if (!source || !target) return;

      const sourceData = source.data as
        | {
            dayIndex: number;
            entryIndex: number;
            shiftIndex: number;
          }
        | undefined;
      if (!sourceData) return;

      // Parse target dropId: "drop-{dayIndex}-{entryIndex}"
      const targetId = String(target.id);
      const match = targetId.match(/^drop-(\d+)-(\d+)$/);
      if (!match) return;
      const targetDayIdx = parseInt(match[1], 10);
      const targetEntryIdx = parseInt(match[2], 10);

      // Skip if dropping on same cell
      if (sourceData.dayIndex === targetDayIdx && sourceData.entryIndex === targetEntryIdx) return;

      const srcShifts = form.getValues(
        `days.${sourceData.dayIndex}.records.${sourceData.entryIndex}.shifts`,
      );
      const shift = srcShifts[sourceData.shiftIndex];
      if (!shift) return;

      // Alt/Option key held during the drop = copy, otherwise move
      const isCopy =
        event.nativeEvent instanceof KeyboardEvent
          ? event.nativeEvent.altKey
          : ((event.nativeEvent as MouseEvent | undefined)?.altKey ?? false);

      // Add to target
      const targetShifts = form.getValues(`days.${targetDayIdx}.records.${targetEntryIdx}.shifts`);
      form.setValue(
        `days.${targetDayIdx}.records.${targetEntryIdx}.shifts`,
        [...targetShifts, { ...shift }],
        {
          shouldDirty: true,
        },
      );

      // Remove from source (unless copy)
      if (!isCopy) {
        form.setValue(
          `days.${sourceData.dayIndex}.records.${sourceData.entryIndex}.shifts`,
          srcShifts.filter((_, i) => i !== sourceData.shiftIndex),
          { shouldDirty: true },
        );
      }

      snapshot();
    },
    [form, snapshot],
  );

  /** Handle save button click. */
  const handleSave = useCallback(() => {
    const values = form.getValues();
    startSaveTransition(async () => {
      const result = await saveWeekScheduleAction({ start: weekStartUTC, end: weekEndUTC }, values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Schedule saved.");
        clearHistory();
        snapshot();
      }
    });
  }, [form, clearHistory, snapshot]);

  /** Handle reset button click. */
  const handleReset = useCallback(() => {
    form.reset(initialWeekScheduleInput);
    snapshot();
  }, [form, initialWeekScheduleInput, snapshot]);

  return (
    <>
      <ClipboardProvider>
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <WeekNav
              weekStartUTC={weekStartUTC}
              weekEndUTC={weekEndUTC}
              prevWeekParam={prevWeekParam}
              nextWeekParam={nextWeekParam}
              guardedNavigate={guardedNavigate}
            />
            {canManage && (
              <ScheduleToolbar
                isDirty={isDirty}
                isSaving={isSaving}
                canUndo={canUndo}
                canRedo={canRedo}
                onSave={handleSave}
                onReset={handleReset}
                onUndo={undo}
                onRedo={redo}
              />
            )}
          </div>

          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow className="divide-x">
                  <TableHead className="min-w-[150px] font-semibold">Team Member</TableHead>
                  {weekDates.map((dateStr) => (
                    <TableHead
                      key={dateStr}
                      className={cn(
                        "min-w-[140px] text-center font-semibold",
                        isToday(dateStr) && "bg-primary/20",
                      )}
                    >
                      {formatInUTC(dateStr, "EEE M/d")}
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[80px] text-center font-semibold">Total</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {employees.map((emp, empIdx) => (
                  <TableRow key={emp.id} className="divide-x">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ProfilePicture image={emp.image} size={28} name={emp.name} />
                        <span className="text-sm">{emp.name}</span>
                      </div>
                    </TableCell>

                    {weekDates.map((dateStr, dayIdx) => {
                      const record = watchedDays?.[dayIdx]?.records?.[empIdx] ?? {
                        userId: emp.id,
                        shifts: [],
                      };
                      const dropId = `drop-${dayIdx}-${empIdx}`;
                      return (
                        <TableCell
                          key={dayIdx}
                          className={cn("p-1 text-center", isToday(dateStr) && "bg-primary/20")}
                        >
                          <EmployeeDayCell
                            dayIndex={dayIdx}
                            entryIndex={empIdx}
                            record={record}
                            canManage={canManage}
                            dropId={dropId}
                            onEditShift={(si, s) => editShift(dayIdx, empIdx, si, s)}
                            onDeleteShift={(si) => deleteShift(dayIdx, empIdx, si)}
                            onAddShift={(s) => addShift(dayIdx, empIdx, s)}
                            onNotesChange={(n) => updateNotes(dayIdx, empIdx, n)}
                          />
                        </TableCell>
                      );
                    })}

                    <TableCell className="text-center font-medium tabular-nums">
                      {getEmployeeWeekHours(watchedDays, empIdx).toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </DragDropProvider>
      </ClipboardProvider>

      {confirmDialog}
    </>
  );
}
