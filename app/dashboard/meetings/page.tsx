"use client";

import { useState, useEffect } from "react";
import { Video, CalendarCheck, ArrowRight, Clock3 } from "lucide-react";
import { useUpcomingMeetings } from "@/lib/hooks";
import { MeetingCard } from "@/components/MeetingCard";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import api from "@/lib/api";
import Link from "next/link";
import { mutate } from "swr";
import { useAuth } from "@/lib/auth-context";
import type { Booking } from "@/lib/types";

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
] as const;

export default function MeetingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);
  const [, setCancelling] = useState<string | null>(null);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [pastLoading, setPastLoading] = useState(false);

  // Fetch upcoming confirmed sessions
  const { data: upcomingData, isLoading: upcomingLoading } = useUpcomingMeetings();

  // Fetch past bookings when tab switches
  useEffect(() => {
    if (tab !== "past" || pastBookings.length > 0) return;
    setPastLoading(true);
    api
      .get("/users/me/bookings?status=COMPLETED&page=1&limit=20")
      .then((res) => setPastBookings(res.data.bookings ?? []))
      .catch(() => {})
      .finally(() => setPastLoading(false));
  }, [tab, pastBookings.length]);

  const upcomingBookings = (upcomingData?.bookings ?? [])
    .filter((b) => new Date(b.scheduledAt).getTime() + b.durationMinutes * 60_000 > Date.now())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const sortedPastBookings = pastBookings
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  // Next upcoming session
  const nextSession = upcomingBookings[0];

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    setCancelling(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      mutate([`/users/me/bookings?status=CONFIRMED&page=1&limit=20`, user?.id]);
    } catch {
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(null);
    }
  }

  async function handleReschedule(bookingId: string) {
    setRescheduleId(bookingId);
  }

  async function submitReschedule() {
    if (!newDate || !rescheduleId) return alert("Please select a new date and time");
    setRescheduling(true);
    try {
      await api.patch(`/bookings/${rescheduleId}/reschedule`, { scheduledAt: newDate });
      mutate([`/users/me/bookings?status=CONFIRMED&page=1&limit=20`, user?.id]);
      setRescheduleId(null);
      setNewDate("");
    } catch {
      alert("Failed to reschedule. Please try again.");
    } finally {
      setRescheduling(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>Meetings</p>
        <h1 className="font-display text-4xl leading-tight font-extrabold" style={{ color: "var(--fg)" }}>Your sessions.</h1>
      </div>

      {/* ─── Next Session Banner ─── */}
      {!upcomingLoading && nextSession && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500 shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-400 font-semibold mb-0.5">
              Next Session
            </p>
            <p className="font-semibold text-lg truncate" style={{ color: "var(--fg)" }}>
              {(nextSession as unknown as { mentor?: { displayName?: string } }).mentor?.displayName ?? "Mentor"}
            </p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {new Date(nextSession.scheduledAt).toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })} · {nextSession.durationMinutes} min
            </p>
          </div>
          {nextSession.meetLink && (
            <a
              href={nextSession.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors shrink-0 shadow cursor-pointer"
            >
              <Video className="h-4 w-4" />
              Join Meet
            </a>
          )}
        </div>
      )}

      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-2">
        {TABS.map((t) => {
          const isActive = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className="rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              style={{
                background: isActive ? "var(--fg)" : "color-mix(in srgb, var(--fg) 4%, transparent)",
                color: isActive ? "var(--bg)" : "var(--muted)",
                border: isActive ? "1px solid var(--fg)" : "1px solid var(--hairline)",
              }}
            >
              {t.label}
              {t.value === "upcoming" && upcomingBookings.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-indigo-500 text-white text-[10px] px-1 font-semibold">
                  {upcomingBookings.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Upcoming Sessions ─── */}
      {tab === "upcoming" && (
        <div>
          {upcomingLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
            </div>
          ) : upcomingBookings.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingBookings.map((booking) => (
                <MeetingCard
                  key={booking.id}
                  booking={booking as Parameters<typeof MeetingCard>[0]["booking"]}
                  viewAs="mentee"
                  onCancel={handleCancel}
                  onReschedule={handleReschedule}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={
                <div className="p-4 rounded-2xl mb-4" style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)" }}>
                  <CalendarCheck className="h-8 w-8" style={{ color: "var(--fg)" }} />
                </div>
              }
              title="No upcoming sessions"
              description="Book a session with a mentor to get started."
              action={
                <Link
                  href="/mentors"
                  className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold transition-all shadow cursor-pointer"
                  style={{ background: "var(--fg)", color: "var(--bg)" }}
                >
                  Browse mentors <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          )}
        </div>
      )}

      {/* ─── Past Sessions ─── */}
      {tab === "past" && (
        <div>
          {pastLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : sortedPastBookings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {sortedPastBookings.map((booking) => (
                <MeetingCard
                  key={booking.id}
                  booking={booking as Parameters<typeof MeetingCard>[0]["booking"]}
                  viewAs="mentee"
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-10 text-center" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
              <Clock3 className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--muted)" }} />
              <p className="text-sm" style={{ color: "var(--muted)" }}>No past sessions yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Reschedule Modal ─── */}
      {rescheduleId && (
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
                onClick={submitReschedule}
                disabled={rescheduling}
                className="flex-1 rounded-xl py-3 text-sm font-semibold cursor-pointer disabled:opacity-50 transition-opacity shadow"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                {rescheduling ? "Rescheduling…" : "Confirm Reschedule"}
              </button>
              <button
                type="button"
                onClick={() => { setRescheduleId(null); setNewDate(""); }}
                className="rounded-xl px-6 py-3 text-sm font-semibold cursor-pointer transition-colors"
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
