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
import api, { setAuthCookies, clearAuthCookies } from "./api";
import { mutate } from "swr";
import type { AuthResponse, User, OTPResponse } from "./types";
import supabase from "./supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface MentorMeta {
  id: string;
  approvalStatus: string;
  isActive?: boolean;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  mentor: MentorMeta | null;
  loading: boolean;
  googleAuthenticating: boolean;
  googleAuthError: string | null;
  login: (
    email: string,
    password: string,
    captcha?: { captchaId: string; captchaAnswer: string }
  ) => Promise<string | { requires2FA?: boolean; requires2FASetup?: boolean; tempToken: string }>;
  verify2FALogin: (tempToken: string, code: string) => Promise<string>;
  verifyPasskeyLogin: (tempToken: string, response: unknown) => Promise<string>;
  loginWithGoogle: (onboardingRole?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<OTPResponse>;
  verifySignupOTP: (formData: { name: string; email: string; password: string; phone?: string; otp: string; role?: string; onboardingRole?: string }) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setSessionFromToken: (token: string, refreshToken?: string) => Promise<User | null>;
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
export function getLoginDest(u: User, m: MentorMeta | null): string {
  if (u.role === "SUPER_ADMIN") return "/superadmin";
  if (u.role === "ADMIN") return "/admin";
  if (u.role === "MENTOR" || u.onboardingRole === "MENTOR") {
    if (!m?.onboardingCompleted) return "/onboarding?role=mentor";
    return m.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
  }
  if (u.onboardingRole === "MENTEE" || u.role === "STUDENT") return "/dashboard";
  return "/onboarding";
}

export function getAuthRedirect(destination: string, intent: string | null): string {
  if (!intent || !intent.startsWith("/") || intent.startsWith("//") || /[\\\s]/.test(intent) || /%(?:2f|5c|2e)/i.test(intent)) return destination;
  if (destination !== "/dashboard" && destination !== "/mentor") return destination;
  const url = new URL(intent, "https://helpmeman.local");
  if (destination === "/dashboard" && url.pathname === "/apply-mentor") return "/apply-mentor";
  return url.origin === "https://helpmeman.local" && (url.pathname === destination || url.pathname.startsWith(`${destination}/`))
    ? `${url.pathname}${url.search}${url.hash}` : destination;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mentor, setMentor] = useState<MentorMeta | null>(null);
  const [loading, setLoading] = useState(true);
  // true while Google OAuth is in progress (popup opened → backend sync done)
  const [googleAuthenticating, setGoogleAuthenticating] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);
  const googleRequest = useRef<AbortController | null>(null);

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
    setAuthCookies(data.accessToken, data.user.role);
    setUser(data.user);
    setMentor(data.mentor ?? null);
    if (typeof sessionStorage !== "undefined" && (data.user.role === "MENTOR" || data.user.onboardingRole === "MENTOR")) {
      sessionStorage.setItem("hmm.activeRole", "mentor");
    }
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

        const mentorIntent = localStorage.getItem("helpmeman.onboardingRoleIntent");
        const redirectIntent = localStorage.getItem("helpmeman.loginRedirectIntent");

        const controller = new AbortController();
        googleRequest.current = controller;
        const { data } = await api.post<AuthResponse>("/auth/google", {
          accessToken,
          onboardingRole: mentorIntent || undefined,
        }, {
          signal: controller.signal,
          timeout: 20_000,
        });
        if (!googleAuthRef.current || controller.signal.aborted) return;

        // Persist tokens, user, mentor and compute redirect destination
        const dest = persist({
          ...data,
          refreshToken: refreshToken || data.refreshToken,
        });

        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("helpmeman.oauthInProgress");
          sessionStorage.removeItem("helpmeman.oauthStartedAt");
        }

        localStorage.removeItem("helpmeman.onboardingRoleIntent");
        localStorage.removeItem("helpmeman.loginRedirectIntent");
        const targetUrl = getAuthRedirect(dest, redirectIntent);
        // Direct reliable replacement: cleanly replaces the OAuth callback in browser history
        // and guarantees cookies and headers are attached for server-side middleware and layouts
        window.location.replace(targetUrl);
      } catch {
        if (!googleAuthRef.current) return;
        setGoogleAuthError("Google sign-in could not be completed. Please try again or sign in with your email.");
        // Keep callback events blocked until an explicit new sign-in attempt.
        callbackHandled.current = true;
        lastSyncedToken.current = null;
        setLoading(false);
        setGoogleAuthenticating(false);
        googleAuthRef.current = false;
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("helpmeman.oauthInProgress");
          sessionStorage.removeItem("helpmeman.oauthStartedAt");
        }
      } finally {
        syncInFlight.current = false;
      }
    },
    [persist],
  );

  // Start a fresh deadline for every attempt, including attempts started long
  // after mount. Abort pending API work and ignore late SDK/session results.
  useEffect(() => {
    if (!googleAuthenticating) return;
    const timer = setTimeout(() => {
      googleAuthRef.current = false;
      callbackHandled.current = true;
      googleRequest.current?.abort();
      setLoading(false);
      setGoogleAuthenticating(false);
      setGoogleAuthError("Google sign-in took too long. Please try again or sign in with your email.");
      sessionStorage.removeItem("helpmeman.oauthInProgress");
      sessionStorage.removeItem("helpmeman.oauthStartedAt");
    }, 25_000);
    return () => clearTimeout(timer);
  }, [googleAuthenticating]);

  /* ─── Initial hydration timeout safety net ─── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("[AUTH] Loading timeout reached, forcing loading=false");
          return false;
        }
        return prev;
      });
    }, AUTH_LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  /* ─── Hydrate from localStorage on mount ─── */
  useEffect(() => {
    async function hydrate() {
      // Detect an OAuth callback from URL state or a recent intentional sign-in.
      const hasUrlTokens = typeof window !== "undefined" && (
        window.location.hash.includes("access_token=") ||
        window.location.search.includes("code=")
      );
      // Supabase may consume/clean the callback URL before React mounts.
      // A short-lived explicit intent survives that handoff without treating
      // old sessionStorage flags as a new login on every future page load.
      const startedAt = Number(sessionStorage.getItem("helpmeman.oauthStartedAt"));
      const recentIntent = sessionStorage.getItem("helpmeman.oauthInProgress") === "true"
        && startedAt > 0 && Date.now() - startedAt >= 0 && Date.now() - startedAt < 5 * 60_000;
      const isCallback = Boolean(
        googleAuthRef.current ||
        hasUrlTokens ||
        recentIntent
      );

      // Clean up expired intent without discarding a callback already parsed by the SDK.
      if (!hasUrlTokens && !recentIntent && typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("helpmeman.oauthInProgress");
        sessionStorage.removeItem("helpmeman.oauthStartedAt");
      }

      try {
        const storedUser = localStorage.getItem(KEYS.user);
        const storedMentor = localStorage.getItem(KEYS.mentor);
        const token = localStorage.getItem(KEYS.access);
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          if (storedMentor) setMentor(JSON.parse(storedMentor));
          setAuthCookies(token, parsedUser.role);
        }
      } catch { /* corrupted storage */ }

      if (!isCallback) {
        setLoading(false);
      } else {
        setGoogleAuthenticating(true);
        googleAuthRef.current = true;

        // The listener and this probe share the same deduplication guard.
        // The per-attempt deadline also covers an SDK session probe that hangs.
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!googleAuthRef.current || callbackHandled.current) return;
          if (session?.access_token) {
            void syncGoogleSession(session.access_token, session.refresh_token ?? undefined);
          }
        } catch {
          if (!googleAuthRef.current) return;
          setGoogleAuthError("Your Google session could not be loaded. Please sign in again.");
          setGoogleAuthenticating(false);
          googleAuthRef.current = false;
          setLoading(false);
          sessionStorage.removeItem("helpmeman.oauthInProgress");
          sessionStorage.removeItem("helpmeman.oauthStartedAt");
        }
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
      (event: AuthChangeEvent, session: Session | null) => {
        const isOAuthCallback = Boolean(
          googleAuthRef.current ||
          (typeof window !== "undefined" && (
            window.location.hash.includes("access_token=") ||
            window.location.search.includes("code=")
          ))
        );

        if (!session) return;

        // INITIAL_SESSION: Accept ONLY during active OAuth callback.
        if (event === "INITIAL_SESSION") {
          if (!isOAuthCallback) return;
        } else if (event !== "SIGNED_IN") {
          return;
        }

        // Only invoke sync if this is an explicit OAuth redirect callback
        if (isOAuthCallback && session.access_token) {
          setTimeout(() => {
            if (googleAuthRef.current) void syncGoogleSession(session.access_token, session.refresh_token ?? undefined);
          }, 0);
        } else {
          // Normal background or tab-switch event: NEVER re-sync or force-redirect
          setLoading(false);
          setGoogleAuthenticating(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [syncGoogleSession]);


  /* ─── Login (email / password) ─── */
  const login = useCallback(
    async (
      email: string,
      password: string,
      captcha?: { captchaId: string; captchaAnswer: string }
    ): Promise<string | { requires2FA?: boolean; requires2FASetup?: boolean; tempToken: string }> => {
      const { data } = await api.post<AuthResponse & { requires2FA?: boolean; requires2FASetup?: boolean; tempToken?: string }>(
        "/auth/login",
        {
          email,
          password,
          captchaId: captcha?.captchaId,
          captchaAnswer: captcha?.captchaAnswer,
        },
        {
          headers: { "x-show-loader": "true" },
        }
      );
      if (data.requires2FA && data.tempToken) {
        return { requires2FA: true, tempToken: data.tempToken };
      }
      if (data.requires2FASetup && data.accessToken) {
        persist(data);
        return { requires2FASetup: true, tempToken: data.accessToken };
      }
      return persist(data);
    },
    [persist],
  );

  /* ─── Verify 2FA Login ─── */
  const verify2FALogin = useCallback(
    async (tempToken: string, code: string): Promise<string> => {
      const { data } = await api.post<AuthResponse>("/auth/2fa/verify-login", { tempToken, code }, {
        headers: { "x-show-loader": "true" }
      });
      return persist(data);
    },
    [persist],
  );

  /* ─── Verify Passkey / Security Key Login ─── */
  const verifyPasskeyLogin = useCallback(
    async (tempToken: string, response: unknown): Promise<string> => {
      const { data } = await api.post<AuthResponse>("/auth/webauthn/login-verify", { tempToken, response }, {
        headers: { "x-show-loader": "true" }
      });
      return persist(data);
    },
    [persist],
  );



  /* ─── Google Login — triggers full-page redirect to Google OAuth ─── */
  const loginWithGoogle = useCallback(async (onboardingRole?: string): Promise<void> => {
    setGoogleAuthError(null);
    // Signal that Google auth is in progress so the overlay shows
    setGoogleAuthenticating(true);
    googleAuthRef.current = true;
    lastSyncedToken.current = null;
    callbackHandled.current = false;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("helpmeman.oauthInProgress", "true");
      sessionStorage.setItem("helpmeman.oauthStartedAt", String(Date.now()));
    }

    if (onboardingRole) {
      localStorage.setItem("helpmeman.onboardingRoleIntent", onboardingRole);
    } else {
      localStorage.removeItem("helpmeman.onboardingRoleIntent");
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        localStorage.setItem("helpmeman.loginRedirectIntent", redirect);
      }
    }

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
    } catch (err) {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("helpmeman.oauthInProgress");
        sessionStorage.removeItem("helpmeman.oauthStartedAt");
      }
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
    async (formData: { name: string; email: string; password: string; phone?: string; otp: string; role?: string; onboardingRole?: string }) => {
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
    clearAuthCookies();
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

  /* ─── Establish session directly from received access token ─── */
  const setSessionFromToken = useCallback(async (token: string, refreshToken?: string): Promise<User | null> => {
    try {
      const { data } = await api.get<Pick<AuthResponse, "user" | "mentor">>("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
        skipAuthRefresh: true,
        timeout: 15_000,
      });
      // Validate the callback before replacing the current account/session.
      if (!data.user?.id || !data.user.role) return null;
      persist({ ...data, accessToken: token, refreshToken: refreshToken || "" });
      if (!refreshToken) localStorage.removeItem(KEYS.refresh);
      return data.user;
    } catch {
      console.warn("[AuthContext] Callback session could not be restored");
      return null;
    }
  }, [persist]);

  /* ─── Update user locally (optimistic) ─── */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem(KEYS.user, JSON.stringify(next));
      const token = localStorage.getItem(KEYS.access);
      if (token && updates.role) setAuthCookies(token, next.role);
      return next;
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      mentor,
      loading,
      googleAuthenticating,
      googleAuthError,
      login,
      verify2FALogin,
      verifyPasskeyLogin,
      loginWithGoogle,
      register,
      verifySignupOTP,
      logout,
      refreshUser,
      setSessionFromToken,
      updateUser,
      isUser: user?.role === "STUDENT",
      isStudent: user?.role === "STUDENT",
      isMentor: user?.role === "MENTOR",
      isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
      isSuperAdmin: user?.role === "SUPER_ADMIN",
    }),
    [user, mentor, loading, googleAuthenticating, googleAuthError, login, verify2FALogin, verifyPasskeyLogin, loginWithGoogle, register, verifySignupOTP, logout, refreshUser, setSessionFromToken, updateUser],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
