"use client";

import { useNavigationGuard } from "@/hooks/use-navigation-guard";
import type { WeekScheduleInput, WorkShiftInput } from "@/libs/validations";
import { DragDropProvider } from "@dnd-kit/react";
import type { WorkDayRecordsByDate } from "@serva/database/dal";
import {
  Card,
  cn,
  ProfilePicture,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui";
import {
  formatInUTC,
  getTodayUTCMidnight,
  type DateRange,
  type DisplayEmployee,
} from "@serva/shared";
import { useCallback, useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ClipboardProvider } from "../_context/clipboard-context";
import { useUndoRedo } from "../_hooks/use-undo-redo";
import { buildInitialWeekScheduleInput, getEmployeeWeekHours } from "../_lib";
import { saveWeekScheduleAction } from "../actions";
import { EmployeeDayCell } from "./employee-day-cell";
import { ScheduleToolbar } from "./schedule-toolbar";
import { WeekNav } from "./week-nav";

type Props = {
  dateRangeUTC: DateRange;
  prevWeekParam: string;
  nextWeekParam: string;
  weekDates: string[];
  recordsByDate: WorkDayRecordsByDate;
  employees: DisplayEmployee[];
  canManage: boolean;
};

export function ScheduleWeekGrid(props: Props) {
  const {
    dateRangeUTC,
    prevWeekParam,
    nextWeekParam,
    weekDates,
    recordsByDate,
    employees,
    canManage,
  } = props;

  // Build initial week schedule input
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

  // Take initial snapshot
  useEffect(() => {
    snapshot();
  }, []);

  // Reset form when server data changes (e.g. after save + revalidation)
  useEffect(() => {
    form.reset(initialWeekScheduleInput);
  }, [initialWeekScheduleInput, form]);

  const isToday = useCallback((dateStr: string) => {
    return dateStr === formatInUTC(getTodayUTCMidnight());
  }, []);

  /** Get the shifts for a given day and record. */
  function getShifts(dayIdx: number, recordIdx: number): WorkShiftInput[] {
    return form.getValues(`days.${dayIdx}.records.${recordIdx}.shifts`);
  }

  /** Set the shifts for a given day and record. */
  function setShifts(dayIdx: number, recordIdx: number, shifts: WorkShiftInput[]) {
    form.setValue(`days.${dayIdx}.records.${recordIdx}.shifts`, shifts, { shouldDirty: true });
  }

  // ------ DnD handler (crosses cells, so uses raw form paths) ------
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
        | { dayIndex: number; recordIndex: number; shiftIndex: number }
        | undefined;
      if (!sourceData) return;

      // Parse target dropId: "drop-{dayIndex}-{recordIndex}" (matches EmployeeDayCell)
      const targetId = String(target.id);
      const match = targetId.match(/^drop-(\d+)-(\d+)$/);
      if (!match) return;
      const dayStr = match[1];
      const recordStr = match[2];
      if (dayStr === undefined || recordStr === undefined) return;
      const targetDayIdx = parseInt(dayStr, 10);
      const targetRecordIdx = parseInt(recordStr, 10);

      // Skip if dropping on same cell
      if (sourceData.dayIndex === targetDayIdx && sourceData.recordIndex === targetRecordIdx)
        return;

      const srcShifts = getShifts(sourceData.dayIndex, sourceData.recordIndex);
      const shift = srcShifts[sourceData.shiftIndex];
      if (!shift) return;

      // Alt/Option key held during the drop = copy, otherwise move
      const isCopy =
        event.nativeEvent instanceof KeyboardEvent
          ? event.nativeEvent.altKey
          : ((event.nativeEvent as MouseEvent | undefined)?.altKey ?? false);

      // Add to target
      const targetShifts = getShifts(targetDayIdx, targetRecordIdx);
      setShifts(targetDayIdx, targetRecordIdx, [...targetShifts, { ...shift }]);

      // Remove from source (unless copy)
      if (!isCopy) {
        setShifts(
          sourceData.dayIndex,
          sourceData.recordIndex,
          srcShifts.filter((_, i) => i !== sourceData.shiftIndex),
        );
      }

      // Take snapshot
      snapshot();
    },
    [form, snapshot],
  );

  /** Handle save button click. */
  const handleSave = useCallback(() => {
    const values = form.getValues();
    startSaveTransition(async () => {
      const result = await saveWeekScheduleAction(dateRangeUTC, values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Schedule saved.");
        clearHistory();
        snapshot();
      }
    });
  }, [form, clearHistory, snapshot, dateRangeUTC]);

  /** Handle reset button click. */
  const handleReset = useCallback(() => {
    form.reset(initialWeekScheduleInput);
    clearHistory();
  }, [form, initialWeekScheduleInput, clearHistory]);

  return (
    <>
      <ClipboardProvider>
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <WeekNav
              dateRangeUTC={dateRangeUTC}
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
                <TableRow className="">
                  <TableHead className="min-w-[150px] font-semibold">Team Member</TableHead>
                  {weekDates.map((dateStr) => (
                    <TableHead
                      key={dateStr}
                      className={cn(
                        "min-w-[140px] text-center font-semibold",
                        isToday(dateStr) && "bg-primary/20 text-primary font-bold",
                      )}
                    >
                      {formatInUTC(dateStr, "EEE M/d")}
                    </TableHead>
                  ))}
                  <TableHead className="text-primary min-w-[80px] text-center font-bold">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {employees.map((emp, empIdx) => (
                  <TableRow key={emp.id} className="divide-x">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ProfilePicture
                          image={emp.identity.image}
                          size={28}
                          name={emp.identity.name}
                        />
                        <span className="text-sm">{emp.identity.name}</span>
                      </div>
                    </TableCell>

                    {weekDates.map((dateStr, dayIdx) => {
                      const dropId = `drop-${dayIdx}-${empIdx}`;
                      return (
                        <TableCell
                          key={dayIdx}
                          className={cn("p-1 text-center", isToday(dateStr) && "bg-primary/20")}
                        >
                          <EmployeeDayCell
                            control={form.control}
                            dayIndex={dayIdx}
                            recordIndex={empIdx}
                            canManage={canManage}
                            dropId={dropId}
                            onSnapshot={snapshot}
                          />
                        </TableCell>
                      );
                    })}

                    <TableCell className="text-primary text-center font-bold tabular-nums">
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
