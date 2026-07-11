"use client";

import { useMemo, useState } from "react";
import { Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { mutate } from "swr";
import useSWR from "swr";
import api from "@/lib/api";
import { TYPE_LABELS, formatTime } from "@/components/NotificationBell";
import type { Notification } from "@/lib/types";

async function fetcher<T>(url: string): Promise<T> {
  const { data } = await api.get<T>(url);
  return data;
}

export default function NotificationsPage({ basePath = "/dashboard" }: { basePath?: string }) {
  const [typeFilter, setTypeFilter] = useState("");
  const key = `/users/me/notifications${typeFilter ? `?type=${typeFilter}` : ""}`;
  const { data, isLoading } = useSWR<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
  }>(key, fetcher, { refreshInterval: 30_000 });

  const types = useMemo(() => {
    const set = new Set((data?.notifications || []).map((item) => item.type));
    return Array.from(set).sort();
  }, [data?.notifications]);

  async function markRead(id: string) {
    await api.put(`/users/me/notifications/${id}/read`);
    mutate(key);
    mutate("/users/me/notifications");
  }

  async function markAllRead() {
    await api.put("/users/me/notifications/read-all");
    mutate(key);
    mutate("/users/me/notifications");
  }

  async function deleteNotification(id: string) {
    await api.delete(`/users/me/notifications/${id}`);
    mutate(key);
    mutate("/users/me/notifications");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-(--muted)">Inbox</span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-2 text-sm text-(--muted)">
            {data?.unreadCount || 0} unread · {data?.total || 0} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-(--hairline) bg-(--fg)/5 px-3 py-2">
            <Filter className="h-4 w-4 text-(--muted)" />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="">All types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>
          {(data?.unreadCount || 0) > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-xl border border-(--hairline) px-4 py-2 text-sm font-medium hover:bg-(--fg)/5"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-(--hairline) bg-(--fg)/[0.02]">
        {isLoading && <p className="px-6 py-10 text-sm text-(--muted)">Loading notifications...</p>}
        {!isLoading && (data?.notifications?.length || 0) === 0 && (
          <p className="px-6 py-16 text-center text-sm text-(--muted)">No notifications yet.</p>
        )}
        <div className="divide-y divide-(--hairline)">
          {data?.notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 px-5 py-4 sm:px-6 ${notification.isRead ? "" : "bg-(--fg)/[0.03]"}`}
            >
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-(--accent)" style={{ opacity: notification.isRead ? 0.15 : 1 }} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">{notification.title}</h2>
                  <span className="rounded-full bg-(--fg)/8 px-2 py-0.5 text-[10px] uppercase tracking-wide text-(--muted)">
                    {TYPE_LABELS[notification.type] || notification.type}
                  </span>
                  {notification.emailSent && (
                    <span className="text-[10px] text-(--muted)">Email sent</span>
                  )}
                  {notification.pushSent && (
                    <span className="text-[10px] text-(--muted)">Push sent</span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6 text-(--muted)">{notification.body}</p>
                <p className="mt-2 text-xs text-(--muted)">{formatTime(notification.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="rounded-lg p-2 text-(--muted) hover:bg-(--fg)/5 hover:text-(--fg)"
                    aria-label="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(notification.id)}
                  className="rounded-lg p-2 text-(--muted) hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
