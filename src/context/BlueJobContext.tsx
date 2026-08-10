import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type BlueJobRole = "WORKER" | "CONTRACTOR" | null;
export type BlueJobUser = {
  id: string; name: string; email: string; role: BlueJobRole; onboardingComplete: boolean;
};
type BlueJobContextValue = {
  user: BlueJobUser | null;
  signIn: (user: BlueJobUser) => void;
  signOut: () => void;
  setRole: (role: BlueJobRole) => void;
  completeOnboarding: () => void;
};
const BlueJobContext = createContext<BlueJobContextValue | null>(null);
const STORAGE_KEY = "bluejob-session";

export function BlueJobProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BlueJobUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try { return JSON.parse(stored) as BlueJobUser; } catch { return null; }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [user]);
  return <BlueJobContext.Provider value={{
    user, signIn: setUser, signOut: () => setUser(null),
    setRole: (role) => setUser((current) => current ? { ...current, role } : current),
    completeOnboarding: () => setUser((current) => current ? { ...current, onboardingComplete: true } : current),
  }}>{children}</BlueJobContext.Provider>;
}
export function useBlueJob() {
  const context = useContext(BlueJobContext);
  if (!context) throw new Error("useBlueJob must be used inside BlueJobProvider");
  return context;
}
