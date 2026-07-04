"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { mutate } from "swr";
import api from "@/lib/api";
import { useNotifications } from "@/lib/hooks";
import type { Notification } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  CHAT_MESSAGE: "Message",
  CHAT_REPLY: "Reply",
  NEW_BOOKING: "Booking",
  BOOKING_CONFIRMED: "Booking",
  SESSION_REMINDER: "Reminder",
  MENTOR_APPROVED: "Mentor",
  MENTOR_REJECTED: "Mentor",
  SECURITY_ALERT: "Security",
  ACCOUNT_UPDATE: "Account",
  PLATFORM_ANNOUNCEMENT: "Update",
};

function formatTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return date.toLocaleDateString();
}

interface NotificationBellProps {
  notificationsPath?: string;
}

export function NotificationBell({ notificationsPath = "/dashboard/notifications" }: NotificationBellProps) {
  const { data, isLoading } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = data?.unreadCount || 0;
  const preview = data?.notifications?.slice(0, 5) || [];

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllRead();
    }
  }, [open, unreadCount]);

  async function markRead(id: string) {
    await api.put(`/users/me/notifications/${id}/read`);
    mutate("/users/me/notifications");
  }

  async function markAllRead() {
    await api.put("/users/me/notifications/read-all");
    mutate("/users/me/notifications");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-(--hairline) bg-(--fg)/5 text-(--fg) transition hover:bg-(--fg)/10"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed md:absolute top-[76px] md:top-auto left-4 right-4 md:left-0 md:right-auto md:w-[360px] w-auto z-50 mt-2 overflow-hidden rounded-2xl border border-(--hairline) bg-(--bg) shadow-2xl">
          <div className="flex items-center justify-between border-b border-(--hairline) px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-(--muted)">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-(--muted) hover:text-(--fg)"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && <p className="px-4 py-6 text-sm text-(--muted)">Loading...</p>}
            {!isLoading && preview.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-(--muted)">You&apos;re all caught up.</p>
            )}
            {preview.map((notification) => (
              <NotificationPreviewRow
                key={notification.id}
                notification={notification}
                onRead={() => markRead(notification.id)}
              />
            ))}
          </div>

          <div className="border-t border-(--hairline) px-4 py-3">
            <Link
              href={notificationsPath}
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-(--fg) hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationPreviewRow({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRead}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-(--fg)/5 ${
        notification.isRead ? "opacity-70" : "bg-(--fg)/[0.02]"
      }`}
    >
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-(--accent)" style={{ opacity: notification.isRead ? 0 : 1 }} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{notification.title}</span>
          <span className="rounded-full bg-(--fg)/8 px-2 py-0.5 text-[10px] uppercase tracking-wide text-(--muted)">
            {TYPE_LABELS[notification.type] || notification.type}
          </span>
        </span>
        <span className="mt-1 block truncate text-xs text-(--muted)">{notification.body}</span>
        <span className="mt-1 block text-[11px] text-(--muted)">{formatTime(notification.createdAt)}</span>
      </span>
    </button>
  );
}

export { TYPE_LABELS, formatTime };
