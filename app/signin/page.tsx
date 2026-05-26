"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AxiosError } from "axios";
import OTPInput from "@/components/OTPInput";
import api from "@/lib/api";

export default function SignInPage() {
  const { login, verifySignupOTP, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  
  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP flow states
  const [step, setStep] = useState<"login" | "otp">("login");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  // General flow states
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Resend OTP states
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

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

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setUnverifiedEmail(err.response.data.email || email);
        setStep("otp");
        setCooldown(60);
      } else if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Login failed. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOTPVerifySubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setSubmitting(true);
    try {
      await verifySignupOTP({
        name: "", // Not needed as it resolved on backend for existing users
        email: unverifiedEmail.toLowerCase(),
        password,
        otp,
      });
      // Auth context will set user, triggering redirect
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Verification failed. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOTP() {
    if (cooldown > 0 || resending) return;
    setError("");
    setResendSuccess("");
    setResending(true);

    try {
      const { data } = await api.post("/auth/resend-otp", {
        email: unverifiedEmail.toLowerCase(),
        purpose: "signup",
      });
      setResendSuccess(data.message || "OTP resent successfully.");
      setCooldown(data.cooldown || 60);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to resend OTP.");
      } else {
        setError("Failed to resend OTP.");
      }
    } finally {
      setResending(false);
    }
  }

  const handleDemoAccess = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setSubmitting(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Login failed. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

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

        {step === "login" ? (
          <>
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
              <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm animate-fade-in" role="alert">
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
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-(--fg)/5 rounded-lg pl-4 pr-11 py-3.5 outline-none focus:bg-(--fg)/8 transition-colors"
                    autoComplete="current-password"
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
                  const msg = err instanceof Error ? err.message : "Google sign-in failed";
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
                  onClick={() => handleDemoAccess("admin@helpmeman.com", "password123")}
                  className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-(--fg)/5 hover:bg-(--fg)/8 transition-colors text-left cursor-pointer"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">Admin</span>
                  <span className="text-[10px] text-(--muted)">admin@helpmeman.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoAccess("mentor@helpmeman.com", "password123")}
                  className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-(--fg)/5 hover:bg-(--fg)/8 transition-colors text-left cursor-pointer"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">Mentor</span>
                  <span className="text-[10px] text-(--muted)">mentor@helpmeman.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoAccess("user@helpmeman.com", "password123")}
                  className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-(--fg)/5 hover:bg-(--fg)/8 transition-colors text-left cursor-pointer"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">User</span>
                  <span className="text-[10px] text-(--muted)">user@helpmeman.com</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
                Verify your email
              </p>
              <h1 className="font-display text-5xl leading-none">Enter OTP.</h1>
              <p className="text-(--muted) leading-relaxed">
                Your email is not verified. We sent a 6-digit code to <strong className="text-(--fg)">{unverifiedEmail}</strong>.
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

            <form className="flex flex-col gap-6" onSubmit={handleOTPVerifySubmit}>
              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={submitting}
                error={!!error}
              />

              <button
                type="submit"
                disabled={submitting || otp.length < 6}
                className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Verifying…" : "Verify & Sign In"}
              </button>
            </form>

            <div className="flex flex-col items-start gap-4 text-sm mt-4 border-t border-(--fg)/5 pt-6 animate-fade-in">
              <p className="text-(--muted)">
                Didn't get the code?{" "}
                <button
                  type="button"
                  disabled={cooldown > 0 || resending}
                  onClick={handleResendOTP}
                  className="text-(--fg) font-medium underline underline-offset-4 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:no-underline cursor-pointer"
                >
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : resending
                    ? "Resending…"
                    : "Resend verification code"}
                </button>
              </p>

              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                  setResendSuccess("");
                  setOtp("");
                }}
                className="text-xs uppercase tracking-[0.18em] text-(--muted) hover:text-(--fg) transition-colors cursor-pointer"
              >
                ← Back to login
              </button>
            </div>
          </>
        )}

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
