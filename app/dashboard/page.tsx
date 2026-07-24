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
      <div className="flex items-center gap-4 border-b border-(--hairline) pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--fg)/4 border border-(--hairline) shrink-0 shadow-xs">
          <img src="/logo.svg" alt="HelpMeMan Logo" className="w-7 h-7 object-contain" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-(--muted) leading-none">
            Dashboard
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-(--fg) leading-none">
            Welcome back, {user?.name?.split(" ")[0] || "Dilkhush"}.
          </h1>
        </div>
      </div>

      {/* ─── Pending Review Banner ─── */}
      {pendingReviews.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-5 border border-amber-500/20 bg-amber-500/10 dark:bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md shadow-xs animate-pulse-subtle">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-sm text-(--fg)">
                Rate your recent session with {pendingReviews[0].displayName}
              </h3>
              <p className="text-xs text-(--muted) leading-normal">
                Share your feedback to help mentors improve and guide other mentees on the platform.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveRatingTarget(pendingReviews[0])}
            className="shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat Item 1 */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] p-5 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-(--muted)">
              Total Bookings
            </span>
            <span className="font-display text-3xl font-extrabold tracking-tight text-(--fg)">
              {bookingsLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                bookingData?.total ?? 0
              )}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 transition-transform group-hover:scale-105 duration-300">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Stat Item 2 */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] p-5 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-(--muted)">
              Upcoming Sessions
            </span>
            <span className="font-display text-3xl font-extrabold tracking-tight text-emerald-500 dark:text-emerald-400">
              {bookingsLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                upcomingBookings.length
              )}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105 duration-300">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Stat Item 3 */}
        <div className="group relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] p-5 backdrop-blur-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-(--muted)">
              Unread Messages
            </span>
            <span className="font-display text-3xl font-extrabold tracking-tight text-indigo-500 dark:text-indigo-400">
              {notifData?.unreadCount ?? 0}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105 duration-300">
            <MessageCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ─── Upcoming Sessions ─── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-(--muted)">
            Upcoming Sessions
          </h2>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-1 text-xs text-(--muted) hover:text-(--fg) font-semibold transition-colors group"
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
                className="group flex items-center justify-between rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:bg-white/80 dark:hover:bg-white/[0.04] p-4.5 transition-all duration-300 hover:shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--fg)/8 text-sm font-bold text-(--fg) border border-(--hairline) shrink-0 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all">
                    {booking.mentor?.displayName?.[0] ?? "M"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-(--fg) group-hover:text-(--accent) transition-colors">
                      {booking.mentor?.displayName ?? "Mentor"}
                    </span>
                    <span className="text-xs text-(--muted) font-medium">
                      {formatDate(booking.scheduledAt)} at{" "}
                      {formatTime(booking.scheduledAt)} ·{" "}
                      {booking.durationMinutes} min
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={booking.status} />
                  <ArrowRight className="h-4 w-4 text-(--muted) opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-(--hairline) bg-white/20 dark:bg-white/[0.01] p-10 text-center flex flex-col items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-(--fg)">
                No sessions booked yet
              </p>
              <p className="text-xs text-(--muted) max-w-xs leading-normal">
                Schedule a 1-on-1 session with a professional mentor to start accelerating your career growth.
              </p>
            </div>
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2 rounded-xl bg-(--fg) text-(--bg) px-6 py-3 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer mt-1"
            >
              Browse mentors <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-(--muted)">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/mentors"
            className="group flex items-center gap-4 rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:bg-white/80 dark:hover:bg-white/[0.04] p-4.5 transition-all duration-300 hover:shadow-xs"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner shrink-0">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-(--fg) group-hover:text-(--accent) transition-colors">
                Book a session
              </span>
              <span className="text-xs text-(--muted) font-medium">
                Browse and connect with verified mentors
              </span>
            </div>
          </Link>
          <Link
            href="/dashboard/chat"
            className="group flex items-center gap-4 rounded-2xl border border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] hover:bg-white/80 dark:hover:bg-white/[0.04] p-4.5 transition-all duration-300 hover:shadow-xs"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-inner shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-(--fg) group-hover:text-(--accent) transition-colors">
                Open chat
              </span>
              <span className="text-xs text-(--muted) font-medium">
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
