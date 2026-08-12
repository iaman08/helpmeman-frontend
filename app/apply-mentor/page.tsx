"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AxiosError } from "axios";
import OTPInput from "@/components/OTPInput";
import api from "@/lib/api";
import PasswordStrength from "@/components/PasswordStrength";
import { Sparkles, ShieldCheck, Zap, Award, ArrowRight } from "lucide-react";

export default function ApplyMentorPage() {
  const { register, verifySignupOTP, loginWithGoogle, user, mentor, loading } = useAuth();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Flow states
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Resend OTP states
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Pre-warm post-signup destinations
  useEffect(() => {
    router.prefetch("/onboarding");
    router.prefetch("/mentor");
    router.prefetch("/mentor/status");
  }, [router]);

  // Redirect if already logged in (skip during OTP step)
  useEffect(() => {
    if (!loading && user && step === 1) {
      let dest = "/onboarding";
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        dest = "/admin";
      } else if (user.role === "MENTOR" && mentor) {
        dest = mentor.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
      }
      window.location.replace(dest);
    }
  }, [user, mentor, loading, step]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Return null while checking auth state or if redirecting
  if (loading || (user && step === 1)) return null;

  async function handleRegisterSubmit(e: FormEvent) {
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
    if (!agreed) {
      setError("Please agree to the Terms & Conditions and Privacy Policy first.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await register(name.trim(), email.toLowerCase(), password);
      if (response.requiresOTP) {
        setStep(2);
        setCooldown(60);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error ?? "Mentor application failed to initiate. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOTPSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setSubmitting(true);
    try {
      await verifySignupOTP({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        phone: phone ? phone.trim() : undefined,
        otp,
        role: "MENTOR",
        onboardingRole: "MENTOR",
      });

      // Direct mentors straight into the AI onboarding chatbot
      window.location.replace("/onboarding");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error ?? "Verification failed. Please try again.",
        );
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
        email: email.toLowerCase(),
        purpose: "signup",
      });
      setResendSuccess(data.message || "Verification code resent successfully.");
      setCooldown(data.cooldown || 60);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to resend verification code.");
      } else {
        setError("Failed to resend verification code.");
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-8 relative z-10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity select-none group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-amber-400/10 to-amber-500/30 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">HelpMeMan <span className="text-amber-400">Mentor</span></span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Value Proposition & Perks */}
        <div className="lg:col-span-5 flex flex-col gap-6 p-4 sm:p-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold w-fit">
            <Zap className="w-3.5 h-3.5" />
            <span>Apply to Become a Mentor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Share knowledge. <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Inspire the next generation.
            </span>
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Join an elite network of leaders, founders, and engineers. After sign-up, Ruth AI will guide you through a quick 5-minute interactive onboarding conversation.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Interactive AI Onboarding</h2>
                <p className="text-xs text-zinc-400 mt-0.5">No long, tedious forms. Ruth AI builds your profile from your responses.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">High-Impact Mentorship</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Guide ambitious mentees, set your own availability, and earn for sessions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">Transparent Admin Review</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Your submitted profile is reviewed directly by our admin team for quality assurance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Mentor Sign-Up Card */}
        <div className="lg:col-span-7 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-6 sm:p-10 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Create Mentor Account
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Start your application today. Next step is your Ruth AI conversation.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-xs mb-5 text-center font-medium" role="alert">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div>
                  <label htmlFor="mentor-name-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    id="mentor-name-input"
                    type="text"
                    required
                    placeholder="Dr. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-800 rounded-xl shadow-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm bg-zinc-950/60 text-white transition-all"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="mentor-email-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="mentor-email-input"
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-800 rounded-xl shadow-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm bg-zinc-950/60 text-white transition-all"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="mentor-password-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      id="mentor-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 border border-zinc-800 rounded-xl placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm bg-zinc-950/60 text-white transition-all"
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
                      aria-label="Toggle password visibility"
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
                </div>

                {/* Terms Consent Checkbox */}
                <div className="flex items-start gap-2.5 my-3 select-none">
                  <input
                    id="mentor-agree-checkbox"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                  <label htmlFor="mentor-agree-checkbox" className="text-xs text-zinc-400 leading-normal cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" className="text-amber-400 hover:underline font-medium">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-amber-400 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <button
                  id="mentor-submit-button"
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-amber-500/30 rounded-xl shadow-lg shadow-amber-500/10 text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span>Sending verification code…</span>
                  ) : (
                    <>
                      <span>Apply as Mentor</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase select-none">
                  <span className="bg-zinc-900 px-3 text-zinc-500 tracking-wider">or</span>
                </div>
              </div>

              <button
                id="mentor-google-signup-button"
                type="button"
                disabled={googleLoading}
                onClick={async () => {
                  if (!agreed) {
                    setError("Please agree to the Terms & Conditions and Privacy Policy first.");
                    return;
                  }
                  setError("");
                  setGoogleLoading(true);
                  try {
                    await loginWithGoogle("MENTOR");
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : "Google sign-up failed";
                    setGoogleLoading(false);
                    if (!msg.includes("popup-closed") && !msg.includes("cancelled")) setError(msg);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-800 py-3 text-sm font-medium hover:bg-zinc-800/60 transition-colors cursor-pointer bg-zinc-950/40 text-zinc-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <svg className="w-5 h-5 animate-spin text-zinc-200" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? "Opening Google…" : "Continue with Google"}
              </button>

              <p className="text-center text-xs text-zinc-400 mt-6 select-none">
                Already have an account?{" "}
                <Link href="/signin" className="text-amber-400 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-center text-2xl font-bold text-white tracking-tight mb-2 select-none">
                Verify Your Email
              </h2>
              <p className="text-center text-xs text-zinc-400 mb-6 max-w-xs mx-auto">
                We sent a 6-digit code to <strong className="text-white">{email}</strong> to verify your mentor profile creation.
              </p>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-xs mb-4 text-center font-medium" role="alert">
                  {error}
                </div>
              )}

              {resendSuccess && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 text-xs mb-4 text-center font-medium" role="alert">
                  {resendSuccess}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleOTPSubmit}>
                <div className="flex justify-center">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    disabled={submitting}
                    error={!!error}
                  />
                </div>

                <div>
                  <label htmlFor="mentor-phone-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="mentor-phone-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-800 rounded-xl shadow-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm bg-zinc-950/60 text-white transition-all"
                    autoComplete="tel"
                  />
                </div>

                <button
                  id="mentor-verify-button"
                  type="submit"
                  disabled={submitting || otp.length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-amber-500/30 rounded-xl shadow-lg shadow-amber-500/10 text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Verifying & Starting Ruth AI…" : "Verify & Launch Ruth AI Onboarding"}
                </button>

                <a
                  href="https://mail.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-zinc-800 rounded-xl shadow-sm text-xs font-semibold text-zinc-300 hover:bg-zinc-800/60 transition-all cursor-pointer text-center bg-transparent mt-2"
                >
                  <svg className="w-4 h-4 text-[#EA4335]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Open Gmail Inbox
                </a>
              </form>

              <div className="flex flex-col items-center gap-4 text-xs mt-6 border-t border-zinc-800 pt-6">
                <p className="text-zinc-400 text-center">
                  Didn't get the code?{" "}
                  <button
                    type="button"
                    disabled={cooldown > 0 || resending}
                    onClick={handleResendOTP}
                    className="text-amber-400 font-medium hover:underline cursor-pointer bg-transparent border-none outline-none"
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
                    setStep(1);
                    setError("");
                    setResendSuccess("");
                    setOtp("");
                  }}
                  className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none"
                >
                  ← Back to edit details
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
