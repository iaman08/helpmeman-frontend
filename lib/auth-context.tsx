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
import { mutate } from "swr";
import type { AuthResponse, User, OTPResponse } from "./types";
import { auth as firebaseAuth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import GoogleAuthLoader from "@/components/GoogleAuthLoader";

interface MentorMeta {
  id: string;
  approvalStatus: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  mentor: MentorMeta | null;
  loading: boolean;
  googleAuthenticating: boolean;
  login: (email: string, password: string) => Promise<string>;
  loginWithGoogle: () => Promise<string>;
  register: (name: string, email: string, password: string) => Promise<OTPResponse>;
  verifySignupOTP: (formData: { name: string; email: string; password: string; phone?: string; otp: string }) => Promise<string>;
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
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);

  /* ─── Hydrate from localStorage on mount, then background-refresh from backend ─── */
  useEffect(() => {
    async function hydrate() {
      try {
        const storedUser = localStorage.getItem(KEYS.user);
        const storedMentor = localStorage.getItem(KEYS.mentor);
        const token = localStorage.getItem(KEYS.access);

        if (!storedUser || !token) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        // Clean up legacy dicebear avatars
        if (parsedUser.avatar?.includes("dicebear")) {
          parsedUser.avatar = null;
          localStorage.setItem(KEYS.user, JSON.stringify(parsedUser));
        }
        setUser(parsedUser);
        if (storedMentor) setMentor(JSON.parse(storedMentor));
      } catch {
        /* corrupted storage — ignore */
      }
      // Unblock the UI immediately using cached data.
      // Components render right away; background fetch below updates stale fields.
      setLoading(false);

      // Background-refresh from the server (non-blocking).
      try {
        const storedUser = localStorage.getItem(KEYS.user);
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id?.startsWith("demo_")) return;
        const token = localStorage.getItem(KEYS.access);
        if (!token) return;
        const { data } = await api.get<{ user: User; mentor: MentorMeta | null }>("/users/me");
        setUser(data.user);
        localStorage.setItem(KEYS.user, JSON.stringify(data.user));
        if (data.mentor) {
          setMentor(data.mentor);
          localStorage.setItem(KEYS.mentor, JSON.stringify(data.mentor));
        } else {
          setMentor(null);
          localStorage.removeItem(KEYS.mentor);
        }
      } catch {
        /* backend unreachable — cached data already in state */
      }
    }
    hydrate();
  }, []);

  /* ─── Persist helper — stores tokens/user and returns the correct destination path ─── */
  const persist = useCallback(
    (data: AuthResponse): string => {
      localStorage.setItem(KEYS.access, data.accessToken);
      localStorage.setItem(KEYS.refresh, data.refreshToken);
      localStorage.setItem(KEYS.user, JSON.stringify(data.user));
      if (data.mentor) {
        localStorage.setItem(KEYS.mentor, JSON.stringify(data.mentor));
      } else {
        localStorage.removeItem(KEYS.mentor);
      }
      try {
        document.cookie = `helpmeman.accessToken=${data.accessToken};path=/;max-age=31536000;SameSite=Lax`;
      } catch {}
      setUser(data.user);
      setMentor(data.mentor ?? null);
      // Compute and return the right destination so pages can navigate imperatively.
      return getLoginDest(data.user, data.mentor ?? null);
    },
    [],
  );

  /* ─── Compute destination after a successful auth event ─── */
  function getLoginDest(u: User, m: MentorMeta | null): string {
    if (u.role === "ADMIN") return "/admin";
    if (u.role === "MENTOR" && m) {
      return m.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
    }
    if (u.onboardingRole === "MENTEE") return "/dashboard";
    return "/onboarding";
  }

  /* ─── Login — returns destination path for imperative navigation ─── */
  const login = useCallback(
    async (email: string, password: string): Promise<string> => {
      // ─── Demo mock login (works offline) ───
      const DEMO_USERS: Record<string, { role: "ADMIN" | "MENTOR" | "USER"; name: string }> = {
        "admin@helpmeman.com":  { role: "ADMIN",  name: "Demo Admin" },
        "mentor@helpmeman.com": { role: "MENTOR", name: "Demo Mentor" },
        "user@helpmeman.com":   { role: "USER",   name: "Demo User" },
      };

      if (password === "mock123" && DEMO_USERS[email]) {
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
        return persist(mockData);
      }

      // ─── Real backend login (backend syncs to Firestore) ───
      const { data } = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      return persist(data);
    },
    [persist],
  );

  /* ─── Google Login — returns destination path ─── */
  const loginWithGoogle = useCallback(async (): Promise<string> => {
    if (!firebaseAuth) {
      throw new Error("Google login is currently disabled because Firebase configuration is missing.");
    }
    setGoogleAuthenticating(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      // Backend verifies token, creates/finds user, and syncs to Firestore
      const { data } = await api.post<AuthResponse>("/auth/google", { idToken });
      return persist(data);
    } finally {
      setGoogleAuthenticating(false);
    }
  }, [persist]);

  /* ─── Register ─── */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      // Backend does not create user immediately, it sends an OTP and returns OTPResponse
      const { data } = await api.post<OTPResponse>("/auth/register", {
        name,
        email,
        password,
      });
      return data;
    },
    [],
  );

  /* ─── Verify Signup OTP — returns destination path ─── */
  const verifySignupOTP = useCallback(
    async (formData: { name: string; email: string; password: string; phone?: string; otp: string }): Promise<string> => {
      const { data } = await api.post<AuthResponse>("/auth/verify-signup-otp", formData);
      return persist(data);
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
    try {
      mutate(() => true, undefined, { revalidate: false });
    } catch {}
    localStorage.clear();
    sessionStorage.clear();
    try {
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    } catch {}
    setUser(null);
    setMentor(null);
    window.location.replace("/signin");
  }, []);

  /* ─── Refresh user profile (from backend, which reads from Firestore) ─── */
  const refreshUser = useCallback(async () => {
    // Skip API call for mock demo users
    if (user?.id.startsWith("demo_")) return;

    try {
      const { data } = await api.get<{ user: User; mentor: MentorMeta | null }>("/users/me");
      setUser(data.user);
      localStorage.setItem(KEYS.user, JSON.stringify(data.user));
      if (data.mentor) {
        setMentor(data.mentor);
        localStorage.setItem(KEYS.mentor, JSON.stringify(data.mentor));
      } else {
        setMentor(null);
        localStorage.removeItem(KEYS.mentor);
      }
    } catch {
      /* silent */
    }
  }, [user]);

  /* ─── Update user locally (for instant UI feedback) ─── */
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
      googleAuthenticating,
      login,
      loginWithGoogle,
      register,
      verifySignupOTP,
      logout,
      refreshUser,
      updateUser,
      isUser: user?.role === "USER",
      isMentor: user?.role === "MENTOR",
      isAdmin: user?.role === "ADMIN",
    }),
    [user, mentor, loading, googleAuthenticating, login, loginWithGoogle, register, verifySignupOTP, logout, refreshUser, updateUser],
  );

  return (
    <AuthCtx.Provider value={value}>
      {children}
      {googleAuthenticating && <GoogleAuthLoader />}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
