"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AxiosError } from "axios";

export default function SignInPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const dest =
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "MENTOR"
            ? "/mentor"
            : "/dashboard";
      router.replace(dest);
    }
  }, [user, loading, router]);

  // Don't render form while checking auth or if already logged in
  if (loading || user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      // Auth context will set user, triggering the redirect above on re-render
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Login failed. Please try again.");
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
            Welcome back
          </p>
          <h1 className="font-display text-5xl leading-none">Sign in.</h1>
          <p className="text-(--muted) leading-relaxed">
            Continue your conversation with the mentors who&rsquo;ve been there.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm" role="alert">
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
              className="bg-(--fg)/5 rounded-lg px-4 py-3.5 outline-none focus:bg-(--fg)/8 transition-colors"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3.5 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="current-password"
            />
          </label>

          <div className="flex items-center justify-between mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-(--accent) text-(--accent-fg) px-10 py-4 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            <Link
              href="/forgot-password"
              className="text-xs text-(--muted) hover:text-(--fg) transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-4 flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-(--fg)/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-(--bg) px-2 text-(--muted) tracking-widest">Demo access</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => { setEmail("admin@helpmeman.com"); setPassword("password123"); }}
              className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-(--fg)/5 hover:bg-(--fg)/8 transition-colors text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wider">Admin</span>
              <span className="text-[10px] text-(--muted)">admin@helpmeman.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("mentor@helpmeman.com"); setPassword("password123"); }}
              className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-(--fg)/5 hover:bg-(--fg)/8 transition-colors text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wider">Mentor</span>
              <span className="text-[10px] text-(--muted)">mentor@helpmeman.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("user@helpmeman.com"); setPassword("password123"); }}
              className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-(--fg)/5 hover:bg-(--fg)/8 transition-colors text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wider">User</span>
              <span className="text-[10px] text-(--muted)">user@helpmeman.com</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-(--muted) mt-4">
          New here?{" "}
          <Link href="/signup" className="text-(--fg) font-medium underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
