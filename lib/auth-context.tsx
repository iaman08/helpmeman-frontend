"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import api from "./api";
import type { AuthResponse, User } from "./types";

interface MentorMeta {
  id: string;
  approvalStatus: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  mentor: MentorMeta | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isUser: boolean;
  isMentor: boolean;
  isAdmin: boolean;
}

const AuthCtx = createContext<AuthState | null>(null);

const KEYS = {
  access: "helpmeman.accessToken",
  refresh: "helpmeman.refreshToken",
  user: "helpmeman.user",
  mentor: "helpmeman.mentor",
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mentor, setMentor] = useState<MentorMeta | null>(null);
  const [loading, setLoading] = useState(true);

  /* ─── Hydrate from localStorage on mount ─── */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(KEYS.user);
      const storedMentor = localStorage.getItem(KEYS.mentor);
      const token = localStorage.getItem(KEYS.access);
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        if (storedMentor) setMentor(JSON.parse(storedMentor));
      }
    } catch {
      /* corrupted storage — ignore */
    }
    setLoading(false);
  }, []);

  /* ─── Persist helper ─── */
  const persist = useCallback(
    (data: AuthResponse) => {
      localStorage.setItem(KEYS.access, data.accessToken);
      localStorage.setItem(KEYS.refresh, data.refreshToken);
      localStorage.setItem(KEYS.user, JSON.stringify(data.user));
      if (data.mentor) {
        localStorage.setItem(KEYS.mentor, JSON.stringify(data.mentor));
      } else {
        localStorage.removeItem(KEYS.mentor);
      }
      setUser(data.user);
      setMentor(data.mentor ?? null);
    },
    [],
  );

  /* ─── Login ─── */
  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      persist(data);
    },
    [persist],
  );

  /* ─── Register ─── */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });
      persist(data);
    },
    [persist],
  );

  /* ─── Logout ─── */
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(KEYS.refresh);
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      /* best effort */
    }
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setUser(null);
    setMentor(null);
  }, []);

  /* ─── Refresh user profile ─── */
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>("/users/me");
      setUser(data.user);
      localStorage.setItem(KEYS.user, JSON.stringify(data.user));
    } catch {
      /* silent */
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      mentor,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isUser: user?.role === "USER",
      isMentor: user?.role === "MENTOR",
      isAdmin: user?.role === "ADMIN",
    }),
    [user, mentor, loading, login, register, logout, refreshUser],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
