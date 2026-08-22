"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, QrCode, Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AxiosError } from "axios";
import OTPInput from "@/components/OTPInput";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "verify" | "setup";
  tempToken?: string;
  onSuccess?: () => void;
}

export default function TwoFactorModal({
  isOpen,
  onClose,
  mode,
  tempToken,
  onSuccess,
}: TwoFactorModalProps) {
  const { verify2FALogin } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Setup state
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setSuccessMsg("");
      if (mode === "setup") {
        fetchSetupData();
      }
    }
  }, [isOpen, mode]);

  async function fetchSetupData() {
    setSetupLoading(true);
    setError("");
    try {
      const { data } = await api.get("/auth/2fa/setup");
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to load 2FA setup details");
      }
    } finally {
      setSetupLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) {
      setError("Please enter the complete 6-digit authenticator code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "verify" && tempToken) {
        const dest = await verify2FALogin(tempToken, code);
        onClose();
        if (dest) window.location.replace(dest);
      } else if (mode === "setup") {
        await api.post("/auth/2fa/enable", { code });
        setSuccessMsg("Google Authenticator 2FA enabled successfully!");
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Verification failed. Please check your code.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white dark:bg-[#121214] border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              {mode === "setup" ? <QrCode size={24} /> : <ShieldCheck size={24} />}
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              {mode === "setup" ? "Setup Google Authenticator" : "Two-Step Verification"}
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-xs">
              {mode === "setup"
                ? "Scan the QR code with your authenticator app to enable 2FA protection."
                : "Enter the 6-digit code from your Google Authenticator app."}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-2.5 text-xs text-center mb-4">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 mb-4">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Setup Mode Details */}
          {mode === "setup" && (
            <div className="flex flex-col items-center mb-6">
              {setupLoading ? (
                <div className="w-44 h-44 rounded-xl bg-stone-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-stone-400">
                  Generating QR Code...
                </div>
              ) : (
                qrCodeUrl && (
                  <div className="p-3 bg-white rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-sm mb-3">
                    <img src={qrCodeUrl} alt="Google Authenticator QR Code" className="w-40 h-40 object-contain" />
                  </div>
                )
              )}

              {secret && (
                <div className="w-full text-center">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
                    Setup Key (Manual Entry):
                  </span>
                  <div className="font-mono text-xs bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 mt-1 select-all text-stone-800 dark:text-zinc-200 font-semibold tracking-wider">
                    {secret}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Code Form */}
          <form onSubmit={handleVerifySubmit} className="flex flex-col items-center space-y-5">
            <div className="w-full flex justify-center">
              <OTPInput
                value={code}
                onChange={setCode}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>{mode === "setup" ? "Enable 2FA Protection" : "Verify & Continue"}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
