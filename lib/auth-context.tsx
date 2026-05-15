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
import { auth as firebaseAuth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

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
  loginWithGoogle: () => Promise<void>;
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
      // ─── Demo mock login (works offline) ───
      const DEMO_USERS: Record<string, { role: "ADMIN" | "MENTOR" | "USER"; name: string }> = {
        "admin@helpmeman.com":  { role: "ADMIN",  name: "Demo Admin" },
        "mentor@helpmeman.com": { role: "MENTOR", name: "Demo Mentor" },
        "user@helpmeman.com":   { role: "USER",   name: "Demo User" },
      };

      if (password === "password123" && DEMO_USERS[email]) {
        const { role, name } = DEMO_USERS[email];
        const mockUser: User = {
          id: `demo_${role.toLowerCase()}`,
          name,
          email,
          role,
          avatar: null,
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
        };
        const mockData: AuthResponse = {
          accessToken:  "demo_access_token",
          refreshToken: "demo_refresh_token",
          user: mockUser,
          mentor: role === "MENTOR" ? { id: "demo_mentor_id", approvalStatus: "APPROVED", isActive: true } : null,
        };
        persist(mockData);
        return;
      }

      // ─── Real backend login ───
      const { data } = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      persist(data);
    },
    [persist],
  );

  /* ─── Google Login ─── */
  const loginWithGoogle = useCallback(async () => {
    if (!firebaseAuth) {
      throw new Error("Google login is currently disabled because Firebase configuration is missing.");
    }
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    const idToken = await result.user.getIdToken();
    const { data } = await api.post<AuthResponse>("/auth/google", { idToken });
    persist(data);
  }, [persist]);

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
      loginWithGoogle,
      register,
      logout,
      refreshUser,
      updateUser,
      isUser: user?.role === "USER",
      isMentor: user?.role === "MENTOR",
      isAdmin: user?.role === "ADMIN",
    }),
    [user, mentor, loading, login, loginWithGoogle, register, logout, refreshUser, updateUser],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
