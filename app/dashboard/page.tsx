"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, MessageCircle, ArrowRight, Clock, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useBookings, useNotifications } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import { RatingModal } from "@/components/RatingModal";
import api from "@/lib/api";
import type { PendingReview } from "@/lib/types";
import { MenteePlatformReviewCard } from "@/components/MenteePlatformReviewCard";

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
  const { data: bookingData, isLoading: bookingsLoading, mutate: mutateBookings } = useBookings(
    undefined,
    1,
  );
  const { data: notifData } = useNotifications();
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [activeRatingTarget, setActiveRatingTarget] = useState<PendingReview | null>(null);

  const fetchPendingReviews = () => {
    api
      .get("/reviews/pending")
      .then((res) => {
        const pending = res.data?.pending ?? [];
        setPendingReviews(pending);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const upcomingBookings =
    bookingData?.bookings?.filter(
      (b) =>
        (b.status === "CONFIRMED" || b.status === "PENDING") &&
        new Date(b.scheduledAt) > new Date(),
    ) ?? [];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ─── Greeting Section ─── */}
      <div className="flex items-center gap-3.5 pb-4 sm:pb-6" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <img src="/logo.svg" alt="HelpMeMan Logo" className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0" />
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
            Dashboard
          </p>
          <h1 className="font-display text-xl sm:text-3xl font-extrabold tracking-tight leading-tight truncate" style={{ color: "var(--fg)" }}>
            Welcome back, {user?.name?.split(" ")[0] || "Dilkhush"}.
          </h1>
        </div>
      </div>

      {/* ─── Pending Review Banner ─── */}
      {pendingReviews.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-5 border border-amber-500/20 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm" style={{ color: "var(--fg)" }}>
                Rate your recent session with {pendingReviews[0].displayName}
              </h3>
              <p className="text-xs leading-normal" style={{ color: "var(--muted)" }}>
                Share your feedback to help mentors improve and guide other mentees on the platform.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveRatingTarget(pendingReviews[0])}
            className="shrink-0 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-all cursor-pointer"
          >
            Rate Session
          </button>
        </div>
      )}

      {/* ─── Platform Review Card ─── */}
      <div className="transform hover:-translate-y-0.5 transition-transform duration-300">
        <MenteePlatformReviewCard />
      </div>

      {/* ─── Premium Stats Grid ─── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Stat Item 1 */}
        <div className="group relative overflow-hidden rounded-2xl p-3.5 sm:p-5 transition-all duration-300 flex items-center justify-between" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-display text-xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--fg)" }}>
              {bookingsLoading ? (
                <Skeleton className="h-6 w-8 sm:h-9 sm:w-12" />
              ) : (
                bookingData?.total ?? 0
              )}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: "var(--muted)" }}>
              <span className="sm:hidden">Bookings</span>
              <span className="hidden sm:inline">Total Bookings</span>
            </span>
          </div>
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shrink-0">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Stat Item 2 */}
        <div className="group relative overflow-hidden rounded-2xl p-3.5 sm:p-5 transition-all duration-300 flex items-center justify-between" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-display text-xl sm:text-3xl font-extrabold tracking-tight text-emerald-500">
              {bookingsLoading ? (
                <Skeleton className="h-6 w-8 sm:h-9 sm:w-12" />
              ) : (
                upcomingBookings.length
              )}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: "var(--muted)" }}>
              <span className="sm:hidden">Upcoming</span>
              <span className="hidden sm:inline">Upcoming Sessions</span>
            </span>
          </div>
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Stat Item 3 */}
        <div className="group relative overflow-hidden rounded-2xl p-3.5 sm:p-5 transition-all duration-300 flex items-center justify-between" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-display text-xl sm:text-3xl font-extrabold tracking-tight text-indigo-500">
              {notifData?.unreadCount ?? 0}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: "var(--muted)" }}>
              <span className="sm:hidden">Unread</span>
              <span className="hidden sm:inline">Unread Messages</span>
            </span>
          </div>
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md shrink-0">
            <MessageCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ─── Upcoming Sessions ─── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--muted)" }}>
            Upcoming Sessions
          </h2>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-1 text-xs font-semibold transition-colors group"
            style={{ color: "var(--muted)" }}
          >
            View all <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {bookingsLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="group flex items-center justify-between rounded-2xl p-4.5 transition-all duration-300"
                style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold shrink-0" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}>
                    {booking.mentor?.displayName?.[0] ?? "M"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold transition-colors" style={{ color: "var(--fg)" }}>
                      {booking.mentor?.displayName ?? "Mentor"}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                      {formatDate(booking.scheduledAt)} at{" "}
                      {formatTime(booking.scheduledAt)} ·{" "}
                      {booking.durationMinutes} min
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={booking.status} />
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: "var(--fg)" }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-10 text-center flex flex-col items-center justify-center gap-4" style={{ border: "1px dashed var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0">
              <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                No sessions booked yet
              </p>
              <p className="text-xs max-w-xs leading-normal" style={{ color: "var(--muted)" }}>
                Schedule a 1-on-1 session with a professional mentor to start accelerating your career growth.
              </p>
            </div>
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 sm:px-6 sm:py-3 text-xs font-semibold cursor-pointer mt-1 transition-opacity hover:opacity-90"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
            >
              Browse mentors <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--muted)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/mentors"
            className="group flex items-center gap-4 rounded-2xl p-4.5 transition-all duration-300"
            style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shrink-0">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold transition-colors" style={{ color: "var(--fg)" }}>
                Book a session
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Browse and connect with verified mentors
              </span>
            </div>
          </Link>
          <Link
            href="/dashboard/chat"
            className="group flex items-center gap-4 rounded-2xl p-4.5 transition-all duration-300"
            style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold transition-colors" style={{ color: "var(--fg)" }}>
                Open chat
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Message your mentors in real-time
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Rating Modal ─── */}
      {activeRatingTarget && (
        <RatingModal
          isOpen={!!activeRatingTarget}
          onClose={() => setActiveRatingTarget(null)}
          bookingId={activeRatingTarget.bookingId}
          mentorName={activeRatingTarget.displayName}
          mentorAvatar={activeRatingTarget.avatar}
          sessionDate={formatDate(activeRatingTarget.scheduledAt)}
          onSubmitted={() => {
            fetchPendingReviews();
            mutateBookings();
          }}
        />
      )}
    </div>
  );
}
