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

      {/* ─── Pending Review Banner ─── */}
      {pendingReviews.length > 0 && (
        <div className="rounded-2xl p-5 border bg-amber-500/10 border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="font-semibold text-sm text-[color:var(--fg)]">
                Rate your recent session with {pendingReviews[0].displayName}
              </h3>
              <p className="text-xs text-[color:var(--muted)]">
                Share your feedback to help mentors improve and guide other mentees.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveRatingTarget(pendingReviews[0])}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
          >
            Rate Session
          </button>
        </div>
      )}

      {/* ─── Platform Review Card ─── */}
      <MenteePlatformReviewCard />

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
