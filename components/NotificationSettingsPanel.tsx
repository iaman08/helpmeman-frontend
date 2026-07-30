"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Smartphone, Volume2, AlertCircle } from "lucide-react";
import { mutate } from "swr";
import api from "@/lib/api";
import { useNotificationPreferences } from "@/lib/hooks";
import { useToast } from "@/components/Toast";
import {
  requestPushPermissionAndRegister,
  unregisterPushSubscription,
  useNotificationPermission,
} from "@/lib/push";
import { chatSoundService } from "@/lib/chatSoundService";

type PrefKey =
  | "emailNotifications"
  | "pushNotifications"
  | "marketingEmails"
  | "accountUpdates"
  | "messages"
  | "mentorUpdates"
  | "chatSounds";

const TOGGLES: { key: PrefKey; label: string; description: string }[] = [
  { key: "emailNotifications", label: "Email notifications", description: "Receive transactional emails for important activity." },
  { key: "pushNotifications", label: "Push notifications", description: "Get browser and mobile alerts in real time." },
  { key: "marketingEmails", label: "Marketing emails", description: "Weekly product updates and platform announcements." },
  { key: "accountUpdates", label: "Account updates", description: "Security alerts, profile changes, and booking confirmations." },
  { key: "messages", label: "Messages", description: "New chat messages and mentor replies." },
  { key: "mentorUpdates", label: "Mentor updates", description: "Application status, approvals, and mentor-specific alerts." },
  { key: "chatSounds", label: "Message sounds", description: "Play subtle audio cues for sent and received chat messages." },
];

export function NotificationSettingsPanel() {
  const { data, isLoading } = useNotificationPreferences();
  const { permission, refreshPermission } = useNotificationPermission();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.preferences) {
      const soundPref =
        typeof data.preferences.chatSounds === "boolean"
          ? data.preferences.chatSounds
          : chatSoundService.isEnabled();

      // If browser explicitly denied permission, keep pushNotifications false in UI display
      const pushEnabled =
        permission === "denied" ? false : Boolean(data.preferences.pushNotifications);

      setPrefs({
        emailNotifications: data.preferences.emailNotifications,
        pushNotifications: pushEnabled,
        marketingEmails: data.preferences.marketingEmails,
        accountUpdates: data.preferences.accountUpdates,
        messages: data.preferences.messages,
        mentorUpdates: data.preferences.mentorUpdates,
        chatSounds: soundPref,
      });

      chatSoundService.setEnabled(soundPref);
    }
  }, [data, permission]);

  async function toggle(key: PrefKey) {
    if (!prefs) return;

    if (key === "pushNotifications" && !prefs.pushNotifications && permission === "denied") {
      toast("Notifications are blocked in your browser settings. Please enable them in browser site settings first.", "error");
      return;
    }

    const nextValue = !prefs[key];
    const next = { ...prefs, [key]: nextValue };
    setPrefs(next);
    setSaving(true);

    if (key === "chatSounds") {
      chatSoundService.setEnabled(next.chatSounds);
    }

    try {
      if (key === "pushNotifications") {
        if (nextValue) {
          const result = await requestPushPermissionAndRegister();
          refreshPermission();

          if (!result.granted) {
            next.pushNotifications = false;
            setPrefs({ ...next, pushNotifications: false });
            toast(
              result.reason === "denied"
                ? "Notification permission was denied in browser."
                : "Push permission could not be granted.",
              "info"
            );
            return;
          }
        } else {
          await unregisterPushSubscription();
          refreshPermission();
        }
      }

      await api.put("/users/me/notification-preferences", next);
      mutate("/users/me/notification-preferences");
      mutate((k: any) => Array.isArray(k) && k[0] === "/users/me/notification-preferences");
      toast("Notification preferences updated.", "success");
    } catch {
      toast("Failed to update preferences.", "error");
      mutate("/users/me/notification-preferences");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !prefs) {
    return <p className="text-sm text-(--muted)">Loading notification settings...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-(--fg)/5 border border-(--hairline) rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 md:p-10 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2 sm:p-2.5 bg-(--fg)/10 rounded-xl sm:rounded-2xl">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-(--fg)" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Notification preferences</h3>
            <p className="text-sm text-(--muted) mt-0.5">Control how HelpMeMan reaches you.</p>
          </div>
        </div>

        {permission === "denied" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs sm:text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Browser notifications blocked</p>
              <p className="mt-0.5 text-xs opacity-90">
                You have blocked notifications for this site in your browser settings. To enable push alerts, click the lock/settings icon in your browser address bar and set Notifications to "Allow".
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {TOGGLES.map((item) => {
            const isPush = item.key === "pushNotifications";
            const isBlocked = isPush && permission === "denied";

            return (
              <label
                key={item.key}
                className={`flex items-start justify-between gap-4 rounded-2xl border border-(--hairline) bg-(--bg)/60 px-4 py-4 ${
                  isBlocked ? "opacity-80" : ""
                }`}
              >
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {item.key === "chatSounds" ? (
                      <Volume2 className="h-4 w-4 text-(--muted)" />
                    ) : item.key.includes("email") || item.key === "marketingEmails" ? (
                      <Mail className="h-4 w-4 text-(--muted)" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-(--muted)" />
                    )}
                    {item.label}
                    {isBlocked && (
                      <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-500">
                        Blocked in browser
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-(--muted)">
                    {isBlocked
                      ? "Notifications are blocked by your browser settings."
                      : item.description}
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs[item.key]}
                  disabled={saving}
                  onClick={() => toggle(item.key)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    prefs[item.key] ? "bg-(--accent)" : "bg-(--fg)/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                      prefs[item.key] ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
