"use client";

import { useEffect, useState } from "react";
import { Users, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import type { Mentor } from "@/lib/types";

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/mentors")
      .then((res) => setMentors(res.data.mentors ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(id: string) {
    try {
      const res = await api.put(`/admin/mentors/${id}/toggle-active`);
      setMentors((prev) =>
        prev.map((m) => m.id === id ? { ...m, isActive: res.data.isActive } : m)
      );
    } catch { alert("Failed"); }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Mentors</p>
        <h1 className="font-display text-4xl leading-tight">All mentors.</h1>
        <p className="text-sm text-(--muted)">{mentors.length} mentor{mentors.length !== 1 ? "s" : ""} total</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-(--muted)">
            <span className="col-span-3">Name</span>
            <span className="col-span-3">Institution</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1">Rating</span>
            <span className="col-span-1">Sessions</span>
            <span className="col-span-2">Active</span>
          </div>

          {mentors.map((m) => (
            <div key={m.id} className="grid grid-cols-12 gap-4 items-center rounded-xl bg-(--fg)/[0.02] px-5 py-3 text-sm">
              <div className="col-span-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--fg)/8 text-[10px] font-medium shrink-0">
                  {m.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate font-medium">{m.displayName}</span>
              </div>
              <div className="col-span-3">
                <InstitutionBadge institutionName={m.institutionName} institutionType={m.institutionType} />
              </div>
              <div className="col-span-2">
                <span className={`text-xs rounded-full px-2.5 py-0.5 ${
                  m.approvalStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" :
                  m.approvalStatus === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                  "bg-red-500/10 text-red-600"
                }`}>
                  {m.approvalStatus}
                </span>
              </div>
              <span className="col-span-1 text-(--muted)">{m.rating > 0 ? m.rating.toFixed(1) : "—"}</span>
              <span className="col-span-1 text-(--muted)">{m.totalSessions}</span>
              <div className="col-span-2">
                <button type="button" onClick={() => toggleActive(m.id)}
                  className="cursor-pointer text-(--muted) hover:text-(--fg)">
                  {m.isActive ? (
                    <ToggleRight className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
