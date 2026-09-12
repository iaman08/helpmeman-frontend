"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ShieldCheck,
  QrCode,
  Lock,
  CheckCircle2,
  Fingerprint,
  Smartphone,
  KeyRound,
  Laptop,
  Usb,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmModal";
import OTPInput from "@/components/OTPInput";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";

export interface PasskeyItem {
  id: string;
  nickname: string;
  deviceType?: string;
  backedUp: boolean;
  transports: string[];
  lastUsedAt?: string | null;
  createdAt: string;
}

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "verify" | "setup";
  tempToken?: string;
  isMandatory?: boolean;
  onSuccess?: () => void;
}

export default function TwoFactorModal({
  isOpen,
  onClose,
  mode,
  tempToken,
  isMandatory = false,
  onSuccess,
}: TwoFactorModalProps) {
  const { verify2FALogin, verifyPasskeyLogin, updateUser } = useAuth();
  const confirm = useConfirm();

  // Active authentication method: 'passkey' | 'totp'
  const [method, setMethod] = useState<"passkey" | "totp">("passkey");
  const [webAuthnSupported, setWebAuthnSupported] = useState(true);

  // Passkey credentials list state
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(false);
  const [hasAuthenticatorApp, setHasAuthenticatorApp] = useState(false);
  const [twoFactorActive, setTwoFactorActive] = useState(false);
  const [showAddKeyForm, setShowAddKeyForm] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(null);

  // Passkey registration / auth state
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyNickname, setPasskeyNickname] = useState("");
  const [passkeySuccess, setPasskeySuccess] = useState("");

  // TOTP state
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // TOTP Setup state
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  // Check browser WebAuthn support
  useEffect(() => {
    const supported = browserSupportsWebAuthn();
    setWebAuthnSupported(supported);
    if (!supported) {
      setMethod("totp");
    }
  }, []);

  const loadCredentials = useCallback(async () => {
    try {
      setLoadingPasskeys(true);
      const authHeader = tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined;
      const { data } = await api.get<{
        passkeys: PasskeyItem[];
        hasAuthenticatorApp: boolean;
        twoFactorEnabled: boolean;
      }>("/auth/webauthn/credentials", { headers: authHeader });
      setPasskeys(data.passkeys || []);
      setHasAuthenticatorApp(Boolean(data.hasAuthenticatorApp));
      setTwoFactorActive(Boolean(data.twoFactorEnabled));
    } catch (err) {
      console.warn("[2FA] Could not load passkey credentials:", err);
    } finally {
      setLoadingPasskeys(false);
    }
  }, [tempToken]);

  // Reset state and load credentials when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setSuccessMsg("");
      setPasskeySuccess("");
      setShowAddKeyForm(false);
      setPasskeyNickname(
        typeof navigator !== "undefined" && navigator.platform?.includes("Mac")
          ? "MacBook Touch ID"
          : "My Security Key"
      );
      loadCredentials();
      if (mode === "setup") {
        fetchSetupData();
      }
    }
  }, [isOpen, mode, loadCredentials]);

  async function fetchSetupData() {
    setSetupLoading(true);
    setError("");
    try {
      const authHeader = tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined;
      const { data } = await api.get("/auth/2fa/setup", { headers: authHeader });
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (err: any) {
      const errorData = err?.response?.data?.error;
      const errorMsg =
        typeof errorData === "string"
          ? errorData
          : errorData?.message ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load 2FA setup details";
      setError(errorMsg);
    } finally {
      setSetupLoading(false);
    }
  }

  /* ─── Passkey Authentication (Verify) ─── */
  async function handlePasskeyVerify() {
    if (!tempToken) {
      setError("Login session expired. Please sign in again.");
      return;
    }

    setPasskeyLoading(true);
    setError("");

    try {
      // 1. Fetch authentication challenge from backend
      const { data: options } = await api.post("/auth/webauthn/login-options", { tempToken });

      // 2. Trigger browser's native FIDO2 dialog (Touch ID / Face ID / YubiKey)
      const assertionResponse = await startAuthentication({ optionsJSON: options });

      // 3. Verify assertion with backend and complete login
      const dest = await verifyPasskeyLogin(tempToken, assertionResponse);
      setPasskeySuccess("Security key verified!");
      onClose();
      if (dest) window.location.replace(dest);
    } catch (err: any) {
      console.error("[WEBAUTHN LOGIN ERROR]", err);
      if (err?.name === "NotAllowedError" || err?.message?.includes("cancelled")) {
        setError("Security key verification was cancelled. Click below to retry or switch to Authenticator code.");
      } else if (err?.response?.status === 404) {
        setError("Passkey verification is not deployed on this server yet. Please use your 6-digit Authenticator code.");
      } else {
        const errorData = err?.response?.data?.error;
        const msg =
          typeof errorData === "string"
            ? errorData
            : errorData?.message ||
              err?.response?.data?.message ||
              err?.message ||
              "Passkey verification failed. Please try again or use your 6-digit Authenticator code.";
        setError(msg);
      }
    } finally {
      setPasskeyLoading(false);
    }
  }

  /* ─── Passkey Registration (Setup) ─── */
  async function handlePasskeySetup(e: React.FormEvent) {
    e.preventDefault();
    setPasskeyLoading(true);
    setError("");
    setPasskeySuccess("");

    try {
      const authHeader = tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined;

      // 1. Get registration options from backend
      const { data: options } = await api.get("/auth/webauthn/register-options", { headers: authHeader });

      // 2. Prompt user via browser WebAuthn API
      const registrationResponse = await startRegistration({ optionsJSON: options });

      // 3. Verify and store on backend
      const nickname = passkeyNickname.trim() || "Security Key";
      const { data } = await api.post(
        "/auth/webauthn/register-verify",
        {
          response: registrationResponse,
          nickname,
        },
        { headers: authHeader }
      );

      updateUser({ twoFactorEnabled: true });
      setPasskeySuccess(data.message || `Security key "${nickname}" registered successfully!`);
      setShowAddKeyForm(false);
      setPasskeyNickname("");
      await loadCredentials();

      if (onSuccess) onSuccess();

      if (isMandatory) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("[WEBAUTHN REG ERROR]", err);
      if (err?.name === "NotAllowedError" || err?.message?.includes("cancelled")) {
        setError("Security key registration was cancelled. Click Register to try again.");
      } else if (err?.response?.status === 404) {
        setError(
          "Passkeys & Hardware Security Keys are not deployed on this server yet. Please switch to the Authenticator App tab to enable 2FA using Google Authenticator."
        );
      } else {
        const errorData = err?.response?.data?.error;
        const msg =
          typeof errorData === "string"
            ? errorData
            : errorData?.message ||
              err?.response?.data?.message ||
              err?.message ||
              "Failed to register security key. Please try again or configure Google Authenticator.";
        setError(msg);
      }
    } finally {
      setPasskeyLoading(false);
    }
  }

  /* ─── Delete / Revoke Passkey ─── */
  async function handleDeletePasskey(id: string, name: string) {
    const isConfirmed = await confirm({
      title: "Remove Security Key?",
      message: `Are you sure you want to remove "${name}"? You will not be able to use it to sign in.`,
      confirmText: "Remove Key",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!isConfirmed) return;

    setDeletingPasskeyId(id);
    setError("");
    setPasskeySuccess("");
    try {
      const authHeader = tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined;
      await api.delete(`/auth/webauthn/credentials/${id}`, { headers: authHeader });
      setPasskeySuccess(`Security key "${name}" removed.`);
      await loadCredentials();
      updateUser({ twoFactorEnabled: passkeys.length > 1 || hasAuthenticatorApp });
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("Security key not found or already removed.");
      } else {
        setError(err?.response?.data?.error || "Failed to remove security key.");
      }
    } finally {
      setDeletingPasskeyId(null);
    }
  }

  /* ─── TOTP Verification (Verify / Setup) ─── */
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
        const authHeader = tempToken ? { Authorization: `Bearer ${tempToken}` } : undefined;
        await api.post("/auth/2fa/enable", { code }, { headers: authHeader });
        updateUser({ twoFactorEnabled: true });
        setSuccessMsg("Google Authenticator 2FA enabled successfully!");
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      }
    } catch (err: any) {
      const errorData = err?.response?.data?.error;
      const errorMsg =
        typeof errorData === "string"
          ? errorData
          : errorData?.message ||
            err?.response?.data?.message ||
            err?.message ||
            "Verification failed. Please check your code.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const getDeviceIcon = (transports: string[] = []) => {
    if (transports.includes("internal")) {
      return <Laptop className="w-4 h-4 text-indigo-500" />;
    }
    if (transports.includes("usb") || transports.includes("nfc")) {
      return <Usb className="w-4 h-4 text-amber-500" />;
    }
    return <KeyRound className="w-4 h-4 text-blue-500" />;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isMandatory ? undefined : onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-[#121214] border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col z-10"
        >
          {/* Close button (hidden if mandatory setup) */}
          {!isMandatory && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              {mode === "setup" ? (
                method === "passkey" ? <KeyRound size={24} /> : <QrCode size={24} />
              ) : (
                method === "passkey" ? <Fingerprint size={26} /> : <ShieldCheck size={24} />
              )}
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              {mode === "setup"
                ? isMandatory
                  ? "Mandatory 2FA Setup"
                  : "Two-Factor Protection"
                : "Two-Step Verification"}
            </h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed">
              {mode === "setup"
                ? isMandatory
                  ? "Security Policy: 2FA is required for all Administrator accounts before continuing."
                  : "Protect your account with linked hardware security keys, passkeys, or an authenticator app."
                : method === "passkey"
                  ? "Verify your identity using your security key, Touch ID, Face ID, or Windows Hello."
                  : "Enter the 6-digit verification code from your Google Authenticator app."}
            </p>
          </div>

          {/* Method Selector Tabs */}
          {webAuthnSupported && (
            <div className="flex rounded-xl p-1 bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMethod("passkey");
                  setError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  method === "passkey"
                    ? "bg-white dark:bg-zinc-800 text-stone-900 dark:text-white shadow-sm"
                    : "text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200"
                }`}
              >
                <Fingerprint size={15} />
                <span>Security Key / Passkey</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("totp");
                  setError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  method === "totp"
                    ? "bg-white dark:bg-zinc-800 text-stone-900 dark:text-white shadow-sm"
                    : "text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200"
                }`}
              >
                <Smartphone size={15} />
                <span>Authenticator App</span>
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 text-xs flex flex-col items-center gap-2 mb-4 text-center">
              <span>{error}</span>
              {method === "passkey" && (
                <button
                  type="button"
                  onClick={() => {
                    setMethod("totp");
                    setError("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 font-semibold transition-colors cursor-pointer text-[11px]"
                >
                  Switch to Authenticator App
                </button>
              )}
            </div>
          )}

          {(successMsg || passkeySuccess) && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 mb-4">
              <CheckCircle2 size={16} />
              <span>{successMsg || passkeySuccess}</span>
            </div>
          )}

          {/* ══════════════ METHOD: PASSKEY / SECURITY KEY ══════════════ */}
          {method === "passkey" && (
            <>
              {mode === "verify" ? (
                <div className="flex flex-col items-center space-y-4 py-1">
                  <button
                    type="button"
                    disabled={passkeyLoading}
                    onClick={handlePasskeyVerify}
                    className="w-full group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-all cursor-pointer select-none"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-3">
                      <Fingerprint size={32} className={passkeyLoading ? "animate-pulse" : ""} />
                    </div>
                    <span className="font-semibold text-stone-900 dark:text-white text-sm">
                      {passkeyLoading ? "Waiting for Biometric / Security Key…" : "Verify with Security Key or Passkey"}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1 text-center max-w-xs leading-relaxed">
                      Touch ID, Face ID, Windows Hello, or USB Security Key (YubiKey)
                    </span>
                  </button>

                  {/* Registered keys list in verify mode */}
                  {passkeys.length > 0 && (
                    <div className="w-full pt-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500 block mb-2 text-center">
                        Linked Keys on this Account ({passkeys.length})
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {passkeys.map((k) => (
                          <div
                            key={k.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700"
                          >
                            {getDeviceIcon(k.transports)}
                            <span className="font-medium text-[11px]">{k.nickname}</span>
                            {k.backedUp && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-semibold">
                                Synced
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMethod("totp");
                      setError("");
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer bg-transparent border-none pt-1"
                  >
                    Use 6-digit Authenticator code instead
                  </button>
                </div>
              ) : (
                /* Passkey Setup / Management */
                <div className="flex flex-col space-y-4">
                  {/* Linked Keys Section Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 dark:text-zinc-400">
                      Linked Keys & Passkeys ({passkeys.length})
                    </span>
                    {!showAddKeyForm && passkeys.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddKeyForm(true);
                          setPasskeyNickname(
                            typeof navigator !== "undefined" && navigator.platform?.includes("Mac")
                              ? "MacBook Touch ID"
                              : "Security Key"
                          );
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Add Another Key</span>
                      </button>
                    )}
                  </div>

                  {/* List of Registered Keys */}
                  {loadingPasskeys ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-stone-400 dark:text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading linked security keys…</span>
                    </div>
                  ) : passkeys.length === 0 ? (
                    <div className="p-4 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 border border-dashed border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/30">
                      <KeyRound className="w-5 h-5 text-stone-400" />
                      <p className="text-xs font-medium text-stone-700 dark:text-zinc-300">
                        No security keys or passkeys linked yet.
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                        Register a hardware key (YubiKey) or your device&apos;s biometric sensor (Touch ID, Windows Hello) below.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 dark:divide-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-900/40 overflow-hidden max-h-56 overflow-y-auto">
                      {passkeys.map((key) => (
                        <div
                          key={key.id}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-stone-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              {getDeviceIcon(key.transports)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                                  {key.nickname}
                                </span>
                                {key.backedUp && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">
                                    Synced
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-400 dark:text-zinc-500 truncate">
                                Added {new Date(key.createdAt).toLocaleDateString()}
                                {key.lastUsedAt && ` • Used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={deletingPasskeyId === key.id}
                            onClick={() => handleDeletePasskey(key.id, key.nickname)}
                            title="Remove this security key"
                            className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            {deletingPasskeyId === key.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Key Form (Always visible if no keys, or toggled on when keys exist) */}
                  {(passkeys.length === 0 || showAddKeyForm) && (
                    <form onSubmit={handlePasskeySetup} className="flex flex-col space-y-3 pt-1">
                      {passkeys.length > 0 && (
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
                            Register New Security Key
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAddKeyForm(false)}
                            className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1.5">
                          Key Nickname
                        </label>
                        <input
                          type="text"
                          required
                          value={passkeyNickname}
                          onChange={(e) => setPasskeyNickname(e.target.value)}
                          placeholder="e.g. MacBook Touch ID, Work YubiKey"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-transparent text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={passkeyLoading || !passkeyNickname.trim()}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {passkeyLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Waiting for Device Confirmation…</span>
                          </>
                        ) : (
                          <>
                            <Fingerprint size={15} />
                            <span>Register Security Key / Passkey</span>
                          </>
                        )}
                      </button>

                      <p className="text-[10px] text-stone-500 dark:text-zinc-400 text-center leading-relaxed">
                        Your browser will prompt you to complete biometric verification (Touch ID, Windows Hello) or insert and tap your hardware key.
                      </p>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* ══════════════ METHOD: TOTP AUTHENTICATOR APP ══════════════ */}
          {method === "totp" && (
            <>
              {mode === "setup" && (
                <div className="flex flex-col items-center mb-5">
                  {hasAuthenticatorApp && (
                    <div className="w-full rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-xs flex items-center justify-center gap-2 mb-3">
                      <CheckCircle2 size={15} className="shrink-0" />
                      <span>Google Authenticator is configured on your account.</span>
                    </div>
                  )}

                  {setupLoading ? (
                    <div className="w-44 h-44 rounded-xl bg-stone-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-stone-400">
                      Generating QR Code…
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

              {/* Code Verification Form */}
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
                    <span>Verifying…</span>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>{mode === "setup" ? "Enable 2FA Protection" : "Verify & Continue"}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

