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

// ─── Google One Tap / popup helper ───────────────────────────────────────────
// Uses Google's Identity Services (GIS) JavaScript library to get an ID token.
// The library is loaded lazily on first Google login attempt.
function loadGoogleGSI(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).google?.accounts?.id) return resolve();
    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * Opens a Google OAuth popup and resolves with a Google ID token.
 * Falls back gracefully if GOOGLE_CLIENT_ID is not configured.
 */
function getGoogleIdToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const gis = (window as any).google?.accounts?.oauth2;
    if (!gis) {
      return reject(new Error("Google Identity Services failed to load"));
    }

    const client = gis.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response: any) => {
        if (response.error) {
          return reject(new Error(response.error));
        }
        // access_token received — exchange for ID token via userinfo
        // Actually, for our backend we need the id_token.
        // Use the authorization code flow instead for id_token.
        reject(new Error("Use authorization code flow — see implementation below"));
      },
    });

    client.requestAccessToken();
  });
}

/**
 * Full Google Sign-In using popup with id_token.
 * Uses google.accounts.id.prompt() which returns a credential (id_token).
 */
function googleSignInPopup(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      return reject(new Error("Google Identity Services not loaded"));
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          resolve(response.credential); // This is the id_token
        } else {
          reject(new Error("Google sign-in was cancelled or failed"));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Show the One Tap prompt (works even without a button)
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap not available, try popup via renderButton (workaround)
        // Create a temporary hidden div and render the button
        const tempDiv = document.createElement("div");
        tempDiv.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;";
        document.body.appendChild(tempDiv);

        google.accounts.id.renderButton(tempDiv, {
          type: "standard",
          size: "large",
          text: "signin_with",
        });

        // Auto-click the rendered button
        setTimeout(() => {
          const btn = tempDiv.querySelector('[role="button"]') as HTMLElement;
          if (btn) btn.click();
        }, 100);

        // Clean up after a delay
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 30000);
      }
    });
  });
}

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

  /* ─── Persist helper ─── */
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

  /* ─── Login ─── */
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

      const { data } = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      return persist(data);
    },
    [persist],
  );

  /* ─── Google Login — uses Google Identity Services (no Firebase) ─── */
  const loginWithGoogle = useCallback(async (): Promise<string> => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("Google login is currently disabled. NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
    }

    setGoogleAuthenticating(true);
    try {
      // Load the Google Identity Services library
      await loadGoogleGSI();

      // Get an ID token via Google's One Tap / Sign-In popup
      const idToken = await googleSignInPopup(clientId);

      // Send the ID token to our backend for verification (same endpoint, same behavior)
      const { data } = await api.post<AuthResponse>("/auth/google", { idToken });
      return persist(data);
    } finally {
      setGoogleAuthenticating(false);
    }
  }, [persist]);

  /* ─── Register ─── */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data } = await api.post<OTPResponse>("/auth/register", {
        name,
        email,
        password,
      });
      return data;
    },
    [],
  );

  /* ─── Verify Signup OTP ─── */
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

  /* ─── Refresh user profile ─── */
  const refreshUser = useCallback(async () => {
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
