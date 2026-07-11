"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import type { Availability } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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
      // Reload
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Availability</p>
        <h1 className="font-display text-4xl leading-tight">Set your schedule.</h1>
        <p className="text-sm text-(--muted)">
          Define when students can book sessions with you.
        </p>
      </div>

      {/* ─── Current Slots ─── */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-4">
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
                className="flex items-center justify-between rounded-xl bg-(--fg)/[0.02] px-5 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-24">
                    {DAYS[slot.dayOfWeek]}
                  </span>
                  <span className="text-sm text-(--muted)">
                    {slot.startTime} — {slot.endTime}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  className="text-(--muted) hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-(--muted)">No availability slots set.</p>
        )}
      </div>

      {/* ─── Add Slot ─── */}
      <div className="rounded-2xl bg-(--fg)/[0.02] p-6">
        <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-4">
          <Plus className="h-3.5 w-3.5 inline mr-2" />
          Add a time slot
        </h2>

        <form onSubmit={handleSave} className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Day</span>
            <select
              value={newDay}
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none cursor-pointer"
            >
              {DAYS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Start</span>
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">End</span>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-(--accent) text-(--accent-fg) px-6 py-2.5 text-sm hover:opacity-90 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add slot"}
          </button>
        </form>

        {msg && (
          <div className={`mt-3 rounded-lg px-4 py-2 text-sm ${msg.includes("saved") ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
