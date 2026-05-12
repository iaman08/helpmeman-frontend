"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useBookings } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";

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

function formatPrice(paise: number) {
  return `₹${Math.round(paise / 100)}`;
}

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBookings(statusFilter, page);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.22em] text-(--muted) font-bold">
          Bookings
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight font-bold tracking-tight">Your sessions.</h1>
      </div>

      {/* ─── Status Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
              statusFilter === tab.value
                ? "bg-(--accent) text-(--accent-fg) shadow-lg"
                : "bg-(--fg)/5 text-(--muted) hover:text-(--fg) border border-(--hairline)"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Bookings List ─── */}
      <div>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 sm:h-28 w-full rounded-2xl sm:rounded-3xl" />
            ))}
          </div>
        ) : data && data.bookings.length > 0 ? (
          <>
            <div className="flex flex-col gap-3 sm:gap-4">
              {data.bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl sm:rounded-[2rem] bg-(--fg)/[0.03] border border-(--hairline) hover:border-(--fg)/15 hover:bg-(--fg)/5 p-4 sm:p-6 md:p-8 transition-all group"
                >
                  <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                    <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-(--fg)/8 text-(--muted) text-sm sm:text-base font-bold shrink-0 group-hover:scale-105 transition-transform">
                      {booking.mentor?.displayName
                        ?.split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() ?? "M"}
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0">
                      <span className="font-bold text-base sm:text-lg md:text-xl truncate group-hover:opacity-90 transition-colors">
                        {booking.mentor?.displayName ?? "Mentor"}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs md:text-sm text-(--muted)">
                        <span>{formatDate(booking.scheduledAt)}</span>
                        <span className="hidden sm:inline h-1 w-1 rounded-full bg-(--fg)/20" />
                        <span>{formatTime(booking.scheduledAt)}</span>
                        <span className="hidden sm:inline h-1 w-1 rounded-full bg-(--fg)/20" />
                        <span>{booking.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-(--hairline)">
                    <span className="text-base sm:text-lg font-bold sm:mr-6">{formatPrice(booking.amountPaid)}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-10 sm:mt-12">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-sm font-bold transition-all active:scale-90 cursor-pointer ${
                        data.page === p
                          ? "bg-(--accent) text-(--accent-fg) shadow-lg"
                          : "bg-(--fg)/5 text-(--muted) hover:text-(--fg) border border-(--hairline)"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<div className="p-4 bg-(--fg)/5 rounded-2xl mb-4"><CalendarCheck className="h-8 w-8 text-(--muted)" /></div>}
            title="No bookings yet"
            description="Book your first session with a verified mentor to get started on your journey."
            action={
              <Link
                href="/mentors"
                className="rounded-2xl bg-(--accent) text-(--accent-fg) px-8 py-4 text-sm font-bold hover:opacity-90 transition-all active:scale-95 inline-block"
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
