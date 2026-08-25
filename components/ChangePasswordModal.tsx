"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import PasswordStrength from "@/components/PasswordStrength";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface ChangePasswordModalProps {
  onSuccess: () => void;
}

export function ChangePasswordModal({ onSuccess }: ChangePasswordModalProps) {
  const { updateUser } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

  const isStrong =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword);

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isStrong && passwordsMatch && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<{
        message: string;
        accessToken?: string;
        refreshToken?: string;
        user?: any;
        requiresRelogin?: boolean;
      }>("/auth/change-password", { newPassword });

      if (data.requiresRelogin) {
        // Rare: auto-relogin failed server-side — clear session and redirect to signin
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/signin");
        return;
      }

      // ── Seamlessly swap to the fresh session returned by the server ──
      if (data.accessToken) {
        localStorage.setItem("helpmeman.accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("helpmeman.refreshToken", data.refreshToken);
        }
        // Update cookies read by Next.js middleware for routing
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        const secure = isHttps ? ";Secure" : "";
        document.cookie = `helpmeman.accessToken=${data.accessToken};path=/;max-age=31536000;SameSite=Lax${secure}`;
        if (data.user?.role) {
          document.cookie = `helpmeman.role=${data.user.role};path=/;max-age=31536000;SameSite=Lax${secure}`;
        }
      }

      // First show the success checkmark animation inside the modal
      setDone(true);

      // Allow 1.5s for the success animation to play before updating React context state,
      // which unmounts this modal gracefully.
      setTimeout(() => {
        if (data.user) {
          updateUser({ ...data.user, mustChangePassword: false });
        } else {
          updateUser({ mustChangePassword: false });
        }
        onSuccess();
      }, 1500);
    } catch (err: any) {
      const errorData = err?.response?.data?.error;
      const errorMsg =
        typeof errorData === "string"
          ? errorData
          : errorData?.message ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to update password. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline)",
          borderRadius: "1.5rem",
          boxShadow:
            "0 0 0 1px var(--hairline), 0 32px 64px rgba(0,0,0,0.24), 0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Subtle top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--fg) 40%, var(--fg) 60%, transparent 100%)",
            opacity: 0.15,
          }}
        />

        <div className="px-8 py-9">
          {done ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{ background: "color-mix(in srgb, var(--fg) 6%, transparent)" }}
              >
                <CheckCircle2 className="h-6 w-6" style={{ color: "var(--fg)" }} />
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--fg)" }}>
                  Password updated
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  Unlocking your admin panel…
                </p>
              </div>
              <div
                className="w-full h-px overflow-hidden rounded-full"
                style={{ background: "var(--hairline)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "var(--fg)",
                    animation: "progressBar 1.5s ease-in-out forwards",
                    width: "0%",
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-2.5 mb-1">
                  <Lock className="h-4 w-4 shrink-0" style={{ color: "var(--muted)" }} />
                  <span
                    className="text-xs font-medium uppercase tracking-widest"
                    style={{ color: "var(--muted)" }}
                  >
                    Security
                  </span>
                </div>
                <h2
                  className="text-[1.35rem] font-semibold leading-snug"
                  style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}
                >
                  Set your password
                </h2>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                  Your account has a temporary password. Choose a permanent one to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* New password */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cp-new"
                    className="text-xs font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="cp-new"
                      ref={inputRef}
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="w-full pr-10 py-2.5 text-sm outline-none transition-all"
                      style={{
                        background: "transparent",
                        color: "var(--fg)",
                        borderBottom: "1px solid var(--hairline)",
                        paddingLeft: "0",
                        borderRadius: "0",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--fg)")}
                      onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--hairline)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-60"
                      tabIndex={-1}
                      aria-label="Toggle visibility"
                    >
                      {showNew
                        ? <EyeOff className="h-4 w-4" style={{ color: "var(--muted)" }} />
                        : <Eye className="h-4 w-4" style={{ color: "var(--muted)" }} />}
                    </button>
                  </div>
                  {newPassword && <PasswordStrength password={newPassword} />}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="cp-confirm"
                    className="text-xs font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="cp-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className="w-full pr-10 py-2.5 text-sm outline-none transition-all"
                      style={{
                        background: "transparent",
                        color: "var(--fg)",
                        borderBottom: `1px solid ${
                          confirmPassword && !passwordsMatch
                            ? "rgba(239,68,68,0.6)"
                            : confirmPassword && passwordsMatch
                            ? "rgba(34,197,94,0.6)"
                            : "var(--hairline)"
                        }`,
                        paddingLeft: "0",
                        borderRadius: "0",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--fg)")}
                      onBlur={(e) => {
                        if (confirmPassword && !passwordsMatch)
                          e.currentTarget.style.borderBottomColor = "rgba(239,68,68,0.6)";
                        else if (confirmPassword && passwordsMatch)
                          e.currentTarget.style.borderBottomColor = "rgba(34,197,94,0.6)";
                        else
                          e.currentTarget.style.borderBottomColor = "var(--hairline)";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-60"
                      tabIndex={-1}
                      aria-label="Toggle visibility"
                    >
                      {showConfirm
                        ? <EyeOff className="h-4 w-4" style={{ color: "var(--muted)" }} />
                        : <Eye className="h-4 w-4" style={{ color: "var(--muted)" }} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p
                      className="text-xs"
                      style={{ color: passwordsMatch ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)" }}
                    >
                      {passwordsMatch ? "Passwords match" : "Passwords don't match"}
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(239,68,68,0.9)" }}>
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  id="change-password-submit"
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-1 w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    background: canSubmit ? "var(--fg)" : "var(--hairline)",
                    color: canSubmit ? "var(--bg)" : "var(--muted)",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                  }}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
                  ) : (
                    <>Set password <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
                  Required once · takes 10 seconds
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
