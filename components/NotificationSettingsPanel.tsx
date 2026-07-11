"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";
import { mutate } from "swr";
import api from "@/lib/api";
import { useNotificationPreferences } from "@/lib/hooks";
import { useToast } from "@/components/Toast";
import { requestPushPermissionAndRegister } from "@/lib/fcm";

type PrefKey =
  | "emailNotifications"
  | "pushNotifications"
  | "marketingEmails"
  | "accountUpdates"
  | "messages"
  | "mentorUpdates";

const TOGGLES: { key: PrefKey; label: string; description: string }[] = [
  { key: "emailNotifications", label: "Email notifications", description: "Receive transactional emails for important activity." },
  { key: "pushNotifications", label: "Push notifications", description: "Get browser and mobile alerts in real time." },
  { key: "marketingEmails", label: "Marketing emails", description: "Weekly product updates and platform announcements." },
  { key: "accountUpdates", label: "Account updates", description: "Security alerts, profile changes, and booking confirmations." },
  { key: "messages", label: "Messages", description: "New chat messages and mentor replies." },
  { key: "mentorUpdates", label: "Mentor updates", description: "Application status, approvals, and mentor-specific alerts." },
];

export function NotificationSettingsPanel() {
  const { data, isLoading } = useNotificationPreferences();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.preferences) {
      setPrefs({
        emailNotifications: data.preferences.emailNotifications,
        pushNotifications: data.preferences.pushNotifications,
        marketingEmails: data.preferences.marketingEmails,
        accountUpdates: data.preferences.accountUpdates,
        messages: data.preferences.messages,
        mentorUpdates: data.preferences.mentorUpdates,
      });
    }
  }, [data]);

  async function toggle(key: PrefKey) {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    try {
      if (key === "pushNotifications" && next.pushNotifications) {
        const result = await requestPushPermissionAndRegister();
        if (!result.granted) {
          next.pushNotifications = false;
          setPrefs({ ...next, pushNotifications: false });
          toast("Push permission was not granted.", "info");
        }
      }
      await api.put("/users/me/notification-preferences", next);
      mutate("/users/me/notification-preferences");
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

        <div className="space-y-4">
          {TOGGLES.map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-(--hairline) bg-(--bg)/60 px-4 py-4"
            >
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {item.key.includes("email") || item.key === "marketingEmails" ? (
                    <Mail className="h-4 w-4 text-(--muted)" />
                  ) : (
                    <Smartphone className="h-4 w-4 text-(--muted)" />
                  )}
                  {item.label}
                </span>
                <span className="mt-1 block text-sm text-(--muted)">{item.description}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[item.key]}
                disabled={saving}
                onClick={() => toggle(item.key)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${prefs[item.key] ? "bg-(--accent)" : "bg-(--fg)/15"}`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${prefs[item.key] ? "left-5" : "left-0.5"}`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
