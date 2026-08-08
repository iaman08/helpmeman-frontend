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
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
            Inbox
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Notifications
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            {data?.unreadCount || 0} unread · {data?.total || 0} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 4%, transparent)",
            }}
          >
            <Filter className="h-4 w-4" style={{ color: "var(--muted)" }} />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="bg-transparent text-sm outline-none cursor-pointer"
              style={{ color: "var(--fg)" }}
            >
              <option value="" style={{ background: "var(--bg)", color: "var(--fg)" }}>
                All types
              </option>
              {types.map((type) => (
                <option key={type} value={type} style={{ background: "var(--bg)", color: "var(--fg)" }}>
                  {TYPE_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>
          {(data?.unreadCount || 0) > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 cursor-pointer"
              style={{
                border: "1px solid var(--hairline)",
                color: "var(--fg)",
                background: "color-mix(in srgb, var(--fg) 3%, transparent)",
              }}
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-hidden rounded-3xl"
        style={{
          border: "1px solid var(--hairline)",
          background: "color-mix(in srgb, var(--fg) 1%, transparent)",
        }}
      >
        {isLoading && (
          <p className="px-6 py-10 text-sm" style={{ color: "var(--muted)" }}>
            Loading notifications...
          </p>
        )}
        {!isLoading && (data?.notifications?.length || 0) === 0 && (
          <p className="px-6 py-16 text-center text-sm" style={{ color: "var(--muted)" }}>
            No notifications yet.
          </p>
        )}
        <div>
          {data?.notifications?.map((notification, idx) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 px-5 py-4 sm:px-6 transition-colors"
              style={{
                borderBottom:
                  idx < (data?.notifications?.length || 0) - 1
                    ? "1px solid var(--hairline)"
                    : "none",
                background: notification.isRead
                  ? "transparent"
                  : "color-mix(in srgb, var(--fg) 3%, transparent)",
              }}
            >
              <div
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: "var(--fg)",
                  opacity: notification.isRead ? 0.15 : 1,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                    {notification.title}
                  </h2>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium"
                    style={{
                      background: "color-mix(in srgb, var(--fg) 8%, transparent)",
                      color: "var(--muted)",
                    }}
                  >
                    {TYPE_LABELS[notification.type] || notification.type}
                  </span>
                  {notification.emailSent && (
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                      Email sent
                    </span>
                  )}
                  {notification.pushSent && (
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                      Push sent
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-6" style={{ color: "var(--muted)" }}>
                  {notification.body}
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--muted)", opacity: 0.8 }}>
                  {formatTime(notification.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="rounded-lg p-2 transition-opacity hover:opacity-70 cursor-pointer"
                    style={{ color: "var(--muted)" }}
                    aria-label="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(notification.id)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
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
