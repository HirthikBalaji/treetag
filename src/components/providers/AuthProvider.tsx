"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "SURVEYOR" | "VIEWER";
  organization?: string | null;
  avatar?: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  switchDemoUser: (role: "ADMIN" | "PROJECT_MANAGER" | "SURVEYOR" | "VIEWER") => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  switchDemoUser: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
});

export const DEMO_USERS: Record<string, { email: string; label: string; role: "ADMIN" | "PROJECT_MANAGER" | "SURVEYOR" | "VIEWER" }> = {
  ADMIN: { email: "admin@treetag.org", label: "Hirthik Sharma (Admin)", role: "ADMIN" },
  PROJECT_MANAGER: { email: "pm@treetag.org", label: "Dr. Sunita Rao (Project Manager)", role: "PROJECT_MANAGER" },
  SURVEYOR: { email: "arjun@treetag.org", label: "Arjun Patel (Surveyor)", role: "SURVEYOR" },
  VIEWER: { email: "viewer@treetag.org", label: "Ananya Iyer (Viewer)", role: "VIEWER" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch {
      return { success: false, error: "Network error during login" };
    }
  };

  const switchDemoUser = async (role: "ADMIN" | "PROJECT_MANAGER" | "SURVEYOR" | "VIEWER") => {
    const demo = DEMO_USERS[role];
    if (demo) {
      await login(demo.email, "password123");
      router.refresh();
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, switchDemoUser, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
