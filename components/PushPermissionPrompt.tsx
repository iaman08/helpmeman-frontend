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
      const res = await requestPushPermissionAndRegister();
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
    <div className="fixed bottom-5 right-5 z-[70] w-[min(92vw,380px)] rounded-2xl border border-[var()] bg-[var()] p-5 shadow-2xl backdrop-blur-xl">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-lg p-1 text-[var()] hover:text-[var()] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      {permission === "denied" ? (
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <BellOff className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Notifications blocked</p>
            <p className="mt-1 text-xs leading-5 text-[var()]">
              Notifications are blocked in your browser site settings. Enable notifications in your browser controls to stay updated on messages and bookings.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl bg-[var()] px-3 py-1.5 text-xs font-semibold text-[var()]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var()]/10 text-[var()]">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Stay in the loop</p>
            <p className="mt-1 text-xs leading-5 text-[var()]">
              Enable push notifications for real-time messages, bookings, and important updates.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={enablePush}
                disabled={busy}
                className="rounded-xl bg-[var()] px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-[var()] disabled:opacity-50 transition-opacity"
              >
                {busy ? "Enabling..." : "Enable notifications"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-xl px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm text-[var()] hover:text-[var()] transition-colors"
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
