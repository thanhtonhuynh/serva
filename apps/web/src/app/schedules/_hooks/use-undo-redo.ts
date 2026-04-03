"use client";

import type { WeekScheduleInput } from "@/libs/validations";
import { useCallback, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

const MAX_HISTORY = 50;

/**
 * Undo/redo for a react-hook-form instance.
 * Call `snapshot()` after each meaningful user action (add/edit/delete/drag/paste).
 * Call `undo()` / `redo()` to restore previous/next state.
 */
export function useUndoRedo(form: UseFormReturn<WeekScheduleInput>) {
  /** History of form values. */
  const historyRef = useRef<string[]>([]);
  /** Pointer to the current history entry. */
  const pointerRef = useRef(-1);
  /** Force re-render to update the UI. */
  const [, forceRender] = useState(0);

  /** Take a snapshot of the current form values. */
  const snapshot = useCallback(() => {
    const json = JSON.stringify(form.getValues());
    const hist = historyRef.current;
    const ptr = pointerRef.current;

    // Skip if identical to current snapshot
    if (ptr >= 0 && hist[ptr] === json) return;

    // Truncate redo entries ahead of current pointer
    historyRef.current = hist.slice(0, ptr + 1);
    historyRef.current.push(json);

    // Truncate if too long
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY);
    }

    // Update pointer
    pointerRef.current = historyRef.current.length - 1;
    // Force re-render
    forceRender((n) => n + 1);
  }, [form]);

  /** Undo the last action. */
  const undo = useCallback(() => {
    if (pointerRef.current <= 0) return;

    pointerRef.current -= 1;
    const values = JSON.parse(historyRef.current[pointerRef.current]) as WeekScheduleInput;
    form.reset(values, { keepDirtyValues: false });
    forceRender((n) => n + 1);
  }, [form]);

  /** Redo the last action. */
  const redo = useCallback(() => {
    if (pointerRef.current >= historyRef.current.length - 1) return;

    pointerRef.current += 1;
    const values = JSON.parse(historyRef.current[pointerRef.current]) as WeekScheduleInput;
    form.reset(values, { keepDirtyValues: false });
    forceRender((n) => n + 1);
  }, [form]);

  /** Clear the undo/redo history. */
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    pointerRef.current = -1;
    forceRender((n) => n + 1);
  }, []);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < historyRef.current.length - 1;

  return { snapshot, undo, redo, clearHistory, canUndo, canRedo };
}
