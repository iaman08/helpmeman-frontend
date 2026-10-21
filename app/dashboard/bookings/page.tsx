"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, Video, CalendarPlus } from "lucide-react";
import { useBookings } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { formatCurrency } from "@/lib/currency-context";
import { getGoogleCalendarUrl, isValidMeetLink } from "@/lib/calendar-utils";

const TABS = [
  { value: undefined, label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
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

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBookings(statusFilter, page);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>
          Bookings
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight font-extrabold tracking-tight" style={{ color: "var(--fg)" }}>Your sessions.</h1>
      </div>

      {/* ─── Status Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className="rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer"
              style={{
                background: isActive ? "var(--fg)" : "color-mix(in srgb, var(--fg) 4%, transparent)",
                color: isActive ? "var(--bg)" : "var(--muted)",
                border: isActive ? "1px solid var(--fg)" : "1px solid var(--hairline)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Bookings List ─── */}
      <div>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 sm:h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : data && data.bookings.length > 0 ? (
          <>
            <div className="flex flex-col gap-3 sm:gap-4">
              {data.bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl p-4 sm:p-6 md:p-8 transition-all group"
                  style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}
                >
                  <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                    <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold shrink-0 group-hover:scale-105 transition-transform" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 6%, transparent)", color: "var(--fg)" }}>
                      {booking.mentor?.displayName
                        ?.split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() ?? "M"}
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
                      <span className="font-semibold text-base sm:text-lg md:text-xl truncate" style={{ color: "var(--fg)" }}>
                        {booking.mentor?.displayName ?? "Mentor"}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs md:text-sm" style={{ color: "var(--muted)" }}>
                        <span>{formatDate(booking.scheduledAt)}</span>
                        <span className="hidden sm:inline h-1 w-1 rounded-full" style={{ background: "var(--hairline)" }} />
                        <span>{formatTime(booking.scheduledAt)}</span>
                        <span className="hidden sm:inline h-1 w-1 rounded-full" style={{ background: "var(--hairline)" }} />
                        <span>{booking.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-3 sm:pt-0 gap-3" style={{ borderTop: "1px solid var(--hairline)" }}>
                    <span className="text-base sm:text-lg font-semibold sm:mr-4" style={{ color: "var(--fg)" }}>{formatPrice(booking.amountPaid, booking.currency)}</span>
                    <StatusBadge status={booking.status} />
                    {booking.status === "CONFIRMED" && (
                      <div className="flex items-center gap-1.5 ml-1">
                        {isValidMeetLink(booking.meetLink) ? (
                          <a
                            href={booking.meetLink!}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            title="Open Google Meet Session"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Join Meet</span>
                          </a>
                        ) : (
                          <span className="text-[11px] font-medium text-[var(--muted)] px-2.5 py-1 rounded-lg border border-[var(--hairline)] bg-[var(--fg)]/[0.02]">
                            Link Pending
                          </span>
                        )}
                        <a
                          href={getGoogleCalendarUrl({
                            title: `1:1 Mentorship Session with ${booking.mentor?.displayName ?? "Mentor"}`,
                            description: `Mentorship session via HelpMeMan.\nGoogle Meet: ${isValidMeetLink(booking.meetLink) ? booking.meetLink! : "Link will be shared before session"}\nDuration: ${booking.durationMinutes} mins`,
                            location: isValidMeetLink(booking.meetLink) ? booking.meetLink! : "",
                            startDate: booking.scheduledAt,
                            durationMinutes: booking.durationMinutes,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-xl px-2.5 py-1.5 text-xs font-semibold border border-[var(--hairline)] bg-[var(--fg)]/[0.04] hover:bg-[var(--fg)]/[0.08] transition-colors flex items-center gap-1"
                          title="Add to Google Calendar"
                        >
                          <CalendarPlus className="h-3.5 w-3.5 text-blue-500" />
                          <span className="hidden sm:inline">Calendar</span>
                        </a>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-10 sm:mt-12">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (p) => {
                    const isCurrent = data.page === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                        style={{
                          background: isCurrent ? "var(--fg)" : "color-mix(in srgb, var(--fg) 4%, transparent)",
                          color: isCurrent ? "var(--bg)" : "var(--fg)",
                          border: isCurrent ? "1px solid var(--fg)" : "1px solid var(--hairline)",
                        }}
                      >
                        {p}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<div className="p-4 rounded-2xl" style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)" }}><CalendarCheck className="h-8 w-8" style={{ color: "var(--fg)" }} /></div>}
            title="No bookings yet"
            description="Book your first session with a verified mentor to get started on your journey."
            action={
              <Link
                href="/mentors"
                className="rounded-2xl px-8 py-4 text-sm font-semibold transition-all inline-block shadow cursor-pointer"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                Browse mentors
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
