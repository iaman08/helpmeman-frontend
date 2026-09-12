"use client";

import { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Fingerprint,
  Smartphone,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Laptop,
  Usb,
} from "lucide-react";
import api from "@/lib/api";
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useConfirm } from "@/components/ConfirmModal";

interface PasskeyItem {
  id: string;
  nickname: string;
  deviceType?: string;
  backedUp: boolean;
  transports: string[];
  lastUsedAt?: string | null;
  createdAt: string;
}

interface CredentialsResponse {
  passkeys: PasskeyItem[];
  hasAuthenticatorApp: boolean;
  twoFactorEnabled: boolean;
}

export default function PasskeyManagerCard() {
  const confirm = useConfirm();
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [hasAuthenticatorApp, setHasAuthenticatorApp] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyNickname, setNewKeyNickname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<CredentialsResponse>("/auth/webauthn/credentials");
      setPasskeys(data.passkeys || []);
      setHasAuthenticatorApp(data.hasAuthenticatorApp);
      setTwoFactorEnabled(data.twoFactorEnabled);
    } catch (err: any) {
      console.error("[PASSKEY] Failed to load credentials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const handleRegisterNewPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!browserSupportsWebAuthn()) {
      setError("WebAuthn / Passkeys are not supported by this browser.");
      return;
    }

    setRegistering(true);
    setError("");
    setSuccess("");

    try {
      const { data: options } = await api.get("/auth/webauthn/register-options");
      const response = await startRegistration({ optionsJSON: options });

      const nickname = newKeyNickname.trim() || "Security Key";
      await api.post("/auth/webauthn/register-verify", { response, nickname });

      setSuccess(`Security key "${nickname}" registered successfully!`);
      setShowAddModal(false);
      setNewKeyNickname("");
      await loadCredentials();
    } catch (err: any) {
      console.error("[PASSKEY REG ERROR]", err);
      if (err?.name === "NotAllowedError" || err?.message?.includes("cancelled")) {
        setError("Registration cancelled on your device.");
      } else if (err?.response?.status === 404) {
        setError("Passkey / Hardware Security Key service is not deployed on this server yet. Please update the backend server.");
      } else {
        const errorData = err?.response?.data?.error;
        const msg =
          typeof errorData === "string"
            ? errorData
            : errorData?.message ||
              err?.response?.data?.message ||
              err?.message ||
              "Failed to register security key.";
        setError(msg);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDeletePasskey = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: "Remove Passkey?",
      message: `Are you sure you want to remove "${name}"? You will not be able to use it to sign in.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!isConfirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    try {
      await api.delete(`/auth/webauthn/credentials/${id}`);
      setSuccess(`Security key "${name}" removed.`);
      await loadCredentials();
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("Passkey service is not deployed on this server yet.");
      } else {
        setError(err?.response?.data?.error || "Failed to delete security key.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getDeviceIcon = (transports: string[] = []) => {
    if (transports.includes("internal")) {
      return <Laptop className="w-4 h-4 text-indigo-500" />;
    }
    if (transports.includes("usb") || transports.includes("nfc")) {
      return <Usb className="w-4 h-4 text-amber-500" />;
    }
    return <KeyRound className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-6"
      style={{
        border: "1px solid var(--hairline)",
        background: "color-mix(in srgb, var(--fg) 2%, transparent)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl" style={{ color: "var(--fg)" }}>
              Hardware Security Keys & Passkeys
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              FIDO2 / WebAuthn passwordless & 2FA protection for Administrator accounts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setError("");
            setSuccess("");
            setNewKeyNickname(
              typeof navigator !== "undefined" && navigator.platform?.includes("Mac")
                ? "MacBook Touch ID"
                : "Security Key"
            );
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Security Key</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 2FA Status summary badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className="p-3.5 rounded-xl flex items-center gap-3"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 3%, transparent)",
          }}
        >
          <ShieldCheck className={`w-5 h-5 ${twoFactorEnabled ? "text-emerald-500" : "text-amber-500"}`} />
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
              Account 2FA Status
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--fg)" }}>
              {twoFactorEnabled ? "Protected (2FA Active)" : "2FA Not Configured"}
            </span>
          </div>
        </div>

        <div
          className="p-3.5 rounded-xl flex items-center gap-3"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 3%, transparent)",
          }}
        >
          <Smartphone className={`w-5 h-5 ${hasAuthenticatorApp ? "text-emerald-500" : "text-stone-400"}`} />
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
              Authenticator App (TOTP)
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--fg)" }}>
              {hasAuthenticatorApp ? "Enabled (Google Authenticator)" : "Not Configured"}
            </span>
          </div>
        </div>
      </div>

      {/* Registered Passkeys List */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Registered Keys ({passkeys.length})
        </span>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Loading security keys…</span>
          </div>
        ) : passkeys.length === 0 ? (
          <div
            className="p-6 rounded-xl text-center flex flex-col items-center justify-center gap-2 border border-dashed"
            style={{ borderColor: "var(--hairline)" }}
          >
            <KeyRound className="w-6 h-6 text-stone-400" />
            <p className="text-xs font-medium" style={{ color: "var(--fg)" }}>
              No security keys or passkeys registered yet.
            </p>
            <p className="text-[11px] max-w-sm" style={{ color: "var(--muted)" }}>
              Add a hardware key (YubiKey) or your device&apos;s biometric sensor (Touch ID, Windows Hello) for instant, secure sign-in.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--hairline)] rounded-xl border border-[var(--hairline)] overflow-hidden">
            {passkeys.map((key) => (
              <div
                key={key.id}
                className="p-4 flex items-center justify-between gap-4 transition-colors hover:bg-[var(--fg)]/[0.02]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    {getDeviceIcon(key.transports)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>
                        {key.nickname}
                      </span>
                      {key.backedUp && (
                        <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">
                          Synced
                        </span>
                      )}
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                      Added on {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={deletingId === key.id}
                  onClick={() => handleDeletePasskey(key.id, key.nickname)}
                  title="Remove this security key"
                  className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingId === key.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Key Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border"
            style={{
              background: "var(--bg)",
              borderColor: "var(--hairline)",
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--hairline)]">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base" style={{ color: "var(--fg)" }}>
                  Register Security Key / Passkey
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-[var(--fg)] p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterNewPasskey} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--fg)" }}>
                  Key Nickname
                </label>
                <input
                  type="text"
                  required
                  value={newKeyNickname}
                  onChange={(e) => setNewKeyNickname(e.target.value)}
                  placeholder="e.g. MacBook Touch ID, YubiKey 5C"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ color: "var(--fg)" }}
                />
              </div>

              <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>
                When you click Register, your browser will prompt you to complete biometric verification (Touch ID, Windows Hello) or insert and tap your hardware key.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={registering}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[var(--fg)]/5 transition-colors cursor-pointer"
                  style={{ color: "var(--muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering || !newKeyNickname.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Waiting for Device…</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Register Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
