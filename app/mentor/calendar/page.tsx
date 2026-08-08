"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Globe } from "lucide-react";
import { useGoogleCalendarStatus, useMentorBlockedDates } from "@/lib/hooks";
import { MeetingCard } from "@/components/MeetingCard";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { Booking } from "@/lib/types";

export default function MentorCalendarPage() {
  useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Status & Blocked Dates
  const { data: calStatus, mutate: mutateStatus } = useGoogleCalendarStatus();
  const { data: blockedData, mutate: mutateBlocked } = useMentorBlockedDates();

  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [addingDate, setAddingDate] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [timezone, setTimezone] = useState("");

  // Upcoming confirmed sessions for the mentor
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Load timezone when connection status resolves
  useEffect(() => {
    if (calStatus?.timezone) setTimezone(calStatus.timezone);
  }, [calStatus?.timezone]);

  // Load upcoming sessions
  useEffect(() => {
    setSessionsLoading(true);
    api
      .get("/mentor/me/bookings?status=CONFIRMED")
      .then((res) => {
        const sorted = (res.data.bookings ?? []).sort(
          (a: Booking, b: Booking) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
        setSessions(sorted);
      })
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  // Handle OAuth callback result toast notifications
  useEffect(() => {
    const google = searchParams?.get("google");
    if (google === "connected") {
      toast("Google Calendar connected successfully! ✅", "success");
      mutateStatus();
    } else if (google === "denied") {
      toast("Google Calendar access was denied.", "error");
    } else if (google === "error") {
      toast("Something went wrong connecting Google Calendar.", "error");
    }
  }, [searchParams, mutateStatus, toast]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const { data } = await api.get("/google/oauth/url");
      window.location.href = data.url;
    } catch {
      toast("Failed to start Google authorization.", "error");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect Google Calendar? Future bookings won't auto-generate Meet links.")) return;
    setDisconnecting(true);
    try {
      await api.delete("/google/oauth/disconnect");
      toast("Google Calendar disconnected.", "success");
      mutateStatus();
    } catch {
      toast("Failed to disconnect.", "error");
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleAddBlockedDate() {
    if (!newBlockDate) return toast("Please select a date to block.", "error");
    setAddingDate(true);
    try {
      await api.post("/mentor/me/blocked-dates", { date: newBlockDate, reason: newBlockReason || undefined });
      toast("Date blocked successfully.", "success");
      setNewBlockDate("");
      setNewBlockReason("");
      mutateBlocked();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to block date.";
      toast(msg, "error");
    } finally {
      setAddingDate(false);
    }
  }

  async function handleDeleteBlockedDate(dateId: string) {
    try {
      await api.delete(`/mentor/me/blocked-dates/${dateId}`);
      mutateBlocked();
    } catch {
      toast("Failed to remove blocked date.", "error");
    }
  }

  async function handleSaveTimezone() {
    try {
      await api.put("/google/calendar/timezone", { timezone });
      toast("Timezone updated.", "success");
      mutateStatus();
    } catch {
      toast("Failed to update timezone.", "error");
    }
  }

  const connected = calStatus?.connected ?? false;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>Workspace</p>
        <h1 className="font-display text-4xl leading-tight font-extrabold" style={{ color: "var(--fg)" }}>Calendar & Sessions</h1>
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Manage calendar syncing, timezone, unavailable blocked dates, and upcoming sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Column 1 & 2: Integration & Sessions ─── */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Integration Status Card */}
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${connected ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                <Calendar size={28} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-lg" style={{ color: "var(--fg)" }}>Google Calendar Sync</span>
                <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                  {connected ? "Active & Syncing" : "Not connected"}
                </span>
              </div>
            </div>

            {connected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="w-full sm:w-auto text-xs text-red-500 font-semibold px-4 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                {disconnecting ? "Disconnecting…" : "Disconnect Calendar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50 shadow"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {connecting ? "Connecting…" : "Connect Google Calendar"}
              </button>
            )}
          </div>

          {/* Timezone Settings (When connected) */}
          {connected && (
            <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <Globe size={16} />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Calendar Timezone</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none font-medium cursor-pointer"
                  style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}
                >
                  {[
                    "Asia/Kolkata", "Asia/Dubai", "America/New_York", "America/Los_Angeles",
                    "Europe/London", "Europe/Paris", "Asia/Singapore", "Australia/Sydney",
                    "Pacific/Auckland", "Asia/Tokyo",
                  ].map((tz) => (
                    <option key={tz} value={tz} style={{ background: "var(--bg)", color: "var(--fg)" }}>{tz}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveTimezone}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shadow"
                  style={{ background: "var(--fg)", color: "var(--bg)" }}
                >
                  Save Timezone
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Sessions List */}
          <div>
            <h2 className="text-xs uppercase tracking-[0.22em] font-semibold mb-4" style={{ color: "var(--muted)" }}>
              Confirmed Upcoming Sessions
            </h2>

            {sessionsLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
              </div>
            ) : sessions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {sessions.map((booking) => (
                  <MeetingCard
                    key={booking.id}
                    booking={booking as Parameters<typeof MeetingCard>[0]["booking"]}
                    viewAs="mentor"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-10 text-center" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
                <Clock className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--muted)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>No upcoming sessions scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Column 3: Blocked Dates Workspace ─── */}
        {connected && (
          <div className="rounded-2xl p-6 flex flex-col gap-6 self-start" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: "var(--fg)" }}>Blocked Days</h3>
              <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                Mark full days as blocked. Mentees won't be able to book sessions on these dates.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                Select Date
                <input
                  type="date"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="rounded-xl px-4 py-2.5 text-sm outline-none font-medium"
                  style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                Reason
                <input
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="e.g. Leave, Personal work"
                  className="rounded-xl px-4 py-2.5 text-sm outline-none font-medium"
                  style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}
                />
              </label>

              <button
                type="button"
                onClick={handleAddBlockedDate}
                disabled={addingDate}
                className="w-full py-3 rounded-xl text-xs font-semibold hover:opacity-90 cursor-pointer disabled:opacity-50 transition-opacity whitespace-nowrap shadow"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                {addingDate ? "Blocking…" : "+ Add Blocked Date"}
              </button>
            </div>

            {/* Blocked dates list */}
            {blockedData?.blockedDates && blockedData.blockedDates.length > 0 && (
              <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid var(--hairline)" }}>
                <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Currently Blocked</span>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {blockedData.blockedDates.map((bd) => (
                    <div key={bd.id} className="flex items-center justify-between rounded-xl px-3.5 py-2" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)" }}>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}>
                          {new Date(bd.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {bd.reason && <span className="text-[10px] truncate font-medium" style={{ color: "var(--muted)" }}>{bd.reason}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlockedDate(bd.id)}
                        className="text-red-500 hover:text-red-600 text-xs font-semibold p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
