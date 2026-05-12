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
  updateUser: (updates: Partial<User>) => void;
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
        const parsedUser = JSON.parse(storedUser);
        // Clean up legacy dicebear avatars
        if (parsedUser.avatar?.includes("dicebear")) {
          parsedUser.avatar = null;
          localStorage.setItem(KEYS.user, JSON.stringify(parsedUser));
        }
        setUser(parsedUser);
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
      // ─── Demo Mock Logic ───
      // Allows testing the dashboard even if backend is not running
      if (password === "password123") {
        if (email === "admin@helpmeman.com") {
          const mockAdminData: AuthResponse = {
            accessToken: "mock_admin_token",
            refreshToken: "mock_admin_refresh",
            user: {
              id: "demo_admin",
              name: "Admin Demo",
              email: "admin@helpmeman.com",
              role: "ADMIN",
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
            },
          };
          persist(mockAdminData);
          return;
        }
        if (email === "mentor@helpmeman.com") {
          const mockMentorData: AuthResponse = {
            accessToken: "mock_mentor_token",
            refreshToken: "mock_mentor_refresh",
            user: {
              id: "demo_mentor",
              name: "Mentor Demo",
              email: "mentor@helpmeman.com",
              role: "MENTOR",
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
            },
            mentor: {
              id: "mentor_1",
              approvalStatus: "APPROVED",
            },
          };
          persist(mockMentorData);
          return;
        }
        if (email === "user@helpmeman.com") {
          const mockUserData: AuthResponse = {
            accessToken: "mock_user_token",
            refreshToken: "mock_user_refresh",
            user: {
              id: "demo_user",
              name: "User Demo",
              email: "user@helpmeman.com",
              role: "USER",
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
            },
          };
          persist(mockUserData);
          return;
        }
      }

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
    // Skip API call for mock demo users
    if (user?.id.startsWith("demo_")) return;

    try {
      const { data } = await api.get<{ user: User }>("/users/me");
      setUser(data.user);
      localStorage.setItem(KEYS.user, JSON.stringify(data.user));
    } catch {
      /* silent */
    }
  }, [user]);

  /* ─── Update user locally (useful for demo/instant feedback) ─── */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem(KEYS.user, JSON.stringify(next));
      return next;
    });
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
      updateUser,
      isUser: user?.role === "USER",
      isMentor: user?.role === "MENTOR",
      isAdmin: user?.role === "ADMIN",
    }),
    [user, mentor, loading, login, register, logout, refreshUser, updateUser],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
