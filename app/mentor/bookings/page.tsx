"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import type { Booking } from "@/lib/types";
import { AxiosError } from "axios";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function formatPrice(p: number) { return `₹${Math.round(p / 100)}`; }

const TABS = [
  { value: "", label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
] as const;

export default function MentorBookingsPage() {
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteBookingId, setNoteBookingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    api.get(`/mentor/me/bookings?${params}`)
      .then((res) => setBookings(res.data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function saveNote(bookingId: string) {
    setSaving(true);
    try {
      await api.put(`/mentor/me/bookings/${bookingId}/notes`, { notes: noteText });
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, mentorNotes: noteText } : b)
      );
      setNoteBookingId(null);
      setNoteText("");
    } catch (err) {
      if (err instanceof AxiosError) alert(err.response?.data?.error ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Sessions</p>
        <h1 className="font-display text-4xl leading-tight">Your bookings.</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
              status === tab.value ? "bg-(--accent) text-(--accent-fg)" : "bg-(--fg)/5 text-(--fg)/70 hover:bg-(--fg)/8"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : bookings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl bg-(--fg)/[0.02] p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--fg)/8 text-xs font-medium shrink-0">
                    {b.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{b.user?.name ?? "Student"}</span>
                    <span className="text-xs text-(--muted)">
                      {formatDate(b.scheduledAt)} at {formatTime(b.scheduledAt)} · {b.durationMinutes} min · {formatPrice(b.amountPaid)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>

              {b.mentorNotes && (
                <div className="text-xs text-(--fg)/70 bg-(--fg)/3 rounded-lg p-3">
                  <span className="text-(--muted) uppercase tracking-wider">Notes: </span>{b.mentorNotes}
                </div>
              )}

              <div className="flex gap-2">
                {b.meetLink && b.status === "CONFIRMED" && (
                  <a
                    href={b.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-(--accent) text-(--accent-fg) px-4 py-2 text-xs hover:opacity-90"
                  >
                    Join Meet
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setNoteBookingId(b.id);
                    setNoteText(b.mentorNotes ?? "");
                  }}
                  className="rounded-full bg-(--fg)/5 px-4 py-2 text-xs hover:bg-(--fg)/8 cursor-pointer"
                >
                  {b.mentorNotes ? "Edit notes" : "Add notes"}
                </button>
              </div>

              {noteBookingId === b.id && (
                <div className="flex gap-2 items-end">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    className="flex-1 bg-(--fg)/5 rounded-lg px-3 py-2 text-sm outline-none focus:bg-(--fg)/8 resize-none"
                    placeholder="Notes for this session..."
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => saveNote(b.id)}
                      disabled={saving}
                      className="rounded-full bg-(--accent) text-(--accent-fg) px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteBookingId(null)}
                      className="rounded-full bg-(--fg)/5 px-4 py-2 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarCheck className="h-6 w-6" />}
          title="No sessions"
          description="Your booked sessions will appear here."
        />
      )}
    </div>
  );
}
