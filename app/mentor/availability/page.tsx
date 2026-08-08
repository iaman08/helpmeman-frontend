"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Clock, Plus, Trash2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import type { Availability } from "@/lib/types";
import { useGoogleCalendarStatus } from "@/lib/hooks";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const { data: calStatus } = useGoogleCalendarStatus();
  const [connecting, setConnecting] = useState(false);

  // New slot form
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("17:00");

  useEffect(() => {
    api.get("/mentor/me/availability")
      .then((res) => setSlots(res.data.availabilities ?? res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const updated = [
        ...slots,
        { dayOfWeek: newDay, startTime: newStart, endTime: newEnd, isActive: true },
      ];
      await api.put("/mentor/me/availability", { availabilities: updated });
      const res = await api.get("/mentor/me/availability");
      setSlots(res.data.availabilities ?? res.data ?? []);
      setMsg("Availability saved!");
    } catch {
      setMsg("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSlot(id: string) {
    const updated = slots.filter((s) => s.id !== id);
    try {
      await api.put("/mentor/me/availability", {
        availabilities: updated.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        })),
      });
      setSlots(updated);
    } catch {
      alert("Failed to remove.");
    }
  }

  async function handleInstantConnect() {
    setConnecting(true);
    try {
      const { data } = await api.get("/google/oauth/url");
      window.location.href = data.url;
    } catch {
      alert("Failed to start Google authorization.");
      setConnecting(false);
    }
  }

  const calendarConnected = calStatus?.connected ?? false;

  return (
    <div className="flex flex-col gap-8">
      {/* Google Calendar Warning Banner */}
      {!calendarConnected && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="font-bold text-base text-amber-600 font-display">Calendar Access Required</h4>
              <p className="text-xs text-amber-600 leading-relaxed font-medium">
                Please connect your Google Calendar to enable scheduling and auto-generation of Google Meet links for bookings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstantConnect}
            disabled={connecting}
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow shrink-0 disabled:opacity-50"
          >
            {connecting ? "Connecting…" : "Connect Calendar Now"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>Availability</p>
        <h1 className="font-display text-4xl leading-tight font-extrabold" style={{ color: "var(--fg)" }}>Set your schedule.</h1>
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Define when students can book sessions with you.
        </p>
      </div>

      {/* ─── Current Slots ─── */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.22em] font-semibold mb-4 flex items-center" style={{ color: "var(--muted)" }}>
          <Clock className="h-3.5 w-3.5 inline mr-2" />
          Active slots
        </h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : slots.length > 0 ? (
          <div className="flex flex-col gap-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-xl px-5 py-3"
                style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold w-24" style={{ color: "var(--fg)" }}>
                    {DAYS[slot.dayOfWeek]}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                    {slot.startTime} — {slot.endTime}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                  style={{ color: "var(--muted)" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>No availability slots set.</p>
        )}
      </div>

      {/* ─── Add Slot ─── */}
      <div className="rounded-2xl p-6" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <h2 className="text-xs uppercase tracking-[0.22em] font-semibold mb-4 flex items-center" style={{ color: "var(--muted)" }}>
          <Plus className="h-3.5 w-3.5 inline mr-2" />
          Add a time slot
        </h2>

        <form onSubmit={handleSave} className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--muted)" }}>Day</span>
            <select
              value={newDay}
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="rounded-xl px-3 py-2.5 outline-none cursor-pointer text-sm font-medium"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}
            >
              {DAYS.map((d, i) => (
                <option key={d} value={i} style={{ background: "var(--bg)", color: "var(--fg)" }}>{d}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--muted)" }}>Start</span>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="rounded-xl px-3 py-2.5 outline-none text-sm font-medium"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--muted)" }}>End</span>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="rounded-xl px-3 py-2.5 outline-none text-sm font-medium"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-6 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-opacity shadow"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            {saving ? "Saving…" : "Add slot"}
          </button>
        </form>

        {msg && (
          <div className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold ${msg.includes("saved") ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
