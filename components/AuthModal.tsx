"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { AxiosError } from "axios";
import OTPInput from "@/components/OTPInput";
import api from "@/lib/api";
import PasswordStrength from "@/components/PasswordStrength";
import { X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
  const { login, register, verifySignupOTP, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  // Suffix/Prefix states for forms
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); // optional
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // OTP flow states
  const [step, setStep] = useState<"form" | "otp">("form");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [otp, setOtp] = useState("");

  // General states
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Resend OTP states
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep("form");
      setError("");
      setResendSuccess("");
      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
      setOtp("");
      setAgreed(false);
    }
  }, [isOpen, initialMode]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      onClose();
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
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await register(name.trim(), email, password);
      if (response.requiresOTP) {
        setUnverifiedEmail(email);
        setStep("otp");
        setCooldown(60);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Registration failed. Please try again.");
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
        name: mode === "signup" ? name.trim() : "",
        email: unverifiedEmail.toLowerCase(),
        password,
        phone: phone ? phone.trim() : undefined,
        otp,
      });
      onClose();
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
      onClose();
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
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white dark:bg-[#121214] border border-gray-200/60 dark:border-zinc-800/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 dark:text-zinc-500 hover:text-[var(--fg)] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors z-20 cursor-pointer bg-transparent border-none"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* Scrollable Container */}
          <div className="overflow-y-auto px-6 sm:px-8 py-8 no-scrollbar">
            {/* Header Brand */}
            <div className="flex items-center gap-2 justify-center mb-6 select-none">
              <img src="/logo.svg" alt="HelpMeMan Logo" className="w-7 h-7 object-contain" />
              <span className="font-bold text-lg tracking-tight text-[var(--fg)]">HelpMeMan</span>
            </div>

            {step === "form" ? (
              mode === "signin" ? (
                <>
                  <h2 className="text-center text-[24px] font-bold text-[var(--fg)] tracking-tight mb-1 select-none">
                    Welcome back
                  </h2>
                  <p className="text-center text-[12px] text-[var(--muted)] mb-6 max-w-xs mx-auto">
                    Continue your conversation with the mentors who&apos;ve been there.
                  </p>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-2.5 text-xs mb-4 text-center">
                      {error}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[13px] bg-transparent text-[var(--fg)] transition-all"
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            // Redirect to forgot password
                            window.location.href = "/forgot-password";
                          }}
                          className="text-[10px] text-[#2563EB] hover:underline bg-transparent border-none cursor-pointer p-0"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative rounded-lg shadow-sm">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[13px] bg-transparent text-[var(--fg)] transition-all"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-zinc-500 hover:text-[var(--fg)] transition-colors focus:outline-none cursor-pointer bg-transparent border-none"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-[13px] font-semibold text-[var(--bg)] bg-[var(--fg)] hover:opacity-90 active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Signing in…" : "Sign in"}
                    </button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase select-none">
                      <span className="bg-white dark:bg-[#121214] px-3 text-[var(--muted)] tracking-wider">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={async () => {
                      setError("");
                      setGoogleLoading(true);
                      try {
                        await loginWithGoogle();
                        // Close modal immediately — the overlay takes over
                        onClose();
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Google sign-in failed";
                        setGoogleLoading(false);
                        if (!msg.includes("popup-closed") && !msg.includes("cancelled")) setError(msg);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 py-2.5 text-[13px] font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent text-[var(--fg)] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <svg className="w-4 h-4 animate-spin text-[var(--fg)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    {googleLoading ? "Opening Google…" : "Continue with Google"}
                  </button>

                  <p className="text-center text-[13px] text-[var(--muted)] mt-5 select-none">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("signup"); setError(""); }}
                      className="text-[#2563EB] font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-center text-[24px] font-bold text-[var(--fg)] tracking-tight mb-1 select-none">
                    Create your account
                  </h2>
                  <p className="text-center text-[12px] text-[var(--muted)] mb-6 max-w-xs mx-auto">
                    Three minutes to set up. Then meet your first mentor.
                  </p>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-2.5 text-xs mb-4 text-center">
                      {error}
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Full name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Aanya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[13px] bg-transparent text-[var(--fg)] transition-all"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[13px] bg-transparent text-[var(--fg)] transition-all"
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[13px] bg-transparent text-[var(--fg)] transition-all"
                          autoComplete="new-password"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-zinc-500 hover:text-[var(--fg)] transition-colors focus:outline-none cursor-pointer bg-transparent border-none"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PasswordStrength password={password} />
                    </div>

                    {/* Terms & Privacy Consent Checkbox */}
                    <div className="flex items-start gap-2 select-none pt-1">
                      <input
                        id="modal-agree-checkbox"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300 dark:border-zinc-600 accent-[#2563EB] cursor-pointer"
                      />
                      <label htmlFor="modal-agree-checkbox" className="text-[11px] text-[var(--muted)] leading-normal cursor-pointer">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => { onClose(); window.open("/terms", "_blank"); }}
                          className="text-[#2563EB] hover:underline font-medium bg-transparent border-none cursor-pointer p-0 text-[11px]"
                        >
                          Terms &amp; Conditions
                        </button>
                        {" "}and{" "}
                        <button
                          type="button"
                          onClick={() => { onClose(); window.open("/privacy", "_blank"); }}
                          className="text-[#2563EB] hover:underline font-medium bg-transparent border-none cursor-pointer p-0 text-[11px]"
                        >
                          Privacy Policy
                        </button>
                        .
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-[13px] font-semibold text-[var(--bg)] bg-[var(--fg)] hover:opacity-90 active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Sending verification code…" : "Create account"}
                    </button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase select-none">
                      <span className="bg-white dark:bg-[#121214] px-3 text-[var(--muted)] tracking-wider">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={async () => {
                      setError("");
                      setGoogleLoading(true);
                      try {
                        await loginWithGoogle();
                        // Close modal immediately — the overlay takes over
                        onClose();
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Google sign-up failed";
                        setGoogleLoading(false);
                        if (!msg.includes("popup-closed") && !msg.includes("cancelled")) setError(msg);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 py-2.5 text-[13px] font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent text-[var(--fg)] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <svg className="w-4 h-4 animate-spin text-[var(--fg)]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    {googleLoading ? "Opening Google…" : "Continue with Google"}
                  </button>

                  <p className="text-center text-[13px] text-[var(--muted)] mt-5 select-none">
                    Already on HelpMeMan?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("signin"); setError(""); }}
                      className="text-[#2563EB] font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )
            ) : (
              <>
                <h2 className="text-center text-2xl font-bold text-[var(--fg)] tracking-tight mb-2 select-none">
                  Verify your email
                </h2>
                <p className="text-center text-[13px] text-[var(--muted)] mb-5 max-w-xs mx-auto">
                  We sent a 6-digit verification code to <strong className="text-[var(--fg)]">{unverifiedEmail}</strong>.
                </p>

                {error && (
                  <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-2.5 text-xs mb-4 text-center">
                    {error}
                  </div>
                )}

                {resendSuccess && (
                  <div className="rounded-lg bg-green-500/10 text-green-600 px-4 py-2.5 text-xs mb-4 text-center">
                    {resendSuccess}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleOTPSubmit}>
                  <div className="flex justify-center my-4">
                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      disabled={submitting}
                      error={!!error}
                      onComplete={(val) => {
                        // Auto-submit for signin only (signup may need phone field)
                        if (!submitting && mode === "signin") {
                          setOtp(val);
                          handleOTPSubmit({ preventDefault: () => {} } as FormEvent);
                        }
                      }}
                    />
                  </div>

                  {mode === "signup" && (
                    <div className="mb-2">
                      <label className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Phone number (optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-[var(--fg)] focus:border-[var(--fg)] text-[13px] bg-transparent text-[var(--fg)] transition-all"
                        autoComplete="tel"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || otp.length < 6}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-[13px] font-semibold text-[var(--bg)] bg-[var(--fg)] hover:opacity-90 active:scale-[0.99] focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Verifying…" : "Verify & Complete"}
                  </button>

                  <a
                    href="https://mail.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm text-[13px] font-semibold text-[var(--fg)] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer text-center bg-transparent mt-2"
                  >
                    <svg className="w-4 h-4 text-[#EA4335]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    Open Gmail
                  </a>
                </form>

                <div className="flex flex-col items-center gap-3 text-[13px] mt-6 border-t border-gray-200 dark:border-zinc-800 pt-5">
                  <p className="text-[var(--muted)] text-center">
                    Didn&apos;t get the code?{" "}
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
                      setStep("form");
                      setError("");
                      setResendSuccess("");
                      setOtp("");
                    }}
                    className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer bg-transparent border-none"
                  >
                    ← Back
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
