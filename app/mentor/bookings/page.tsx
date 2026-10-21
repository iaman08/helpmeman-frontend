"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Video, CalendarPlus, Copy, Check, ExternalLink, Link2, AlertCircle, ShieldCheck, Edit3 } from "lucide-react";
import api from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import type { Booking } from "@/lib/types";
import { AxiosError } from "axios";
import { formatCurrency } from "@/lib/currency-context";
import { getGoogleCalendarUrl, isValidMeetLink } from "@/lib/calendar-utils";
import { useToast } from "@/components/Toast";

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
  const { toast } = useToast();
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteBookingId, setNoteBookingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  // Meet link management state
  const [editingMeetId, setEditingMeetId] = useState<string | null>(null);
  const [meetInput, setMeetInput] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [savingMeet, setSavingMeet] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  async function saveMeetLink(bookingId: string) {
    if (!meetInput.trim()) {
      toast("Please enter a valid Google Meet URL", "error");
      return;
    }
    setSavingMeet(true);
    try {
      const res = await api.patch(`/bookings/${bookingId}/meet-link`, {
        meetLink: meetInput,
        setAsDefault,
      });
      const newLink = res.data.meetLink;
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, meetLink: newLink } : b))
      );
      toast("Google Meet link saved successfully! Mentee has been notified.", "success");
      setEditingMeetId(null);
      setMeetInput("");
      setSetAsDefault(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update Google Meet link.";
      toast(msg, "error");
    } finally {
      setSavingMeet(false);
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

              {/* Google Meet Host Info & Controls */}
              {b.status === "CONFIRMED" && (
                <div className="rounded-xl p-3.5 flex flex-col gap-3" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isValidMeetLink(b.meetLink) ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                        <Video className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold" style={{ color: "var(--fg)" }}>
                          {isValidMeetLink(b.meetLink) ? "Google Meet Ready (Host: You)" : "Google Meet Link Needed"}
                        </span>
                        <span className="text-[11px] text-[var(--muted)]">
                          {isValidMeetLink(b.meetLink)
                            ? "You are the host with full moderation controls."
                            : "Provide your Google Meet room link so the student can join."}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isValidMeetLink(b.meetLink) && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(b.meetLink!);
                            setCopiedId(b.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--hairline)] hover:bg-[var(--fg)]/[0.05] transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copy meeting link"
                        >
                          {copiedId === b.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-[var(--muted)]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (editingMeetId === b.id) {
                            setEditingMeetId(null);
                          } else {
                            setEditingMeetId(b.id);
                            setMeetInput(isValidMeetLink(b.meetLink) ? b.meetLink! : "");
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--hairline)] bg-[var(--fg)]/[0.04] hover:bg-[var(--fg)]/[0.08] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>{isValidMeetLink(b.meetLink) ? "Change Link" : "Set Meet Link"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Meet Link Editor */}
                  {editingMeetId === b.id && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-[var(--hairline)]">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          value={meetInput}
                          onChange={(e) => setMeetInput(e.target.value)}
                          placeholder="https://meet.google.com/abc-defg-hij"
                          className="flex-1 rounded-xl px-3.5 py-2 text-xs outline-none font-medium"
                          style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveMeetLink(b.id)}
                            disabled={savingMeet}
                            className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow transition-opacity hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                            style={{ background: "var(--fg)", color: "var(--bg)" }}
                          >
                            {savingMeet ? "Saving…" : "Save Link"}
                          </button>
                          <a
                            href="https://meet.google.com/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--hairline)] hover:bg-[var(--fg)]/[0.05] transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            title="Open Google Meet in a new tab to create a room as host"
                          >
                            <span>Open meet.new</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <label className="flex items-center gap-2 text-[11px] text-[var(--muted)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setAsDefault}
                            onChange={(e) => setSetAsDefault(e.target.checked)}
                            className="rounded accent-emerald-500 cursor-pointer"
                          />
                          <span>Also set as my default Google Meet link for future bookings</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingMeetId(null)}
                          className="text-[11px] text-[var(--muted)] hover:text-[var(--fg)] underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {b.status === "CONFIRMED" && (
                  <>
                    {isValidMeetLink(b.meetLink) ? (
                      <a
                        href={b.meetLink!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer shadow transition-opacity hover:opacity-90 flex items-center gap-1.5"
                        style={{ background: "var(--fg)", color: "var(--bg)" }}
                        title="Join session over Google Meet as host"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Join Meet as Host</span>
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                    ) : (
                      <a
                        href="https://meet.google.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer shadow transition-opacity hover:opacity-90 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        title="Start a fresh Google Meet call where you are the host"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Start Meet as Host (meet.new)</span>
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                    )}

                    <a
                      href={getGoogleCalendarUrl({
                        title: `1:1 Session with ${b.user?.name ?? "Student"}`,
                        description: `Mentorship session via HelpMeMan.\nGoogle Meet: ${isValidMeetLink(b.meetLink) ? b.meetLink : "Mentor will provide link"}\nDuration: ${b.durationMinutes} mins`,
                        location: isValidMeetLink(b.meetLink) ? b.meetLink! : "",
                        startDate: b.scheduledAt,
                        durationMinutes: b.durationMinutes,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                      style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 text-blue-500" />
                      <span>Add to Calendar</span>
                    </a>
                  </>
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
