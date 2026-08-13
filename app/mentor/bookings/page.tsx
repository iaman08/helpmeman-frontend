"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import type { Booking } from "@/lib/types";
import { AxiosError } from "axios";
import { formatCurrency } from "@/lib/currency-context";

import { PreSessionBriefCard } from "@/components/PreSessionBriefCard";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function formatPrice(p: number, currency = "INR") { return formatCurrency(p, currency); }

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
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>Sessions</p>
        <h1 className="font-display text-4xl leading-tight font-extrabold" style={{ color: "var(--fg)" }}>Your bookings.</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStatus(tab.value)}
              className="rounded-full px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
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

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : bookings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl p-5 flex flex-col gap-3" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold shrink-0" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 6%, transparent)", color: "var(--fg)" }}>
                    {b.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{b.user?.name ?? "Student"}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                      {formatDate(b.scheduledAt)} at {formatTime(b.scheduledAt)} · {b.durationMinutes} min · {formatPrice(b.amountPaid, b.currency)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>

              {/* Pre-Session AI Briefing Card */}
              {(b.aiBriefSummary || b.intakeAnswers) && (
                <PreSessionBriefCard
                  aiBriefSummary={b.aiBriefSummary}
                  intakeAnswers={b.intakeAnswers}
                  menteeName={b.user?.name || "Student"}
                />
              )}

              {b.mentorNotes && (
                <div className="text-xs font-medium rounded-lg p-3" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}>
                  <span className="uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>Notes: </span>{b.mentorNotes}
                </div>
              )}

              <div className="flex gap-2">
                {b.meetLink && b.status === "CONFIRMED" && (
                  <a
                    href={b.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer shadow transition-opacity hover:opacity-90"
                    style={{ background: "var(--fg)", color: "var(--bg)" }}
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
                  className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                  style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
                >
                  {b.mentorNotes ? "Edit notes" : "Add notes"}
                </button>
              </div>

              {noteBookingId === b.id && (
                <div className="flex gap-2 items-end mt-1">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    className="flex-1 rounded-xl px-3 py-2 text-sm outline-none resize-none font-medium"
                    style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}
                    placeholder="Notes for this session..."
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => saveNote(b.id)}
                      disabled={saving}
                      className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-opacity shadow"
                      style={{ background: "var(--fg)", color: "var(--bg)" }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteBookingId(null)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                      style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
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
          icon={<CalendarCheck className="h-6 w-6 text-[var(--fg)]" />}
          title="No sessions"
          description="Your booked sessions will appear here."
        />
      )}
    </div>
  );
}
