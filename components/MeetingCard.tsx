"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, Calendar, Clock, User, ExternalLink } from "lucide-react";
import { CountdownTimer, isJoinable } from "./CountdownTimer";
import { StatusBadge } from "./StatusBadge";
import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/lib/currency-context";

interface MeetingCardProps {
  booking: Booking & {
    mentor?: { displayName?: string; avatar?: string | null; institutionName?: string; googleCalendarTimezone?: string | null };
    user?: { name?: string; avatar?: string | null };
  };
  viewAs: "mentee" | "mentor";
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  compact?: boolean;
}

function formatDateLocal(d: string, tz?: string | null) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(tz ? { timeZone: tz } : {}),
  });
}

function formatTimeLocal(d: string, tz?: string | null) {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    ...(tz ? { timeZone: tz } : {}),
  });
}

/**
 * Reusable meeting card for both mentor and mentee dashboards.
 * Shows session details, live countdown, join button (active 15min before),
 * and quick actions.
 */
export function MeetingCard({ booking, viewAs, onCancel, onReschedule, compact = false }: MeetingCardProps) {
  const [joinable, setJoinable] = useState(false);

  // Re-check joinability every 30 seconds
  useEffect(() => {
    const check = () => setJoinable(isJoinable(booking.scheduledAt, booking.durationMinutes));
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [booking.scheduledAt, booking.durationMinutes]);

  const tz = booking.mentor?.googleCalendarTimezone;
  const otherPersonName = viewAs === "mentee"
    ? booking.mentor?.displayName ?? "Mentor"
    : booking.user?.name ?? "Student";

  const isPast = new Date(booking.scheduledAt).getTime() + booking.durationMinutes * 60_000 < Date.now();
  const canCancel = !isPast && booking.status !== "CANCELLED" && booking.status !== "COMPLETED";

  if (compact) {
    return (
      <Link
        href={`/dashboard/bookings/${booking.id}`}
        className="flex items-center justify-between rounded-2xl bg-(--fg)/[0.03] border border-(--hairline) hover:border-(--fg)/15 hover:bg-(--fg)/5 p-4 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--fg)/8 text-sm font-bold shrink-0">
            {otherPersonName[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{otherPersonName}</span>
            <span className="text-xs text-(--muted)">
              {formatDateLocal(booking.scheduledAt, tz)} · {formatTimeLocal(booking.scheduledAt, tz)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CountdownTimer scheduledAt={booking.scheduledAt} durationMinutes={booking.durationMinutes} />
          <StatusBadge status={booking.status} />
        </div>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-(--hairline) bg-(--fg)/[0.02] p-5 flex flex-col gap-4 hover:border-(--fg)/15 transition-colors">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--fg)/8 text-base font-bold shrink-0">
            {otherPersonName[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-base">{otherPersonName}</span>
            {booking.mentor?.institutionName && viewAs === "mentee" && (
              <span className="text-xs text-(--muted)">{booking.mentor.institutionName}</span>
            )}
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* ─── Session Details ─── */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-(--fg)/70">
          <Calendar className="h-3.5 w-3.5 text-(--muted) shrink-0" />
          <span>{formatDateLocal(booking.scheduledAt, tz)}</span>
        </div>
        <div className="flex items-center gap-2 text-(--fg)/70">
          <Clock className="h-3.5 w-3.5 text-(--muted) shrink-0" />
          <span>{formatTimeLocal(booking.scheduledAt, tz)} · {booking.durationMinutes} min</span>
          {tz && <span className="text-xs text-(--muted)">({tz})</span>}
        </div>
        {(viewAs === "mentor" && booking.user?.name) && (
          <div className="flex items-center gap-2 text-(--fg)/70">
            <User className="h-3.5 w-3.5 text-(--muted) shrink-0" />
            <span>{booking.user.name}</span>
          </div>
        )}
      </div>

      {/* ─── Countdown ─── */}
      {booking.status === "CONFIRMED" && !isPast && (
        <CountdownTimer
          scheduledAt={booking.scheduledAt}
          durationMinutes={booking.durationMinutes}
        />
      )}

      {/* ─── Join Meeting Button ─── */}
      {booking.status === "CONFIRMED" && booking.meetLink && (
        <a
          href={booking.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join Google Meet session"
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
            joinable
              ? "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 animate-pulse-subtle"
              : "bg-(--fg)/8 text-(--muted) cursor-not-allowed opacity-60"
          }`}
          onClick={!joinable ? (e) => e.preventDefault() : undefined}
          title={!joinable ? "Join button activates 15 minutes before the session" : "Join Google Meet"}
        >
          <Video className="h-4 w-4" />
          {joinable ? "Join Google Meet" : "Join opens 15 min before"}
          {joinable && <ExternalLink className="h-3.5 w-3.5 opacity-70" />}
        </a>
      )}

      {/* No meet link yet */}
      {booking.status === "CONFIRMED" && !booking.meetLink && (
        <div className="rounded-xl bg-amber-500/8 border border-amber-500/15 px-4 py-3 text-xs text-amber-600">
          ⏳ Meet link will be shared shortly by the mentor
        </div>
      )}

      {/* ─── Actions ─── */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="flex-1 text-center rounded-lg bg-(--fg)/5 hover:bg-(--fg)/10 py-2 text-xs font-medium transition-colors"
        >
          View Details
        </Link>
        {canCancel && onReschedule && (
          <button
            type="button"
            onClick={() => onReschedule(booking.id)}
            className="rounded-lg bg-(--fg)/5 hover:bg-(--fg)/10 px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
          >
            Reschedule
          </button>
        )}
        {canCancel && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(booking.id)}
            className="rounded-lg bg-red-500/8 hover:bg-red-500/15 text-red-600 px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
