"use client";

import { authClient } from "@/lib/auth-client"; // Ensure this path matches your client config
import { createContext, useContext, ReactNode } from "react";

type SessionContextType = ReturnType<typeof authClient.useSession>;

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};