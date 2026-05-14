import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { store, type User } from "./mock-data";

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const SEED_USERS: Record<string, { password: string; user: User }> = {
  "admin@test.com": { password: "password", user: { email: "admin@test.com", name: "Arjun Mehra", role: "admin" } },
  "customer@test.com": { password: "password", user: { email: "customer@test.com", name: "Rahul Sharma", role: "customer" } },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(store.getUser());
  }, []);

  const login = (email: string, password: string) => {
    const entry = SEED_USERS[email.toLowerCase()];
    if (!entry || entry.password !== password) return { ok: false, error: "Invalid credentials" };
    store.setUser(entry.user);
    setUser(entry.user);
    return { ok: true };
  };

  const logout = () => {
    store.setUser(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
