import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { store, type User } from "./mock-data";

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (email: string, password: string, name: string, phone?: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const USERS_KEY = "turfly:users";

interface StoredUser { password: string; user: User }

function readUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return getDefaultUsers();
  try {
    const v = localStorage.getItem(USERS_KEY);
    if (v) {
      const stored = JSON.parse(v) as Record<string, StoredUser>;
      // Ensure the primary admin account always exists with correct credentials
      const defaults = getDefaultUsers();
      let dirty = false;
      for (const [email, entry] of Object.entries(defaults)) {
        if (!stored[email] || stored[email].password !== entry.password) {
          stored[email] = entry;
          dirty = true;
        }
      }
      if (dirty) localStorage.setItem(USERS_KEY, JSON.stringify(stored));
      return stored;
    }
  } catch { /* */ }
  const defaults = getDefaultUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function getDefaultUsers(): Record<string, StoredUser> {
  return {
    "turfadmin@gmail.com": { password: "TurfAdmin@123", user: { email: "turfadmin@gmail.com", name: "Turf Admin", role: "admin", phone: "+91 98765 43210", joinedAt: "2024-01-01", loyaltyPoints: 500 } },
    "admin@test.com": { password: "password", user: { email: "admin@test.com", name: "Arjun Mehra", role: "admin", phone: "+91 98765 43210", joinedAt: "2024-01-01", loyaltyPoints: 500 } },
    "customer@test.com": { password: "password", user: { email: "customer@test.com", name: "Rahul Sharma", role: "customer", phone: "+91 98765 12345", joinedAt: "2024-03-15", loyaltyPoints: 240, totalBookings: 12 } },
  };
}

function writeUsers(users: Record<string, StoredUser>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(store.getUser());
  }, []);

  const login = (email: string, password: string) => {
    const users = readUsers();
    const entry = users[email.toLowerCase()];
    if (!entry || entry.password !== password) return { ok: false, error: "Invalid email or password" };
    store.setUser(entry.user);
    setUser(entry.user);
    return { ok: true };
  };

  const register = (email: string, password: string, name: string, phone?: string) => {
    const users = readUsers();
    if (users[email.toLowerCase()]) return { ok: false, error: "Email already registered" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    const newUser: User = {
      email: email.toLowerCase(),
      name,
      role: "customer",
      phone,
      joinedAt: new Date().toISOString().slice(0, 10),
      loyaltyPoints: 50,
      totalBookings: 0,
    };
    users[email.toLowerCase()] = { password, user: newUser };
    writeUsers(users);
    store.setUser(newUser);
    setUser(newUser);
    return { ok: true };
  };

  const logout = () => {
    store.setUser(null);
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    const users = readUsers();
    if (users[user.email]) {
      users[user.email].user = updated;
      writeUsers(users);
    }
    store.setUser(updated);
    setUser(updated);
  };

  return <Ctx.Provider value={{ user, login, register, logout, updateProfile }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function isAdminEmail(email: string) {
  return email === "turfadmin@gmail.com" || email === "admin@test.com";
}
