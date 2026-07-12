"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Star,
  ExternalLink,
} from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import type { Booking } from "@/lib/types";
import { AxiosError } from "axios";
import { formatCurrency } from "@/lib/currency-context";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(p: number, currency = "INR") { return formatCurrency(p, currency); }

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    api
      .get(`/users/me/bookings/${id}`)
      .then((res) => setBooking(res.data.booking))
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleReschedule() {
    if (!newDate) return alert("Please select a date and time");
    setRescheduling(true);
    try {
      await api.patch(`/bookings/${id}/reschedule`, { scheduledAt: newDate });
      setBooking(prev => prev && { ...prev, scheduledAt: newDate });
      setRescheduleOpen(false);
      alert("Session rescheduled successfully!");
    } catch (err) {
      alert("Failed to reschedule session.");
    } finally {
      setRescheduling(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    setCancelling(true);
    try {
      const { data } = await api.post(`/users/me/bookings/${id}/cancel`);
      setBooking(
        (prev) =>
          prev && {
            ...prev,
            status: "CANCELLED",
            paymentStatus: data.refunded ? "REFUNDED" : prev.paymentStatus,
          },
      );
    } catch {
      alert("Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleReview() {
    setReviewSubmitting(true);
    try {
      await api.post(`/users/me/bookings/${id}/review`, { rating, comment });
      setReviewOpen(false);
      // Reload booking to get review
      const res = await api.get(`/users/me/bookings/${id}`);
      setBooking(res.data.booking);
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.error ?? "Review failed");
      }
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col gap-4 items-center py-20">
        <p className="text-(--muted)">{error || "Booking not found"}</p>
        <Link
          href="/dashboard/bookings"
          className="text-sm text-(--fg) underline-offset-4 hover:underline"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  const canCancel =
    (booking.status === "CONFIRMED" || booking.status === "PENDING") &&
    new Date(booking.scheduledAt) > new Date();
  const canReview = booking.status === "COMPLETED" && !booking.review;

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/dashboard/bookings"
        className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--fg) transition-colors self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        All bookings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Session Details</h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Session Info ─── */}
        <div className="rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-5">
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
            Session
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--fg)/8 text-sm font-medium shrink-0">
              {(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName?.[0] ?? "M"}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-lg">
                {(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName ?? "Mentor"}
              </span>
              {(booking as unknown as { mentor?: { institutionName?: string } }).mentor?.institutionName && (
                <span className="text-xs text-(--muted)">
                  {(booking as unknown as { mentor?: { institutionName?: string } }).mentor?.institutionName}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-3 text-(--fg)/80">
              <Calendar className="h-4 w-4 text-(--muted)" />
              {formatDate(booking.scheduledAt)}
            </div>
            <div className="flex items-center gap-3 text-(--fg)/80">
              <Clock className="h-4 w-4 text-(--muted)" />
              {formatTime(booking.scheduledAt)} · {booking.durationMinutes} minutes
            </div>
          </div>

          {booking.meetLink && booking.status === "CONFIRMED" && (
            <a
              href={booking.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-6 py-3 text-sm hover:opacity-90 transition-opacity"
            >
              <Video className="h-4 w-4" />
              Join Google Meet
            </a>
          )}
        </div>

        {/* ─── Payment Info ─── */}
        <div className="rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-5">
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
            Payment
          </h2>

          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl">
              {formatPrice(booking.amountPaid, booking.currency)}
            </span>
            <StatusBadge status={booking.paymentStatus} />
          </div>

          {booking.paymentId && (
            <div className="text-xs text-(--muted)">
              Payment ID: {booking.paymentId}
            </div>
          )}

          {booking.mentorNotes && (
            <div>
              <h3 className="text-xs uppercase tracking-[0.18em] text-(--muted) mb-2">
                Mentor Notes
              </h3>
              <p className="text-sm text-(--fg)/80 leading-relaxed bg-(--fg)/3 rounded-lg p-3">
                {booking.mentorNotes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto">
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-full bg-red-500/10 text-red-600 px-6 py-3 text-sm hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel Session"}
              </button>
            )}
            {canReview && (
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="rounded-full bg-(--fg)/5 px-6 py-3 text-sm hover:bg-(--fg)/8 transition-colors cursor-pointer"
              >
                Leave a Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Existing Review ─── */}
      {booking.review && (
        <div className="rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
            Your Review
          </h2>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${
                  s <= booking.review!.rating
                    ? "text-amber-500 fill-amber-500"
                    : "text-(--fg)/15"
                }`}
              />
            ))}
          </div>
          {booking.review.comment && (
            <p className="text-sm text-(--fg)/80">{booking.review.comment}</p>
          )}
        </div>
      )}

      {/* ─── Review Modal ─── */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: "var(--bg)" }}
          >
            <h2 className="font-display text-2xl">Leave a review</h2>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-(--muted) mb-2">
                Rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        s <= rating
                          ? "text-amber-500 fill-amber-500"
                          : "text-(--fg)/15 hover:text-amber-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                Comment (optional)
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your session?"
                rows={3}
                className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors resize-none"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReview}
                disabled={reviewSubmitting}
                className="flex-1 rounded-full bg-(--accent) text-(--accent-fg) py-3 text-sm hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting…" : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="rounded-full bg-(--fg)/5 px-6 py-3 text-sm hover:bg-(--fg)/8 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reschedule Modal ─── */}
      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: "var(--bg)" }}
          >
            <h2 className="font-display text-2xl">Reschedule Session</h2>
            
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                New Date & Time
              </span>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
                min={new Date().toISOString().slice(0, 16)}
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReschedule}
                disabled={rescheduling}
                className="flex-1 rounded-full bg-(--accent) text-(--accent-fg) py-3 text-sm hover:opacity-90 cursor-pointer disabled:opacity-50"
              >
                {rescheduling ? "Rescheduling…" : "Confirm Reschedule"}
              </button>
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="rounded-full bg-(--fg)/5 px-6 py-3 text-sm hover:bg-(--fg)/8 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
