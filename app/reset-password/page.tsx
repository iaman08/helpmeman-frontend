"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";
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
            <p className="text-(--muted) leading-relaxed">
              This reset link is invalid or has already been used. Reset links
              expire after 1 hour for security.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
        <div className="h-5 w-5 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
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
            <p className="text-(--muted) leading-relaxed">
              Your password has been reset. You can now sign in with your new
              password.
            </p>
          </div>
          <Link
            href="/signin"
            className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-10 py-4 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
            Reset Password
          </p>
          <h1 className="font-display text-5xl leading-none">New password.</h1>
          <p className="text-(--muted) leading-relaxed">
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
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              New Password
            </span>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-(--fg)/5 rounded-lg pl-4 pr-11 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--fg) transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <PasswordStrength password={password} />
          </label>

          {/* Confirm password */}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Confirm New Password
            </span>
            <div className="relative w-full">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-(--fg)/5 rounded-lg pl-4 pr-11 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--fg) transition-colors focus:outline-none cursor-pointer"
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating password…" : "Reset Password"}
          </button>
        </form>

      </div>
    </main>
  );
}
