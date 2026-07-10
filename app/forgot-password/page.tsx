"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import OTPInput from "@/components/OTPInput";
import PasswordStrength from "@/components/PasswordStrength";

export default function ForgotPasswordPage() {
  // Flow steps: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Data states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP Resend cooldown states
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Submit Email
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.toLowerCase() });
      setStep(2);
      setCooldown(60); // 60s cooldown
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to request password reset.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Submit OTP
  async function handleOTPVerifySubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-reset-otp", {
        email: email.toLowerCase(),
        otp,
      });
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Invalid or expired OTP.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Resend OTP
  async function handleResendOTP() {
    if (cooldown > 0 || resending) return;
    setError("");
    setResendSuccess("");
    setResending(true);

    try {
      const { data } = await api.post("/auth/resend-otp", {
        email: email.toLowerCase(),
        purpose: "reset",
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

  // Step 3: Submit New Password
  async function handlePasswordSubmit(e: FormEvent) {
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

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token: resetToken,
        password,
      });
      setStep(4);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to reset password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md flex flex-col gap-10">
        <div>
          {step !== 4 && (
            <Link
              href="/signin"
              className="text-xs uppercase tracking-[0.22em] text-(--muted) hover:text-(--fg)"
            >
              ← Back to sign in
            </Link>
          )}
        </div>

        {step === 1 && (
          <>
            <div className="flex flex-col gap-3 animate-fade-in">
              <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
                Reset password
              </p>
              <h1 className="font-display text-5xl leading-none">Forgot?</h1>
              <p className="text-(--muted) leading-relaxed">
                Enter your email address to receive a secure 6-digit OTP code to reset your password.
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
                {loading ? "Sending OTP…" : "Send verification code"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-3 animate-fade-in">
              <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
                Verification
              </p>
              <h1 className="font-display text-5xl leading-none">Verify OTP.</h1>
              <p className="text-(--muted) leading-relaxed">
                A 6-digit code has been sent to <strong className="text-(--fg)">{email}</strong>.
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
                disabled={loading}
                error={!!error}
                onComplete={(val) => {
                  // Auto-submit the instant all 6 digits are entered
                  if (!loading) {
                    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
                    setOtp(val);
                    handleOTPVerifySubmit(syntheticEvent);
                  }
                }}
              />

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying…" : "Verify OTP"}
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
                    : "Resend code"}
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
                className="text-xs uppercase tracking-[0.18em] text-(--muted) hover:text-(--fg) transition-colors cursor-pointer"
              >
                ← Back to edit email
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
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

            <form className="flex flex-col gap-5" onSubmit={handlePasswordSubmit}>
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
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                  Confirm New Password
                </span>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-(--fg)/5 rounded-lg pl-4 pr-11 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--fg) transition-colors focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? (
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
                className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating password…" : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.22em] text-emerald-600 font-semibold">
                Success
              </p>
              <h1 className="font-display text-5xl leading-none">All set!</h1>
              <p className="text-(--muted) leading-relaxed">
                Your password has been reset successfully. You can now use your new password to sign in.
              </p>
            </div>
            
            <Link
              href="/signin"
              className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-10 py-4 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Sign in now
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
