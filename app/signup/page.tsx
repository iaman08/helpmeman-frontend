"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AxiosError } from "axios";

export default function SignUpPage() {
  const { register, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email, password);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error ?? "Registration failed. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">
        <div>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.22em] text-(--muted) hover:text-(--fg)"
          >
            ← HelpMeMan
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
            Create your account
          </p>
          <h1 className="font-display text-5xl leading-none">Sign up.</h1>
          <p className="text-(--muted) leading-relaxed">
            Three minutes to set up. Then meet your first mentor.
          </p>
        </div>

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
              Full name
            </span>
            <input
              type="text"
              required
              placeholder="Aanya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="name"
            />
          </label>
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
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
              Password
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
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--fg)/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-(--bg) px-2 text-(--muted) tracking-widest">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            setError("");
            try {
              await loginWithGoogle();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Google sign-up failed";
              if (!msg.includes("popup-closed")) setError(msg);
            }
          }}
          className="flex items-center justify-center gap-3 w-full rounded-full border border-(--fg)/10 py-3.5 text-sm font-medium hover:bg-(--fg)/5 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-sm text-(--muted)">
          Already on HelpMeMan?{" "}
          <Link
            href="/signin"
            className="text-(--fg) underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
