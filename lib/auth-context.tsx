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
  isStudent: boolean;
  isMentor: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthCtx = createContext<AuthState | null>(null);

const KEYS = {
  access: "helpmeman.accessToken",
  refresh: "helpmeman.refreshToken",
  user: "helpmeman.user",
  mentor: "helpmeman.mentor",
} as const;

/** Maximum time to wait for auth to resolve before forcing loading=false */
const AUTH_LOADING_TIMEOUT_MS = 10_000;

/** Compute the destination route after a successful login */
function getLoginDest(u: User, m: MentorMeta | null): string {
  if (u.role === "SUPER_ADMIN") return "/superadmin";
  if (u.role === "ADMIN") return "/admin";
  if (u.role === "MENTOR" && m) {
    return m.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
  }
  if (u.onboardingRole === "MENTEE" || u.role === "STUDENT") return "/dashboard";
  return "/onboarding";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mentor, setMentor] = useState<MentorMeta | null>(null);
  const [loading, setLoading] = useState(true);
  // true while Google OAuth is in progress (popup opened → backend sync done)
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);

  // Ref to track intentional Google OAuth flow (accessible without stale closures)
  const googleAuthRef = useRef(false);
  // Prevent duplicate concurrent /auth/google backend calls
  const syncInFlight = useRef(false);
  // Track the last token we synced so we skip identical repeat events
  const lastSyncedToken = useRef<string | null>(null);
  // Track whether the OAuth callback has been handled (prevents double processing)
  const callbackHandled = useRef(false);

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
      const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
      const secureFlag = isHttps ? ";Secure" : "";
      document.cookie = `helpmeman.accessToken=${data.accessToken};path=/;max-age=31536000;SameSite=Lax${secureFlag}`;
      // Role cookie — read by the middleware to redirect instantly without JS
      document.cookie = `helpmeman.role=${data.user.role};path=/;max-age=31536000;SameSite=Lax${secureFlag}`;
    } catch {}
    setUser(data.user);
    setMentor(data.mentor ?? null);
    const dest = getLoginDest(data.user, data.mentor ?? null);
    return dest;
  }, []);

  /** Sync a Supabase/Google session with the HelpMeMan backend */
  const syncGoogleSession = useCallback(
    async (accessToken: string, refreshToken?: string) => {
      // Guards: prevent duplicate/concurrent calls
      if (callbackHandled.current) return;
      if (syncInFlight.current) return;
      if (lastSyncedToken.current === accessToken) return;

      callbackHandled.current = true;
      syncInFlight.current = true;
      lastSyncedToken.current = accessToken;

      try {
        setLoading(true);
        setGoogleAuthenticating(true);
        googleAuthRef.current = true;

        const { data } = await api.post<AuthResponse>("/auth/google", {
          accessToken,
        }, {
          headers: { "x-show-loader": "true" }
        });

        // Persist tokens, user, mentor and compute redirect destination
        const dest = persist({
          ...data,
          refreshToken: refreshToken || data.refreshToken,
        });

        // Use router.push instead of window.location.replace to prevent
        // discarding the React state update. router.push is async-safe and
        // lets React commit the setUser() call before navigating.
        setLoading(false);
        setGoogleAuthenticating(false);
        router.push(dest);
      } catch (err: any) {
        console.error("[AUTH] Backend sync failed:", err);
        // Reset flags to allow retry
        callbackHandled.current = false;
        lastSyncedToken.current = null;
        setLoading(false);
        setGoogleAuthenticating(false);
        googleAuthRef.current = false;
      } finally {
        syncInFlight.current = false;
      }
    },
    [persist, router],
  );

  /* ─── Loading timeout safety net ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("[AUTH] Loading timeout reached, forcing loading=false");
          return false;
        }
        return prev;
      });
      setGoogleAuthenticating(false);
    }, AUTH_LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  /* ─── Hydrate from localStorage on mount ─── */
  useEffect(() => {
    async function hydrate() {
      const isCallback = typeof window !== "undefined" && (
        window.location.hash.includes("access_token=") ||
        window.location.search.includes("code=")
      );

      try {
        const storedUser = localStorage.getItem(KEYS.user);
        const storedMentor = localStorage.getItem(KEYS.mentor);
        const token = localStorage.getItem(KEYS.access);
        if (!isCallback && storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          if (storedMentor) setMentor(JSON.parse(storedMentor));
        }
      } catch { /* corrupted storage */ }

      if (!isCallback) {
        setLoading(false);
      } else {
        setGoogleAuthenticating(true);
        googleAuthRef.current = true;

        // Fallback: if onAuthStateChange doesn't handle the callback within 5s,
        // try getting the session directly from Supabase as a safety net.
        setTimeout(async () => {
          if (callbackHandled.current) return; // Already handled

          console.warn("[AUTH] Fallback: onAuthStateChange didn't fire, checking session directly");
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token && !callbackHandled.current) {
              await syncGoogleSession(session.access_token, session.refresh_token ?? undefined);
            } else if (!callbackHandled.current) {
              setGoogleAuthenticating(false);
              googleAuthRef.current = false;
              setLoading(false);
            }
          } catch (err) {
            console.error("[AUTH] Fallback recovery failed:", err);
            if (!callbackHandled.current) {
              setGoogleAuthenticating(false);
              googleAuthRef.current = false;
              setLoading(false);
            }
          }
        }, 5000);
      }

      // Background-refresh profile (non-blocking, fire-and-forget)
      try {
        const storedUser = localStorage.getItem(KEYS.user);
        if (!storedUser) return;
        const token = localStorage.getItem(KEYS.access);
        if (token?.startsWith("demo_")) return;
        if (!token) return;
        if (isCallback) return; // Skip background fetch if callback is running

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Supabase Auth State Listener (Google OAuth) ─── */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const isOAuthCallback = googleAuthRef.current || (
          typeof window !== "undefined" && (
            window.location.hash.includes("access_token=") ||
            window.location.search.includes("code=")
          )
        );

        if (!session) return;

        // INITIAL_SESSION: Only accept during an active OAuth callback.
        // SIGNED_IN: Always accept (subject to dedup for background events).
        // All other events: Ignore.
        if (event === "INITIAL_SESSION") {
          if (!isOAuthCallback) return;
        } else if (event !== "SIGNED_IN") {
          return;
        }

        if (isOAuthCallback) {
          await syncGoogleSession(session.access_token, session.refresh_token ?? undefined);
        } else {
          // Non-OAuth background event
          setLoading(false);
          setGoogleAuthenticating(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncGoogleSession]);


  /* ─── Login (email / password) ─── */
  const login = useCallback(
    async (email: string, password: string): Promise<string> => {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password }, {
        headers: { "x-show-loader": "true" }
      });
      return persist(data);
    },
    [persist],
  );



  /* ─── Google Login — triggers full-page redirect to Google OAuth ─── */
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    // Signal that Google auth is in progress so the overlay shows
    setGoogleAuthenticating(true);
    googleAuthRef.current = true;
    lastSyncedToken.current = null;
    callbackHandled.current = false;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/signin`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
      // signInWithOAuth triggers a full-page redirect to Google.
      // After the user authenticates, Google redirects back to /signin.
      // The onAuthStateChange listener (or the fallback timer) handles the rest.
    } catch (err) {
      setGoogleAuthenticating(false);
      googleAuthRef.current = false;
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
  }, []);

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
      isUser: user?.role === "STUDENT",
      isStudent: user?.role === "STUDENT",
      isMentor: user?.role === "MENTOR",
      isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
      isSuperAdmin: user?.role === "SUPER_ADMIN",
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
