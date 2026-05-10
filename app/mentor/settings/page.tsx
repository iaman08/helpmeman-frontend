"use client";

import { useEffect, useState, type FormEvent } from "react";
import { User, Save } from "lucide-react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Skeleton } from "@/components/Skeleton";
import type { Mentor } from "@/lib/types";

export default function MentorSettingsPage() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [expertise, setExpertise] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [sessionDuration, setSessionDuration] = useState("30");

  useEffect(() => {
    api.get("/mentor/me")
      .then((res) => {
        const m = res.data.mentor ?? res.data;
        setMentor(m);
        setDisplayName(m.displayName ?? "");
        setBio(m.bio ?? "");
        setCurrentRole(m.currentRole ?? "");
        setCompany(m.company ?? "");
        setLinkedinUrl(m.linkedinUrl ?? "");
        setExpertise((m.expertise ?? []).join(", "));
        setPricePerSession(String(Math.round((m.pricePerSession ?? 0) / 100)));
        setSessionDuration(String(m.sessionDuration ?? 30));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await api.put("/mentor/me", {
        displayName,
        bio,
        currentRole,
        company,
        linkedinUrl,
        expertise: expertise.split(",").map((s) => s.trim()).filter(Boolean),
        pricePerSession: Number(pricePerSession) * 100,
        sessionDuration: Number(sessionDuration),
      });
      setMsg("Profile updated!");
    } catch (err) {
      if (err instanceof AxiosError) {
        setMsg(err.response?.data?.error ?? "Update failed.");
      } else {
        setMsg("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Profile</p>
        <h1 className="font-display text-4xl leading-tight">Edit your profile.</h1>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-5 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-4 w-4 text-(--muted)" />
          <span className="text-xs uppercase tracking-[0.22em] text-(--muted)">Mentor Information</span>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Display Name</span>
          <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Bio</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
            className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors resize-none" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Current Role</span>
            <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Company</span>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">LinkedIn URL</span>
          <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Expertise (comma-separated)</span>
          <input type="text" value={expertise} onChange={(e) => setExpertise(e.target.value)}
            placeholder="DSA, System Design, Interview Prep"
            className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Price per session (₹)</span>
            <input type="number" min={0} value={pricePerSession} onChange={(e) => setPricePerSession(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Session duration (min)</span>
            <select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none cursor-pointer">
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </label>
        </div>

        {msg && (
          <div className={`rounded-lg px-4 py-3 text-sm ${msg.includes("updated") ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
            {msg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="self-start flex items-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 cursor-pointer disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
