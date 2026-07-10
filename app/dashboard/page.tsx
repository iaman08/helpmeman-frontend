"use client";

import Link from "next/link";
import { CalendarCheck, MessageCircle, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBookings, useNotifications } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: bookingData, isLoading: bookingsLoading } = useBookings(
    undefined,
    1,
  );
  const { data: notifData } = useNotifications();

  const upcomingBookings =
    bookingData?.bookings?.filter(
      (b) =>
        (b.status === "CONFIRMED" || b.status === "PENDING") &&
        new Date(b.scheduledAt) > new Date(),
    ) ?? [];

  return (
    <div className="flex flex-col gap-10">
      {/* ─── Greeting ─── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Dashboard
        </p>
        <h1 className="font-display text-4xl leading-tight">
          Welcome back, {user?.name?.split(" ")[0]}.
        </h1>
      </div>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-(--fg)/[0.02] p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-(--muted)">
            <CalendarCheck className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.18em]">
              Total Bookings
            </span>
          </div>
          <span className="font-display text-3xl">
            {bookingsLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              bookingData?.total ?? 0
            )}
          </span>
        </div>
        <div className="rounded-2xl bg-(--fg)/[0.02] p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-(--muted)">
            <Clock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.18em]">
              Upcoming
            </span>
          </div>
          <span className="font-display text-3xl">
            {bookingsLoading ? (
              <Skeleton className="h-9 w-12" />
            ) : (
              upcomingBookings.length
            )}
          </span>
        </div>
        <div className="rounded-2xl bg-(--fg)/[0.02] p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-(--muted)">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.18em]">
              Unread Messages
            </span>
          </div>
          <span className="font-display text-3xl">
            {notifData?.unreadCount ?? 0}
          </span>
        </div>
      </div>

      {/* ─── Upcoming Sessions ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
            Upcoming Sessions
          </h2>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-1 text-xs text-(--muted) hover:text-(--fg) transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {bookingsLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="flex items-center justify-between rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 p-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--fg)/8 text-xs font-medium shrink-0">
                    {booking.mentor?.displayName?.[0] ?? "M"}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {booking.mentor?.displayName ?? "Mentor"}
                    </span>
                    <span className="text-xs text-(--muted)">
                      {formatDate(booking.scheduledAt)} at{" "}
                      {formatTime(booking.scheduledAt)} ·{" "}
                      {booking.durationMinutes} min
                    </span>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-(--fg)/[0.02] p-8 text-center">
            <p className="text-sm text-(--muted) mb-3">
              No upcoming sessions yet.
            </p>
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Browse mentors <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/mentors"
            className="flex items-center gap-4 rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 p-4 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent)/10 text-(--accent)">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Book a session</span>
              <span className="text-xs text-(--muted)">
                Browse verified mentors
              </span>
            </div>
          </Link>
          <Link
            href="/dashboard/chat"
            className="flex items-center gap-4 rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 p-4 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Open chat</span>
              <span className="text-xs text-(--muted)">
                Message your mentors
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
