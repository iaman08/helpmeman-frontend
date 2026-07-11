"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AxiosError } from "axios";
import OTPInput from "@/components/OTPInput";
import api from "@/lib/api";

export default function SignInPage() {
  const { login, verifySignupOTP, loginWithGoogle, user, mentor, loading } = useAuth();
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
  const [googleLoading, setGoogleLoading] = useState(false);

  // Resend OTP states
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Pre-warm all possible post-login destinations while the user is on this
  // page. Next.js starts compiling those route bundles in the background so
  // the first navigation after login is instant instead of 20+ seconds.
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/mentor");
    router.prefetch("/mentor/status");
    router.prefetch("/admin");
    router.prefetch("/onboarding");
  }, [router]);

  // Redirect if already logged in (page-level guard, only fires on direct URL navigation)
  useEffect(() => {
    if (!loading && user) {
      let dest = "/onboarding";
      if (user.role === "ADMIN") {
        dest = "/admin";
      } else if (user.role === "MENTOR" && mentor) {
        dest = mentor.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
      } else if (user.onboardingRole === "MENTEE") {
        dest = "/dashboard";
      }
      router.replace(dest);
    }
  }, [user, mentor, loading, router]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Show spinner while auth is resolving; show nothing if user already logged in (redirect in progress)
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-800 dark:border-zinc-700 dark:border-t-zinc-200 animate-spin" /></div>;
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121214]">
        <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-800 dark:border-zinc-700 dark:border-t-zinc-200 animate-spin" />
      </div>
    );
  }

  // Don't render form while checking auth or if already logged in
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121214]">
        <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-800 dark:border-zinc-700 dark:border-t-zinc-200 animate-spin" />
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const dest = await login(email, password);
      // Use router.push so Next.js uses the prefetched bundle (instant).
      // window.location.replace would trigger a full-page reload, bypassing
      // the prefetch cache and causing 20+ second compile times.
      router.push(dest);
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
      const dest = await verifySignupOTP({
        name: "", // Not needed as it resolved on backend for existing users
        email: unverifiedEmail.toLowerCase(),
        password,
        otp,
      });
      router.push(dest);
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
      const dest = await login(demoEmail, demoPassword);
      router.push(dest);
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
    <main className="min-h-screen bg-gray-50 dark:bg-[#0A0A0B] flex flex-col justify-center items-center py-12 px-6 sm:px-6 lg:px-8 transition-colors duration-300">

      {/* Brand logo at the top */}
      <div className="flex flex-col items-center justify-center mb-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity select-none">
          <img src="/logo.svg" alt="HelpMeMan Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl tracking-tight text-[var(--fg)]">HelpMeMan</span>
        </Link>
      </div>

      {/* ChatGPT-style Centered login Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#121214] py-8 px-6 sm:px-10 border border-gray-200/60 dark:border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.5)]">
        {step === "login" ? (
          <>
            <h2 className="text-center text-[28px] font-bold text-[var(--fg)] tracking-tight mb-1 select-none">
              Welcome back
            </h2>
            <p className="text-center text-[13px] text-[var(--muted)] mb-6 max-w-xs mx-auto">
              Continue your conversation with the mentors who've been there.
            </p>

            {error && (
              <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm mb-4 animate-fade-in text-center" role="alert">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[14px] bg-transparent text-[var(--fg)] transition-all"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#2563EB] hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative rounded-lg shadow-sm">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-3.5 pr-11 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[14px] bg-transparent text-[var(--fg)] transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[var(--fg)]"
                  >
                    {/* Eye Icon */}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-[var(--bg)] bg-[var(--fg)] hover:opacity-90 active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase select-none">
                <span className="bg-white dark:bg-[#121214] px-3 text-[var(--muted)] tracking-wider">or</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!!googleLoading}
              onClick={async () => {
                setError("");
                setGoogleLoading(true);
                try {
                  await loginWithGoogle();
                  // redirect is handled by onAuthStateChange in auth-context
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "Google sign-in failed";
                  setGoogleLoading(false);
                  if (!msg.includes("popup-closed") && !msg.includes("cancelled")) setError(msg);
                }
              }}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-zinc-700 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent text-[var(--fg)] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <svg className="w-5 h-5 animate-spin text-[var(--fg)]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {googleLoading ? "Opening Google…" : "Continue with Google"}
            </button>

            <p className="text-center text-sm text-[var(--muted)] mt-6 select-none">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#2563EB] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-center text-3xl font-bold text-[var(--fg)] tracking-tight mb-2 select-none">
              Verify your email
            </h2>
            <p className="text-center text-sm text-[var(--muted)] mb-6 max-w-xs mx-auto">
              Your email is not verified. We sent a 6-digit code to <strong className="text-[var(--fg)]">{unverifiedEmail}</strong>.
            </p>

            {error && (
              <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm mb-4 animate-fade-in text-center" role="alert">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="rounded-lg bg-green-500/10 text-green-600 px-4 py-3 text-sm mb-4 animate-fade-in text-center" role="alert">
                {resendSuccess}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleOTPVerifySubmit}>
              <div className="flex justify-center">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={submitting}
                  error={!!error}
                  onComplete={(val) => {
                    if (!submitting) {
                      setOtp(val);
                      handleOTPVerifySubmit({ preventDefault: () => {} } as FormEvent);
                    }
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length < 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-[var(--bg)] bg-[var(--fg)] hover:opacity-90 active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Verifying…" : "Verify & Sign In"}
              </button>
            </form>

            <div className="flex flex-col items-center gap-4 text-sm mt-6 border-t border-gray-200 dark:border-zinc-800 pt-6 animate-fade-in">
              <p className="text-[var(--muted)] text-center">
                Didn't get the code?{" "}
                <button
                  type="button"
                  disabled={cooldown > 0 || resending}
                  onClick={handleResendOTP}
                  className="text-[#2563EB] font-medium hover:underline cursor-pointer bg-transparent border-none outline-none"
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
                className="text-xs uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer bg-transparent border-none"
              >
                ← Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

