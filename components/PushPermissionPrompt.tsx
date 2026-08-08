"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { requestPushPermissionAndRegister, useNotificationPermission } from "@/lib/push";

export function PushPermissionPrompt() {
  const { user, loading } = useAuth();
  const { permission, isSupported, refreshPermission } = useNotificationPermission();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("helpmeman.accessToken") : null;
    if (loading || !user || token?.startsWith("demo_") || !isSupported) return;
    if (permission === "granted") {
      setVisible(false);
      return;
    }

    const dismissed = localStorage.getItem("helpmeman.pushPromptDismissed");
    const alreadyAsked = localStorage.getItem("helpmeman.pushPromptAsked");
    if (dismissed || alreadyAsked) return;

    const timer = window.setTimeout(() => setVisible(true), 1500);
    return () => window.clearTimeout(timer);
  }, [user, loading, isSupported, permission]);

  async function enablePush() {
    setBusy(true);
    try {
      await requestPushPermissionAndRegister();
      refreshPermission();
      localStorage.setItem("helpmeman.pushPromptAsked", "1");
      setVisible(false);
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem("helpmeman.pushPromptDismissed", "1");
    setVisible(false);
  }

  if (!visible || permission === "granted" || !isSupported) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[70] w-[min(92vw,360px)] rounded-2xl p-5 shadow-2xl"
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 48px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-lg p-1 transition-opacity hover:opacity-60"
        style={{ color: "rgba(255,255,255,0.45)" }}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {permission === "denied" ? (
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
          >
            <BellOff className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f4f4f5" }}>
              Notifications blocked
            </p>
            <p className="mt-1 text-xs leading-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Notifications are blocked in your browser. Enable them in site settings to stay
              updated on messages and bookings.
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.1)", color: "#f4f4f5" }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
          >
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#f4f4f5" }}>
              Stay in the loop
            </p>
            <p className="mt-1 text-xs leading-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Enable push notifications for real-time messages, bookings, and important updates.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={enablePush}
                disabled={busy}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-85 disabled:opacity-40 sm:px-4 sm:py-2 sm:text-sm"
                style={{ background: "#f4f4f5", color: "#0a0a0a" }}
              >
                {busy ? "Enabling…" : "Enable notifications"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl px-3 py-1.5 text-xs transition-opacity hover:opacity-60 sm:px-4 sm:py-2 sm:text-sm"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
