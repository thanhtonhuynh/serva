"use client";

import type { CompanyContext, Identity } from "@/lib/auth/session";
import { Session } from "@serva/database";
import { createContext, ReactNode, useContext, useMemo } from "react";

type SessionContextProps = {
  session: Session | null;
  identity: Identity | null;
  companyCtx: CompanyContext | null;
};

const SessionCtx = createContext<SessionContextProps | null>(null);

export function useSession() {
  const context = useContext(SessionCtx);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export function SessionProvider({
  children,
  session,
  identity,
  companyCtx,
}: {
  children: ReactNode;
  session: Session | null;
  identity: Identity | null;
  companyCtx: CompanyContext | null;
}) {
  const contextValue = useMemo<SessionContextProps>(
    () => ({ session, identity, companyCtx }),
    [session, identity, companyCtx],
  );

  return <SessionCtx value={contextValue}>{children}</SessionCtx>;
}
