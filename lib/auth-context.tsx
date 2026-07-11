"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "./api";
import { mutate } from "swr";
import type { AuthResponse, User, OTPResponse } from "./types";
import supabase from "./supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

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
  loginWithGoogle: () => Promise<void>;
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

/** Compute the destination route after a successful login */
function getLoginDest(u: User, m: MentorMeta | null): string {
  if (u.role === "ADMIN") return "/admin";
  if (u.role === "MENTOR" && m) {
    return m.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
  }
  if (u.onboardingRole === "MENTEE") return "/dashboard";
  return "/onboarding";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mentor, setMentor] = useState<MentorMeta | null>(null);
  const [loading, setLoading] = useState(true);
  // true while Google OAuth is in progress (popup opened → backend sync done)
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);

  // Prevent duplicate concurrent /auth/google backend calls
  const syncInFlight = useRef(false);
  // Track the last token we synced so we skip identical repeat events
  const lastSyncedToken = useRef<string | null>(null);

  /* ─── Persist helper ─── */
  const persist = useCallback((data: AuthResponse): string => {
    localStorage.setItem(KEYS.access, data.accessToken);
    if (data.refreshToken) localStorage.setItem(KEYS.refresh, data.refreshToken);
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
    return getLoginDest(data.user, data.mentor ?? null);
  }, []);

  /* ─── Hydrate from localStorage on mount ─── */
  useEffect(() => {
    async function hydrate() {
      try {
        const storedUser = localStorage.getItem(KEYS.user);
        const storedMentor = localStorage.getItem(KEYS.mentor);
        const token = localStorage.getItem(KEYS.access);
        if (!storedUser || !token) { setLoading(false); return; }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (storedMentor) setMentor(JSON.parse(storedMentor));
      } catch { /* corrupted storage */ }
      setLoading(false);

      // Background-refresh profile (non-blocking, fire-and-forget)
      try {
        const storedUser = localStorage.getItem(KEYS.user);
        if (!storedUser) return;
        const token = localStorage.getItem(KEYS.access);
        if (token?.startsWith("demo_")) return;
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
      } catch { /* backend unreachable */ }
    }
    hydrate();
  }, []);

  /* ─── Supabase Auth State Listener (Google OAuth) ─── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Only sync with the backend on an actual user-initiated sign-in.
        // TOKEN_REFRESHED fires every time the tab regains focus — we must ignore it.
        // INITIAL_SESSION fires on every page load — we must ignore it.
        // USER_UPDATED may fire on profile changes — also skip unless it's a fresh login.
        if (event !== "SIGNED_IN") return;
        if (!session) return;

        // Key insight: deduplicate by Supabase user ID (sub), not by token.
        // Supabase issues a NEW access_token on every token refresh, so using the
        // token as a dedup key causes the guard to be bypassed on every tab return.
        const supabaseUserId = session.user?.id;

        // If we already have a helpmeman session for this exact Supabase user,
        // skip the backend sync. This covers: tab refocus, window focus, token refresh.
        const existingStoredUser = localStorage.getItem(KEYS.user);
        const existingToken = localStorage.getItem(KEYS.access);
        if (existingStoredUser && existingToken && supabaseUserId) {
          try {
            const parsedUser = JSON.parse(existingStoredUser);
            // If the stored user was synced from the same Supabase account, skip.
            // The user.id in our DB is different from supabaseUserId but we track
            // it via the email match or the lastSyncedToken sentinel below.
            if (parsedUser?.email === session.user?.email && !googleAuthenticating) {
              console.log("[AUTH] Skipping Google sync — session already established for this user.");
              return;
            }
          } catch { /* ignore parse errors */ }
        }

        // Deduplicate: skip if a sync is already in flight
        if (syncInFlight.current) return;
        // Deduplicate: skip if this exact token was already synced in this session
        const token = session.access_token;
        if (lastSyncedToken.current === token) return;

        syncInFlight.current = true;
        lastSyncedToken.current = token;

        try {
          const t0 = Date.now();
          const { data } = await api.post<AuthResponse>("/auth/google", {
            accessToken: token,
          }, {
            headers: { "x-show-loader": "true" }
          });
          console.log(`[AUTH] Google sync completed in ${Date.now() - t0}ms`);

          // Persist tokens & user
          localStorage.setItem(KEYS.access, data.accessToken);
          if (session.refresh_token) localStorage.setItem(KEYS.refresh, session.refresh_token);
          localStorage.setItem(KEYS.user, JSON.stringify(data.user));
          if (data.mentor) {
            localStorage.setItem(KEYS.mentor, JSON.stringify(data.mentor));
          } else {
            localStorage.removeItem(KEYS.mentor);
          }
          document.cookie = `helpmeman.accessToken=${data.accessToken};path=/;max-age=31536000;SameSite=Lax`;

          setUser(data.user);
          setMentor(data.mentor ?? null);

          // Redirect immediately — don't wait for anything else
          const dest = getLoginDest(data.user, data.mentor ?? null);
          window.location.replace(dest);
        } catch (err) {
          console.error("[AUTH] Failed to sync Google session:", err);
          lastSyncedToken.current = null; // allow retry
        } finally {
          syncInFlight.current = false;
          setGoogleAuthenticating(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Login (email / password) ─── */
  const login = useCallback(
    async (email: string, password: string): Promise<string> => {
      const DEMO_USERS: Record<string, { role: "ADMIN" | "MENTOR" | "USER"; name: string }> = {
        "admin@helpmeman.com":  { role: "ADMIN",  name: "Demo Admin" },
        "mentor@helpmeman.com": { role: "MENTOR", name: "Demo Mentor" },
        "student@helpmeman.com": { role: "USER",  name: "Demo Student" },
      };
      const isDemoPassword = password === "mock123" || password === "password123";
      if (isDemoPassword && DEMO_USERS[email.toLowerCase()]) {
        const { role, name } = DEMO_USERS[email.toLowerCase()];
        const mockUser: User = {
          id: `demo_${role.toLowerCase()}`,
          name,
          email: email.toLowerCase(),
          role,
          avatar: null,
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
        };
        const tokenRole = role === "USER" ? "student" : role.toLowerCase();
        const mockData: AuthResponse = {
          accessToken: `demo_${tokenRole}_token`,
          refreshToken: "demo_refresh_token",
          user: mockUser,
          mentor: role === "MENTOR" ? { id: "demo_mentor_id", approvalStatus: "APPROVED", isActive: true } : null,
        };
        return persist(mockData);
      }
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password }, {
        headers: { "x-show-loader": "true" }
      });
      return persist(data);
    },
    [persist],
  );

  /* ─── Google Login — popup opens instantly, modal can close immediately ─── */
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    // Signal that Google auth is in progress so the overlay shows
    setGoogleAuthenticating(true);
    lastSyncedToken.current = null; // allow the upcoming SIGNED_IN event through

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // After OAuth redirect, land on onboarding; the onAuthStateChange
          // listener will redirect to the correct dashboard automatically.
          redirectTo: `${window.location.origin}/onboarding`,
          queryParams: {
            // Prompt the account picker every time so the UX feels immediate
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
      // signInWithOAuth with a popup resolves immediately after the popup opens.
      // The actual auth result arrives via onAuthStateChange.
    } catch (err) {
      // If popup was blocked or closed, reset state
      setGoogleAuthenticating(false);
      throw err;
    }
  }, []);

  /* ─── Register ─── */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await api.post<OTPResponse>("/auth/register", { name, email, password }, {
        headers: { "x-show-loader": "true" }
      });
      return data;
    },
    [],
  );

  /* ─── Verify Signup OTP ─── */
  const verifySignupOTP = useCallback(
    async (formData: { name: string; email: string; password: string; phone?: string; otp: string }) => {
      const { data } = await api.post<AuthResponse>("/auth/verify-signup-otp", formData, {
        headers: { "x-show-loader": "true" }
      });
      return persist(data);
    },
    [persist],
  );

  /* ─── Logout ─── */
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(KEYS.refresh);
    try { 
      await api.post("/auth/logout", { refreshToken }, {
        headers: { "x-show-loader": "true" }
      }); 
    } catch {}
    try { await supabase.auth.signOut(); } catch {}
    try { mutate(() => true, undefined, { revalidate: false }); } catch {}
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
    window.location.replace("/");
  }, []);

  /* ─── Refresh user profile ─── */
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(KEYS.access);
    if (token?.startsWith("demo_")) return;
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
    } catch { /* silent */ }
  }, [user]);

  /* ─── Update user locally (optimistic) ─── */
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

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
