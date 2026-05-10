"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid reset link.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error ?? "Reset failed. The link may have expired.",
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-(--muted)">Invalid or missing reset token.</p>
        <Link
          href="/forgot-password"
          className="text-sm text-(--fg) underline-offset-4 hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Reset password
        </p>
        <h1 className="font-display text-5xl leading-none">New password.</h1>
        <p className="text-(--muted) leading-relaxed">
          Choose a strong password for your account.
        </p>
      </div>

      {success ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-emerald-500/10 text-emerald-600 px-4 py-4 text-sm">
            Password reset successful!
          </div>
          <Link
            href="/signin"
            className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div
              className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                New password
              </span>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
                autoComplete="new-password"
                minLength={8}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                Confirm password
              </span>
              <input
                type="password"
                required
                placeholder="Type it again"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
                autoComplete="new-password"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">
        <div>
          <Link
            href="/signin"
            className="text-xs uppercase tracking-[0.22em] text-(--muted) hover:text-(--fg)"
          >
            ← Back to sign in
          </Link>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse" />}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
