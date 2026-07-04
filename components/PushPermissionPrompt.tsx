"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { requestPushPermissionAndRegister } from "@/lib/fcm";

export function PushPermissionPrompt() {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user || user.id.startsWith("demo_")) return;
    const dismissed = localStorage.getItem("helpmeman.pushPromptDismissed");
    const alreadyAsked = localStorage.getItem("helpmeman.pushPromptAsked");
    if (dismissed || alreadyAsked) return;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") return;
    const timer = window.setTimeout(() => setVisible(true), 1500);
    return () => window.clearTimeout(timer);
  }, [user, loading]);

  async function enablePush() {
    setBusy(true);
    try {
      await requestPushPermissionAndRegister();
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

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[70] w-[min(92vw,380px)] rounded-2xl border border-(--hairline) bg-(--bg) p-5 shadow-2xl">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-lg p-1 text-(--muted) hover:text-(--fg)"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg)">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Stay in the loop</p>
          <p className="mt-1 text-sm leading-6 text-(--muted)">
            Enable push notifications for messages, bookings, and important account updates.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={enablePush}
              disabled={busy}
              className="rounded-xl bg-(--fg) px-4 py-2 text-sm font-semibold text-(--bg) disabled:opacity-50"
            >
              {busy ? "Enabling..." : "Enable notifications"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl px-4 py-2 text-sm text-(--muted) hover:text-(--fg)"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
