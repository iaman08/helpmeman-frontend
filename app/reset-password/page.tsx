"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import PasswordStrength from "@/components/PasswordStrength";

export default function ResetPasswordPage() {
  const router = useRouter();

  // Token extracted from Supabase magic-link URL hash
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase puts the access_token in the URL hash after the magic link redirect:
  // /reset-password#access_token=xxx&type=recovery
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const accessToken = params.get("access_token");
    const type = params.get("type");

    if (accessToken && type === "recovery") {
      setToken(accessToken);
      // Clean the token from the URL bar so it can't be shared/reused
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // No valid recovery token — show error
      setTokenError(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.error ?? "Failed to reset password.")
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Invalid / missing token ─────────────────────────────────────────────
  if (tokenError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.22em] text-red-500 font-semibold">
              Invalid link
            </p>
            <h1 className="font-display text-5xl leading-none">Oops.</h1>
            <p className="text-[var()] leading-relaxed">
              This reset link is invalid or has already been used. Reset links
              expire after 1 hour for security.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="self-start rounded-full bg-[var()] text-[var()] px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Request a new link
          </Link>
        </div>
      </main>
    );
  }

  // ── Loading token from hash ─────────────────────────────────────────────
  if (!token && !tokenError) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-[var()]/20 border-t-[var()] animate-spin" />
      </main>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-3 animate-fade-in">
            <p className="text-sm uppercase tracking-[0.22em] text-emerald-600 font-semibold">
              Success
            </p>
            <h1 className="font-display text-5xl leading-none">All set!</h1>
            <p className="text-[var()] leading-relaxed">
              Your password has been reset. You can now sign in with your new
              password.
            </p>
          </div>
          <Link
            href="/signin"
            className="self-start rounded-full bg-[var()] text-[var()] px-10 py-4 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Sign in now
          </Link>
        </div>
      </main>
    );
  }

  // ── New password form ───────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">

        <div className="flex flex-col gap-3 animate-fade-in">
          <p className="text-sm uppercase tracking-[0.22em] text-[var()]">
            Reset Password
          </p>
          <h1 className="font-display text-5xl leading-none">New password.</h1>
          <p className="text-[var()] leading-relaxed">
            Create a strong, secure new password for your account.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm animate-fade-in" role="alert">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* New password */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var()] text-xs uppercase tracking-[0.18em]">
              New Password
            </span>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var()]/5 rounded-lg pl-4 pr-11 py-3 outline-none focus:bg-[var()]/8 transition-colors"
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var()] hover:text-[var()] transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <PasswordStrength password={password} />
          </label>

          {/* Confirm password */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-[var()] text-xs uppercase tracking-[0.18em]">
              Confirm New Password
            </span>
            <div className="relative w-full">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[var()]/5 rounded-lg pl-4 pr-11 py-3 outline-none focus:bg-[var()]/8 transition-colors"
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var()] hover:text-[var()] transition-colors focus:outline-none cursor-pointer"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="self-start rounded-full bg-[var()] text-[var()] px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating password…" : "Reset Password"}
          </button>
        </form>

      </div>
    </main>
  );
}
