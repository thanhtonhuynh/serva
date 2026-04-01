"use client";

import type { Identity } from "@serva/auth";
import type { Session } from "@serva/database";
import { createContext, type ReactNode, useContext, useMemo } from "react";

type SessionContextProps = {
  session: Session | null;
  identity: Identity | null;
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
}: {
  children: ReactNode;
  session: Session | null;
  identity: Identity | null;
}) {
  const contextValue = useMemo<SessionContextProps>(
    () => ({ session, identity }),
    [session, identity],
  );

  return <SessionCtx value={contextValue}>{children}</SessionCtx>;
}
