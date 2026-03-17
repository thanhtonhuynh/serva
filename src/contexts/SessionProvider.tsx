"use client";

import type { Identity } from "@/lib/auth/session";
import { Session } from "@prisma/client";
import { createContext, ReactNode, useContext, useMemo } from "react";

type SessionContextProps = {
  identity: Identity | null;
  session: Session | null;
};

const SessionContext = createContext<SessionContextProps | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
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
    () => ({
      session,
      identity,
    }),
    [session, identity],
  );

  return <SessionContext value={contextValue}>{children}</SessionContext>;
}
