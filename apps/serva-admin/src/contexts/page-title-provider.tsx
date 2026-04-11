"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PageTitleContextValue = {
  title: ReactNode;
  setTitle: (value: ReactNode) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function usePageTitleContext(): PageTitleContextValue {
  const ctx = useContext(PageTitleContext);
  if (!ctx) {
    throw new Error("usePageTitleContext must be used within PageTitleProvider");
  }
  return ctx;
}

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<ReactNode>(null);

  const value = useMemo<PageTitleContextValue>(() => ({ title, setTitle }), [title]);

  return <PageTitleContext value={value}>{children}</PageTitleContext>;
}
