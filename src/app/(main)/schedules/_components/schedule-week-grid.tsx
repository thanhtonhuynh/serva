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
import { TooltipProvider } from "@/components/ui/tooltip";
import type { DisplayUser } from "@/types";
import { DragDropProvider } from "@dnd-kit/react";
import { addDays } from "date-fns";
import { useCallback, useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClipboardProvider } from "../_context/clipboard-context";
import { useNavigationGuard } from "../_hooks/use-navigation-guard";
import { useUndoRedo } from "../_hooks/use-undo-redo";
import {
  toUTCDateKey,
  type DayFormValue,
  type EntryFormValue,
  type ShiftFormValue,
  type WeekFormValues,
  type WorkDayRecordsByDate,
} from "../_lib/types";
import { saveWeekScheduleAction } from "../actions";
import { EmployeeDayCell } from "./employee-day-cell";
import { ScheduleToolbar } from "./schedule-toolbar";
import { WeekNav } from "./week-nav";

// ---------------------------------------------------------------------------
// Props: WorkDayRecord-based (no ScheduleDay)
// ---------------------------------------------------------------------------

type ScheduleWeekGridProps = {
  weekStartUTC: Date;
  weekEndUTC: Date;
  prevWeekParam: string;
  nextWeekParam: string;
  weekDates: string[]; // YYYY-MM-DD for each day of the week
  recordsByDate: WorkDayRecordsByDate;
  employees: DisplayUser[];
  canManage: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build 7-day date keys for the week (derived from weekStartUTC if needed). */
function buildWeekDates(weekStartUTC: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => toUTCDateKey(addDays(weekStartUTC, i)));
}

/** Build initial form values from WorkDayRecords by date and employee list. */
function buildInitialValues(
  weekDates: string[],
  recordsByDate: WorkDayRecordsByDate,
  employees: DisplayUser[],
): WeekFormValues {
  const days: DayFormValue[] = weekDates.map((dateStr) => {
    const dayRecords = recordsByDate[dateStr] ?? [];
    const entries: EntryFormValue[] = employees.map((emp) => {
      const record = dayRecords.find((r) => r.userId === emp.id);
      return {
        userId: emp.id,
        shifts: (record?.shifts ?? []).map((s) => ({
          startMinutes: s.startMinutes,
          endMinutes: s.endMinutes,
          note: s.note ?? undefined,
        })),
        note: record?.note ?? undefined,
      };
    });
    return { dateStr, entries };
  });

  return { days };
}

