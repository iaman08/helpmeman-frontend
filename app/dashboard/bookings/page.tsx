"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, Search } from "lucide-react";
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Bookings
        </p>
        <h1 className="font-display text-4xl leading-tight">Your sessions.</h1>
      </div>

      {/* ─── Status Tabs ─── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              statusFilter === tab.value
                ? "bg-(--accent) text-(--accent-fg)"
                : "bg-(--fg)/5 text-(--fg)/70 hover:bg-(--fg)/8"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Bookings List ─── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.bookings.length > 0 ? (
        <>
          <div className="flex flex-col gap-3">
            {data.bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="flex items-center justify-between rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 p-5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--fg)/8 text-sm font-medium shrink-0">
                    {booking.mentor?.displayName
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() ?? "M"}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {booking.mentor?.displayName ?? "Mentor"}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-(--muted)">
                      <span>
                        {formatDate(booking.scheduledAt)} at{" "}
                        {formatTime(booking.scheduledAt)}
                      </span>
                      <span>{booking.durationMinutes} min</span>
                      <span>{formatPrice(booking.amountPaid)}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-full text-xs cursor-pointer ${
                      data.page === p
                        ? "bg-(--accent) text-(--accent-fg)"
                        : "bg-(--fg)/5 hover:bg-(--fg)/8"
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
          icon={<CalendarCheck className="h-6 w-6" />}
          title="No bookings yet"
          description="Book your first session with a verified mentor."
          action={
            <Link
              href="/mentors"
              className="rounded-full bg-(--accent) text-(--accent-fg) px-6 py-3 text-sm hover:opacity-90 transition-opacity"
            >
              Browse mentors
            </Link>
          }
        />
      )}
    </div>
  );
}
