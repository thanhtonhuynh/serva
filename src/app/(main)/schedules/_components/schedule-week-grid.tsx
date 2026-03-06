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
  type SlotFormValue,
  type WeekFormValues,
} from "../_lib/types";
import { saveWeekScheduleAction } from "../actions";
import { ScheduleDayCell } from "./schedule-day-cell";
import { ScheduleToolbar } from "./schedule-toolbar";
import { WeekNav } from "./week-nav";

// ---------------------------------------------------------------------------
// Server data shape (dates already serialized to ISO strings)
// ---------------------------------------------------------------------------
type ServerScheduleDay = {
  id: string;
  date: string;
  entries: {
    userId: string;
    slots: { startMinutes: number; endMinutes: number; note?: string | null }[];
    note?: string | null;
  }[];
};

type ScheduleWeekGridProps = {
  weekStartUTC: Date;
  weekEndUTC: Date;
  prevWeekParam: string; // YYYY-MM-DD
  nextWeekParam: string; // YYYY-MM-DD
  days: ServerScheduleDay[];
  employees: DisplayUser[];
  canManage: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the 7-day array with YYYY-MM-DD keys for a week starting at weekStart (UTC). */
function buildWeekDates(weekStartUTC: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStartUTC, i);
    return toUTCDateKey(day);
  });
}

/** Convert server data into initial form values aligned to the 7-day week. */
function buildInitialValues(
  weekDates: string[],
  serverDays: ServerScheduleDay[],
  employees: DisplayUser[],
): WeekFormValues {
  const dayMap = new Map<string, ServerScheduleDay>();
  for (const d of serverDays) {
    dayMap.set(toUTCDateKey(d.date), d);
  }

  const days: DayFormValue[] = weekDates.map((dateStr) => {
    const serverDay = dayMap.get(dateStr);
    const entries: EntryFormValue[] = employees.map((emp) => {
      const serverEntry = serverDay?.entries.find((e) => e.userId === emp.id);
      return {
        userId: emp.id,
        slots: (serverEntry?.slots ?? []).map((s) => ({
          startMinutes: s.startMinutes,
          endMinutes: s.endMinutes,
          note: s.note ?? undefined,
        })),
        note: serverEntry?.note ?? undefined,
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
  days: serverDays,
  employees,
  canManage,
}: ScheduleWeekGridProps) {
  const weekDates = useMemo(() => buildWeekDates(weekStartUTC), [weekStartUTC]);
  const initialValues = useMemo(
    () => buildInitialValues(weekDates, serverDays, employees),
    [weekDates, serverDays, employees],
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

  const addSlot = useCallback(
    (dayIndex: number, entryIndex: number, slot: SlotFormValue) => {
      const slots = form.getValues(`days.${dayIndex}.entries.${entryIndex}.slots`);
      form.setValue(`days.${dayIndex}.entries.${entryIndex}.slots`, [...slots, slot], {
        shouldDirty: true,
      });
      snapshot();
    },
    [form, snapshot],
  );

  const editSlot = useCallback(
    (dayIndex: number, entryIndex: number, slotIndex: number, slot: SlotFormValue) => {
      form.setValue(`days.${dayIndex}.entries.${entryIndex}.slots.${slotIndex}`, slot, {
        shouldDirty: true,
      });
      snapshot();
    },
    [form, snapshot],
  );

  const deleteSlot = useCallback(
    (dayIndex: number, entryIndex: number, slotIndex: number) => {
      const slots = form.getValues(`days.${dayIndex}.entries.${entryIndex}.slots`);
      form.setValue(
        `days.${dayIndex}.entries.${entryIndex}.slots`,
        slots.filter((_, i) => i !== slotIndex),
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
            slotIndex: number;
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

      const srcSlots = form.getValues(
        `days.${sourceData.dayIndex}.entries.${sourceData.entryIndex}.slots`,
      );
      const slot = srcSlots[sourceData.slotIndex];
      if (!slot) return;

      // Alt/Option key held during the drop = copy, otherwise move
      const isCopy =
        event.nativeEvent instanceof KeyboardEvent
          ? event.nativeEvent.altKey
          : ((event.nativeEvent as MouseEvent | undefined)?.altKey ?? false);

      // Add to target
      const targetSlots = form.getValues(`days.${targetDayIdx}.entries.${targetEntryIdx}.slots`);
      form.setValue(
        `days.${targetDayIdx}.entries.${targetEntryIdx}.slots`,
        [...targetSlots, { ...slot }],
        {
          shouldDirty: true,
        },
      );

      // Remove from source (unless copy)
      if (!isCopy) {
        form.setValue(
          `days.${sourceData.dayIndex}.entries.${sourceData.entryIndex}.slots`,
          srcSlots.filter((_, i) => i !== sourceData.slotIndex),
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
      // Send all days; empty days (no entries with slots/notes) are sent so the server can remove them from the DB
      const payload = values.days.map((day) => ({
        dateStr: day.dateStr,
        entries: day.entries
          .filter((e) => e.slots.length > 0 || (e.note && e.note.trim()))
          .map((e) => ({
            userId: e.userId,
            slots: e.slots.map((s) => ({
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
                      const entry = watchedDays?.[dayIdx]?.entries?.[empIdx] ?? {
                        userId: emp.id,
                        slots: [],
                      };
                      const dropId = `drop-${dayIdx}-${empIdx}`;
                      return (
                        <TableCell key={dayIdx} className="p-1 text-center">
                          <ScheduleDayCell
                            dayIndex={dayIdx}
                            entryIndex={empIdx}
                            entry={entry}
                            canManage={canManage}
                            dropId={dropId}
                            onEditSlot={(si, s) => editSlot(dayIdx, empIdx, si, s)}
                            onDeleteSlot={(si) => deleteSlot(dayIdx, empIdx, si)}
                            onAddSlot={(s) => addSlot(dayIdx, empIdx, s)}
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