/** Format a UTC date key like "2026-02-23" into "Mon 2/23". */
function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(d);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${dayName} ${month}/${day}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScheduleWeekGrid({
  weekStartUTC,
  weekEndUTC,
  prevWeekParam,
  nextWeekParam,
  weekDates: weekDatesProp,
  recordsByDate,
  employees,
  canManage,
}: ScheduleWeekGridProps) {
  const weekDates = useMemo(
    () => (weekDatesProp.length === 7 ? weekDatesProp : buildWeekDates(weekStartUTC)),
    [weekDatesProp, weekStartUTC],
  );
  const initialValues = useMemo(
    () => buildInitialValues(weekDates, recordsByDate, employees),
    [weekDates, recordsByDate, employees],
  );

  const form = useForm<WeekFormValues>({
    defaultValues: initialValues,
  });

  const { isDirty } = form.formState;
  const { snapshot, undo, redo, clearHistory, canUndo, canRedo } = useUndoRedo(form);
  const [isSaving, startSaveTransition] = useTransition();

  // Take initial snapshot
  useEffect(() => {
    snapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset form when server data changes (e.g. after save + revalidation)
  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  const { confirmDialog, guardedNavigate } = useNavigationGuard(isDirty);

  // ------ Mutators (all local, no server call) ------

  const addShift = useCallback(
    (dayIndex: number, entryIndex: number, shift: ShiftFormValue) => {
      const shifts = form.getValues(`days.${dayIndex}.entries.${entryIndex}.shifts`);
      form.setValue(`days.${dayIndex}.entries.${entryIndex}.shifts`, [...shifts, shift], {
        shouldDirty: true,
      });
      snapshot();
    },
    [form, snapshot],
  );

  const editShift = useCallback(
    (dayIndex: number, entryIndex: number, shiftIndex: number, shift: ShiftFormValue) => {
      form.setValue(`days.${dayIndex}.entries.${entryIndex}.shifts.${shiftIndex}`, shift, {
        shouldDirty: true,
      });
      snapshot();
    },
    [form, snapshot],
  );

  const deleteShift = useCallback(
    (dayIndex: number, entryIndex: number, shiftIndex: number) => {
      const shifts = form.getValues(`days.${dayIndex}.entries.${entryIndex}.shifts`);
      form.setValue(
        `days.${dayIndex}.entries.${entryIndex}.shifts`,
        shifts.filter((_, i) => i !== shiftIndex),
        { shouldDirty: true },
      );
      snapshot();
    },
    [form, snapshot],
  );

  const updateNotes = useCallback(
    (dayIndex: number, entryIndex: number, notes: string) => {
      form.setValue(`days.${dayIndex}.entries.${entryIndex}.note`, notes, {
        shouldDirty: true,
      });
    },
    [form],
  );

  // ------ DnD handler ------

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
        `days.${sourceData.dayIndex}.entries.${sourceData.entryIndex}.shifts`,
      );
      const shift = srcShifts[sourceData.shiftIndex];
      if (!shift) return;

      // Alt/Option key held during the drop = copy, otherwise move
      const isCopy =
        event.nativeEvent instanceof KeyboardEvent
          ? event.nativeEvent.altKey
          : ((event.nativeEvent as MouseEvent | undefined)?.altKey ?? false);

      // Add to target
      const targetShifts = form.getValues(`days.${targetDayIdx}.entries.${targetEntryIdx}.shifts`);
      form.setValue(
        `days.${targetDayIdx}.entries.${targetEntryIdx}.shifts`,
        [...targetShifts, { ...shift }],
        {
          shouldDirty: true,
        },
      );

      // Remove from source (unless copy)
      if (!isCopy) {
        form.setValue(
          `days.${sourceData.dayIndex}.entries.${sourceData.entryIndex}.shifts`,
          srcShifts.filter((_, i) => i !== sourceData.shiftIndex),
          { shouldDirty: true },
        );
      }

      snapshot();
    },
    [form, snapshot],
  );

  // ------ Save ------

  const handleSave = useCallback(() => {
    const values = form.getValues();
    startSaveTransition(async () => {
      const payload = values.days.map((day) => ({
        dateStr: day.dateStr,
        records: day.entries
          .filter((e) => e.shifts.length > 0 || (e.note && e.note.trim()))
          .map((e) => ({
            userId: e.userId,
            shifts: e.shifts.map((s) => ({
              startMinutes: s.startMinutes,
              endMinutes: s.endMinutes,
              note: s.note || undefined,
            })),
            note: e.note || undefined,
          })),
      }));

      const result = await saveWeekScheduleAction(payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Schedule saved.");
        clearHistory();
        snapshot();
      }
    });
  }, [form, clearHistory, snapshot]);

  const handleReset = useCallback(() => {
    form.reset(initialValues);
    snapshot();
  }, [form, initialValues, snapshot]);

  // Watch form values to re-render cells
  const watchedDays = form.watch("days");

  return (
    <TooltipProvider>
      <ClipboardProvider>
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  <TableHead className="min-w-[150px] font-semibold">Employee</TableHead>
                  {weekDates.map((dateStr) => (
                    <TableHead key={dateStr} className="min-w-[140px] text-center font-semibold">
                      {formatDayHeader(dateStr)}
                    </TableHead>
                  ))}
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
                    {weekDates.map((_, dayIdx) => {
                      const record = watchedDays?.[dayIdx]?.entries?.[empIdx] ?? {
                        userId: emp.id,
                        shifts: [],
                      };
                      const dropId = `drop-${dayIdx}-${empIdx}`;
                      return (
                        <TableCell key={dayIdx} className="p-1 text-center">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </DragDropProvider>
      </ClipboardProvider>

      {confirmDialog}
    </TooltipProvider>
  );
}
