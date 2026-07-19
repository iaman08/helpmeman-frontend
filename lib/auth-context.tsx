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

/** Compute the destination route after a successful login */
function getLoginDest(u: User, m: MentorMeta | null): string {
  if (u.role === "SUPER_ADMIN" || u.role === "ADMIN") return "/admin";
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
      document.cookie = `helpmeman.accessToken=${data.accessToken};path=/;max-age=31536000;SameSite=Lax;Secure`;
    } catch {}
    // [DEBUG] setUser() is scheduled here — React will commit it asynchronously.
    // If window.location.replace() fires before the next render cycle, this
    // state update will be discarded (the component unmounts mid-batch).
    console.log(`[AUTH:persist] setUser() SCHEDULED for ${data.user.email} (role: ${data.user.role}). React has NOT committed this yet.`);
    setUser(data.user);
    setMentor(data.mentor ?? null);
    const dest = getLoginDest(data.user, data.mentor ?? null);
    console.log(`[AUTH:persist] Computed dest: ${dest}. Returning to caller.`);
    return dest;
  }, []);

  // [DEBUG] This effect fires ONLY when React has committed user state to the DOM.
  // If navigation (window.location.replace) happens before this log prints,
  // it proves the state update was discarded. After the fix (router.push),
  // this log should appear BEFORE the destination page mounts.
  useEffect(() => {
    if (user) {
      console.log(`[AUTH:committed] user state committed to React: ${user.email} (role: ${user.role})`);
    } else {
      console.log(`[AUTH:committed] user state committed to React: null`);
    }
  }, [user]);

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

      console.log(`[AUTH] Syncing Google session. Token: ${accessToken.substring(0, 15)}...`);

      try {
        setLoading(true);
        setGoogleAuthenticating(true);
        googleAuthRef.current = true;

        const t0 = Date.now();
        const { data } = await api.post<AuthResponse>("/auth/google", {
          accessToken,
        }, {
          headers: { "x-show-loader": "true" }
        });
        console.log(`[AUTH] Backend sync done in ${Date.now() - t0}ms. User: ${data.user.email}`);

        // Persist tokens, user, mentor and compute redirect destination
        const dest = persist({
          ...data,
          refreshToken: refreshToken || data.refreshToken,
        });

        console.log(`[AUTH] Redirecting to: ${dest}`);
        window.location.replace(dest);
      } catch (err: any) {
        console.error("[AUTH] Backend sync failed:", err);
        if (err.response) {
          console.error("[AUTH] Response:", err.response.status, JSON.stringify(err.response.data, null, 2));
        }
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
    [persist],
  );

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
        console.log("[AUTH] OAuth callback detected in URL");
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
              console.log("[AUTH] Fallback: Found valid session, syncing");
              await syncGoogleSession(session.access_token, session.refresh_token ?? undefined);
            } else if (!callbackHandled.current) {
              console.warn("[AUTH] Fallback: No session found");
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

        console.log(`[AUTH] onAuthStateChange: event=${event}, hasSession=${!!session}, isOAuthCallback=${isOAuthCallback}`);

        if (!session) return;

        // ─── Event Filtering ───
        // INITIAL_SESSION: Only accept during an active OAuth callback.
        //   Handles the race where Supabase processed URL tokens before
        //   this listener was registered (the SIGNED_IN event was missed).
        // SIGNED_IN: Always accept (subject to dedup for background events).
        // All other events (TOKEN_REFRESHED, SIGNED_OUT, etc.): Ignore.
        if (event === "INITIAL_SESSION") {
          if (!isOAuthCallback) return;
          console.log("[AUTH] Accepting INITIAL_SESSION during active OAuth callback");
        } else if (event !== "SIGNED_IN") {
          return;
        }

        // ─── Sync or Resolve Loader ───
        if (isOAuthCallback) {
          await syncGoogleSession(session.access_token, session.refresh_token ?? undefined);
        } else {
          // Non-OAuth background event (e.g. token refresh, local login, tab refocus)
          // Ensure loader states are cleared
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
      const DEMO_USERS: Record<string, { role: "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "STUDENT"; name: string }> = {
        "official.diljha@gmail.com": { role: "SUPER_ADMIN", name: "Super Admin" },
        "admin@helpmeman.com":  { role: "ADMIN",  name: "Demo Admin" },
        "mentor@helpmeman.com": { role: "MENTOR", name: "Demo Mentor" },
        "student@helpmeman.com": { role: "STUDENT",  name: "Demo Student" },
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
        const tokenRole = role === "STUDENT" ? "student" : role.toLowerCase();
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
