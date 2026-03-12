"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ShiftFormValue } from "../_lib";

type ClipboardContextValue = {
  copiedShift: ShiftFormValue | null;
  copyShift: (shift: ShiftFormValue) => void;
  clearClipboard: () => void;
};

const ClipboardContext = createContext<ClipboardContextValue>({
  copiedShift: null,
  copyShift: () => {},
  clearClipboard: () => {},
});

export function ClipboardProvider({ children }: { children: React.ReactNode }) {
  const [copiedShift, setCopiedShift] = useState<ShiftFormValue | null>(null);

  const copyShift = useCallback((shift: ShiftFormValue) => {
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
