"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function ForgotPasswordPage() {
  // Steps: 1 = Enter email, 2 = Check inbox
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email."); return; }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.toLowerCase() });
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.error ?? "Failed to send reset email.")
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError("");
    setResendSuccess("");
    setResending(true);
    try {
      await api.post("/auth/forgot-password", { email: email.toLowerCase() });
      setResendSuccess("Reset link resent! Check your inbox.");
      setCooldown(60);
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.error ?? "Failed to resend.")
          : "Failed to resend. Please try again."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">

        {/* Back link */}
        <div>
          <Link
            href="/signin"
            className="text-xs uppercase tracking-[0.22em] text-(--muted) hover:text-(--fg) transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>

        {/* ── Step 1: Enter email ─────────────────────────────── */}
        {step === 1 && (
          <>
            <div className="flex flex-col gap-3 animate-fade-in">
              <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
                Reset password
              </p>
              <h1 className="font-display text-5xl leading-none">Forgot?</h1>
              <p className="text-(--muted) leading-relaxed">
                Enter your email and we'll send you a secure link to reset
                your password — no code needed.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm animate-fade-in" role="alert">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleEmailSubmit}>
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
                {loading ? "Sending link…" : "Send reset link"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: Check inbox ─────────────────────────────── */}
        {step === 2 && (
          <>
            <div className="flex flex-col gap-3 animate-fade-in">
              {/* Envelope illustration */}
              <div className="w-16 h-16 rounded-2xl bg-(--fg)/6 flex items-center justify-center mb-1">
                <svg className="w-8 h-8 text-(--fg)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
                Check your inbox
              </p>
              <h1 className="font-display text-5xl leading-none">Link sent.</h1>
              <p className="text-(--muted) leading-relaxed">
                We emailed a secure reset link to{" "}
                <strong className="text-(--fg)">{email}</strong>.{" "}
                Click the link in the email to choose a new password.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm animate-fade-in" role="alert">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="rounded-lg bg-green-500/10 text-green-600 px-4 py-3 text-sm animate-fade-in" role="alert">
                {resendSuccess}
              </div>
            )}

            {/* Primary CTA — Open Gmail */}
            <div className="flex flex-col gap-3">
              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full rounded-full border border-(--fg)/15 bg-(--fg)/5 hover:bg-(--fg)/10 transition-colors px-7 py-3.5 text-sm font-medium cursor-pointer"
              >
                {/* Gmail icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#EA4335" opacity="0.15"/>
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#EA4335"/>
                </svg>
                Open Gmail
              </a>

              {/* Also support other mail clients */}
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-center gap-2 w-full rounded-full border border-(--fg)/10 hover:bg-(--fg)/5 transition-colors px-7 py-3 text-sm text-(--muted) cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Open default mail app
              </a>
            </div>

            {/* Resend + back */}
            <div className="flex flex-col gap-4 text-sm border-t border-(--fg)/5 pt-6">
              <p className="text-(--muted)">
                Didn't get the email?{" "}
                <button
                  type="button"
                  disabled={cooldown > 0 || resending}
                  onClick={handleResend}
                  className="text-(--fg) font-medium underline underline-offset-4 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:no-underline cursor-pointer"
                >
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : resending
                    ? "Resending…"
                    : "Resend link"}
                </button>
              </p>

              <button
                type="button"
                onClick={() => { setStep(1); setError(""); setResendSuccess(""); }}
                className="self-start text-xs uppercase tracking-[0.18em] text-(--muted) hover:text-(--fg) transition-colors cursor-pointer"
              >
                ← Wrong email? Change it
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
