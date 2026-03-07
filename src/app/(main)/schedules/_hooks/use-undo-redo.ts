"use client";

import { useCallback, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { WeekFormValues } from "../_lib/types";

const MAX_HISTORY = 50;

/**
 * Undo/redo for a react-hook-form instance.
 * Call `snapshot()` after each meaningful user action (add/edit/delete/drag/paste).
 * Call `undo()` / `redo()` to restore previous/next state.
 */
export function useUndoRedo(form: UseFormReturn<WeekFormValues>) {
  const historyRef = useRef<string[]>([]);
  const pointerRef = useRef(-1);
  const [, forceRender] = useState(0);

  const snapshot = useCallback(() => {
    const json = JSON.stringify(form.getValues());
    const hist = historyRef.current;
    const ptr = pointerRef.current;

    // Deduplicate: skip if identical to current snapshot
    if (ptr >= 0 && hist[ptr] === json) return;

    // Truncate any redo entries ahead of current pointer
    historyRef.current = hist.slice(0, ptr + 1);
    historyRef.current.push(json);

    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY);
    }

    pointerRef.current = historyRef.current.length - 1;
    forceRender((n) => n + 1);
  }, [form]);

  const undo = useCallback(() => {
    if (pointerRef.current <= 0) return;
    pointerRef.current -= 1;
    const values = JSON.parse(historyRef.current[pointerRef.current]) as WeekFormValues;
    form.reset(values, { keepDirtyValues: false });
    forceRender((n) => n + 1);
  }, [form]);

  const redo = useCallback(() => {
    if (pointerRef.current >= historyRef.current.length - 1) return;
    pointerRef.current += 1;
    const values = JSON.parse(historyRef.current[pointerRef.current]) as WeekFormValues;
    form.reset(values, { keepDirtyValues: false });
    forceRender((n) => n + 1);
  }, [form]);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    pointerRef.current = -1;
    forceRender((n) => n + 1);
  }, []);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < historyRef.current.length - 1;

  return { snapshot, undo, redo, clearHistory, canUndo, canRedo };
}
