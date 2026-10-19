"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Star,
  ExternalLink,
  FileDown,
  CalendarPlus,
  Copy,
  Check,
  X,
  Volume2,
} from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import type { Booking } from "@/lib/types";
import { AxiosError } from "axios";
import { formatCurrency } from "@/lib/currency-context";
import { CountdownTimer, isJoinable } from "@/components/CountdownTimer";
import { useState as useLiveState, useEffect as useLiveEffect } from "react";
import { getGoogleCalendarUrl } from "@/lib/calendar-utils";
import { playSuccessSound } from "@/lib/soundService";

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
  const searchParams = useSearchParams();
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  // Live join-ability state (re-evaluated every 30s)
  const [joinable, setJoinable] = useLiveState(false);

  useEffect(() => {
    if (searchParams?.get("justBooked") === "true") {
      setShowSuccessCard(true);
      playSuccessSound(0.35, id);
    }
  }, [searchParams, id]);

  useEffect(() => {
    api
      .get(`/users/me/bookings/${id}`)
      .then((res) => setBooking(res.data.booking))
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false));
  }, [id]);

  // Re-check join-ability every 30s
  useLiveEffect(() => {
    if (!booking) return;
    const check = () => setJoinable(isJoinable(booking.scheduledAt, booking.durationMinutes));
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, [booking?.scheduledAt, booking?.durationMinutes]);

  async function handleReschedule() {
    if (!newDate) return alert("Please select a date and time");
    setRescheduling(true);
    try {
      await api.patch(`/bookings/${id}/reschedule`, { scheduledAt: newDate });
      setBooking(prev => prev && { ...prev, scheduledAt: newDate });
      setRescheduleOpen(false);
      alert("Session rescheduled successfully!");
    } catch {
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
      <div className="flex flex-col gap-4 items-center py-20 text-center">
        <p style={{ color: "var(--muted)" }}>{error || "Booking not found"}</p>
        <Link
          href="/dashboard/bookings"
          className="text-sm font-semibold hover:underline"
          style={{ color: "var(--fg)" }}
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

  async function handleDownloadPDF() {
    if (!booking) return;
    try {
      const { generateConsultationPDF } = await import("@/lib/pdfGenerator");
      const mentorObj = (booking as unknown as { mentor?: { displayName?: string; institutionName?: string } }).mentor;
      generateConsultationPDF({
        bookingId: booking.id,
        menteeName: booking.user?.name || "Mentee",
        menteeEmail: booking.user?.email,
        mentorName: mentorObj?.displayName || "Mentor",
        mentorCompany: mentorObj?.institutionName,
        categoryName: "1-on-1 Mentorship Session",
        scheduledAt: booking.scheduledAt,
        durationMinutes: booking.durationMinutes,
        status: booking.status,
        userNotes: booking.userNotes || undefined,
        mentorNotes: booking.mentorNotes || undefined,
        aiBriefSummary: booking.aiBriefSummary || undefined,
        amountPaid: booking.amountPaid,
        currency: booking.currency,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/dashboard/bookings"
        className="flex items-center gap-2 text-sm font-semibold transition-colors self-start"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        All bookings
      </Link>

      {/* ─── Premium Executive Booking Confirmed Card ─── */}
      {showSuccessCard && booking && booking.status === "CONFIRMED" && (
        <div className="relative rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.08] via-[var(--fg)]/[0.02] to-transparent p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 overflow-hidden">
          {/* Top ambient hairline accent */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

          {/* Top Row: Status badge (clickable to replay chime) & Dismiss button */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              type="button"
              onClick={() => playSuccessSound(0.35)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer group"
              title="Click to replay confirmation sound"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Booking Confirmed
              <Volume2 className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowSuccessCard(false)}
              className="text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg)]/10 p-1.5 rounded-full transition-colors cursor-pointer"
              title="Dismiss announcement"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Headline & Description */}
          <div className="max-w-2xl mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "var(--fg)" }}>
              You&apos;re confirmed with {(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName ?? "your mentor"}.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
              We&apos;ve reserved your session and dispatched calendar invitations to <span className="font-semibold text-[var(--fg)]">{booking.user?.email || "your registered email"}</span>.
            </p>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--fg)]/[0.03] p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
                <Calendar className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Scheduled Date</span>
              </div>
              <span className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>
                {formatDate(booking.scheduledAt)}
              </span>
            </div>

            <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--fg)]/[0.03] p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
                <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Time & Duration</span>
              </div>
              <span className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>
                {formatTime(booking.scheduledAt)} · {booking.durationMinutes} min
              </span>
            </div>

            <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--fg)]/[0.03] p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
                <Video className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Meeting Space</span>
              </div>
              <span className="text-sm font-bold truncate text-emerald-600 dark:text-emerald-400">
                Google Meet Active
              </span>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--hairline)]">
            <a
              href={getGoogleCalendarUrl({
                title: `1:1 Mentorship Session with ${(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName ?? "Mentor"}`,
                description: `Mentorship session via HelpMeMan.\nGoogle Meet: ${booking.meetLink ?? ""}\nDuration: ${booking.durationMinutes} mins`,
                location: booking.meetLink ?? "",
                startDate: booking.scheduledAt,
                durationMinutes: booking.durationMinutes,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fg)] text-[var(--bg)] px-5 py-2.5 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>Add to Google Calendar</span>
            </a>

            {booking.meetLink && (
              <a
                href={booking.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <Video className="h-4 w-4" />
                <span>Join / Test Meet</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            )}

            {booking.meetLink && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(booking.meetLink!);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--fg)]/[0.04] hover:bg-[var(--fg)]/[0.08] px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[var(--muted)]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--fg)" }}>Session Details</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <FileDown className="h-4 w-4" />
            Download Summary PDF
          </button>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Session Info ─── */}
        <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <h2 className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>
            Session
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold shrink-0" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 6%, transparent)", color: "var(--fg)" }}>
              {(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName?.[0] ?? "M"}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-lg" style={{ color: "var(--fg)" }}>
                {(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName ?? "Mentor"}
              </span>
              {(booking as unknown as { mentor?: { institutionName?: string } }).mentor?.institutionName && (
                <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                  {(booking as unknown as { mentor?: { institutionName?: string } }).mentor?.institutionName}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm font-medium" style={{ color: "var(--fg)" }}>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4" style={{ color: "var(--muted)" }} />
              {formatDate(booking.scheduledAt)}
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4" style={{ color: "var(--muted)" }} />
              {formatTime(booking.scheduledAt)} · {booking.durationMinutes} minutes
            </div>
          </div>

          {booking.status === "CONFIRMED" && (
            <div className="flex flex-col gap-3">
              <CountdownTimer
                scheduledAt={booking.scheduledAt}
                durationMinutes={booking.durationMinutes}
              />
              {booking.meetLink ? (
                <div className="flex flex-col gap-2">
                  <a
                    href={booking.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Join Google Meet"
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all shadow-md cursor-pointer ${
                      joinable
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse-subtle"
                        : "bg-emerald-600/90 hover:bg-emerald-600 text-white"
                    }`}
                    title="Open Google Meet Session"
                  >
                    <Video className="h-4 w-4" />
                    <span>{joinable ? "Join Google Meet (Live Now)" : "Join / Test Google Meet"}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>

                  <div className="flex items-center gap-2">
                    <a
                      href={getGoogleCalendarUrl({
                        title: `1:1 Mentorship Session with ${(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName ?? "Mentor"}`,
                        description: `Mentorship session on HelpMeMan.\nGoogle Meet: ${booking.meetLink}\nDuration: ${booking.durationMinutes} mins`,
                        location: booking.meetLink,
                        startDate: booking.scheduledAt,
                        durationMinutes: booking.durationMinutes,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold border border-[var(--hairline)] bg-[var(--fg)]/[0.04] hover:bg-[var(--fg)]/[0.08] transition-colors"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="h-4 w-4 text-blue-500" />
                      <span>Add to Google Calendar</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        if (booking.meetLink) {
                          navigator.clipboard.writeText(booking.meetLink);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-semibold border border-[var(--hairline)] bg-[var(--fg)]/[0.04] hover:bg-[var(--fg)]/[0.08] transition-colors cursor-pointer"
                      title="Copy Google Meet Link"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 text-[var(--muted)]" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-500">
                    ⏳ Google Meet link is syncing with Google Calendar.
                  </div>
                  <a
                    href={getGoogleCalendarUrl({
                      title: `1:1 Mentorship Session with ${(booking as unknown as { mentor?: { displayName?: string } }).mentor?.displayName ?? "Mentor"}`,
                      description: `Mentorship session on HelpMeMan.\nDuration: ${booking.durationMinutes} mins`,
                      startDate: booking.scheduledAt,
                      durationMinutes: booking.durationMinutes,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold border border-[var(--hairline)] bg-[var(--fg)]/[0.04] hover:bg-[var(--fg)]/[0.08] transition-colors"
                  >
                    <CalendarPlus className="h-4 w-4 text-blue-500" />
                    <span>Add to Google Calendar</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Payment Info ─── */}
        <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <h2 className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>
            Payment
          </h2>

          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold" style={{ color: "var(--fg)" }}>
              {formatPrice(booking.amountPaid, booking.currency)}
            </span>
            <StatusBadge status={booking.paymentStatus} />
          </div>

          {booking.paymentId && (
            <div className="text-xs font-mono" style={{ color: "var(--muted)" }}>
              Payment ID: {booking.paymentId}
            </div>
          )}

          {booking.mentorNotes && (
            <div>
              <h3 className="text-xs uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "var(--muted)" }}>
                Mentor Notes
              </h3>
              <p className="text-sm leading-relaxed rounded-xl p-3" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}>
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
                className="rounded-xl bg-red-500/10 text-red-600 px-6 py-3 text-xs font-semibold hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel Session"}
              </button>
            )}
            {canReview && (
              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="rounded-xl px-6 py-3 text-xs font-semibold cursor-pointer transition-colors"
                style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
              >
                Leave a Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Existing Review ─── */}
      {booking.review && (
        <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <h2 className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>
            Your Review
          </h2>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${
                  s <= booking.review!.rating
                    ? "text-amber-500 fill-amber-500"
                    : "opacity-30"
                }`}
                style={{ color: s <= booking.review!.rating ? undefined : "var(--muted)" }}
              />
            ))}
          </div>
          {booking.review.comment && (
            <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>{booking.review.comment}</p>
          )}
        </div>
      )}

      {/* ─── Review Modal ─── */}
      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
            style={{ background: "var(--bg)", border: "1px solid var(--hairline)", color: "var(--fg)" }}
          >
            <h2 className="font-display text-2xl font-bold">Leave a review</h2>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "var(--muted)" }}>
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
                          : "opacity-30 hover:opacity-70"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--muted)" }}>
                Comment (optional)
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your session?"
                rows={3}
                className="rounded-xl px-4 py-3 outline-none resize-none text-sm font-medium"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                  color: "var(--fg)",
                }}
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReview}
                disabled={reviewSubmitting}
                className="flex-1 rounded-xl py-3 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-opacity shadow"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                {reviewSubmitting ? "Submitting…" : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="rounded-xl px-6 py-3 text-xs font-semibold cursor-pointer transition-colors"
                style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reschedule Modal ─── */}
      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
            style={{ background: "var(--bg)", border: "1px solid var(--hairline)", color: "var(--fg)" }}
          >
            <h2 className="font-display text-2xl font-bold">Reschedule Session</h2>
            
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--muted)" }}>
                New Date & Time
              </span>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-xl px-4 py-3 outline-none"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                  color: "var(--fg)",
                }}
                min={new Date().toISOString().slice(0, 16)}
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReschedule}
                disabled={rescheduling}
                className="flex-1 rounded-xl py-3 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-opacity shadow"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                {rescheduling ? "Rescheduling…" : "Confirm Reschedule"}
              </button>
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="rounded-xl px-6 py-3 text-xs font-semibold cursor-pointer transition-colors"
                style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
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
