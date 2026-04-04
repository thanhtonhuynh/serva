"use client";

import type { WorkShiftInput } from "@/libs/validations";
import { createContext, useCallback, useContext, useState } from "react";

type ClipboardContextProps = {
  copiedShift: WorkShiftInput | null;
  copyShift: (shift: WorkShiftInput) => void;
  clearClipboard: () => void;
};

const ClipboardContext = createContext<ClipboardContextProps | null>(null);

export function useClipboard() {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error("useClipboard must be used within a ClipboardProvider");
  }
  return context;
}

export function ClipboardProvider({ children }: { children: React.ReactNode }) {
  const [copiedShift, setCopiedShift] = useState<WorkShiftInput | null>(null);

  const copyShift = useCallback((shift: WorkShiftInput) => setCopiedShift(shift), []);

  const clearClipboard = useCallback(() => setCopiedShift(null), []);

  return (
    <ClipboardContext value={{ copiedShift, copyShift, clearClipboard }}>
      {children}
    </ClipboardContext>
  );
}
