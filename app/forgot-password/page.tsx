"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to send reset email.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

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

        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
            Reset password
          </p>
          <h1 className="font-display text-5xl leading-none">Forgot?</h1>
          <p className="text-(--muted) leading-relaxed">
            Enter your email and we&rsquo;ll send you a link to reset your
            password.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-emerald-500/10 text-emerald-600 px-4 py-4 text-sm leading-relaxed">
            If an account with that email exists, we&rsquo;ve sent a reset link.
            Check your inbox (and spam).
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
                  Email
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
                  autoComplete="email"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
