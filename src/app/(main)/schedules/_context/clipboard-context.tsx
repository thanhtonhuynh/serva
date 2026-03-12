"use client";

import type { WorkShiftInput } from "@/data-access/work-day-record";
import { createContext, useCallback, useContext, useState } from "react";

type ClipboardContextValue = {
  copiedShift: WorkShiftInput | null;
  copyShift: (shift: WorkShiftInput) => void;
  clearClipboard: () => void;
};

const ClipboardContext = createContext<ClipboardContextValue>({
  copiedShift: null,
  copyShift: () => {},
  clearClipboard: () => {},
});

export function ClipboardProvider({ children }: { children: React.ReactNode }) {
  const [copiedShift, setCopiedShift] = useState<WorkShiftInput | null>(null);

  const copyShift = useCallback((shift: WorkShiftInput) => {
    setCopiedShift({ ...shift });
  }, []);

  const clearClipboard = useCallback(() => {
    setCopiedShift(null);
  }, []);

  return (
    <ClipboardContext.Provider value={{ copiedShift, copyShift, clearClipboard }}>
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard() {
  return useContext(ClipboardContext);
}
