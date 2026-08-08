"use client";

import { useEffect, useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
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
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Mentors</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>All mentors.</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{mentors.length} mentor{mentors.length !== 1 ? "s" : ""} total</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                {["Name", "Institution", "Status", "Rating", "Sessions", "Active"].map((h) => (
                  <th key={h} className="text-left py-3 pr-6 text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mentors.map((m, idx) => (
                <tr
                  key={m.id}
                  className="transition-colors"
                  style={{ borderBottom: idx < mentors.length - 1 ? "1px solid var(--hairline)" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="py-4 pr-6 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold shrink-0" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)", color: "var(--fg)" }}>
                        {m.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate font-medium" style={{ color: "var(--fg)" }}>{m.displayName}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-6 text-sm">
                    <InstitutionBadge institutionName={m.institutionName} institutionType={m.institutionType} />
                  </td>
                  <td className="py-4 pr-6 text-sm">
                    <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                      m.approvalStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" :
                      m.approvalStatus === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                      "bg-red-500/10 text-red-600"
                    }`}>
                      {m.approvalStatus}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-sm" style={{ color: "var(--muted)" }}>{m.rating > 0 ? m.rating.toFixed(1) : "—"}</td>
                  <td className="py-4 pr-6 text-sm" style={{ color: "var(--muted)" }}>{m.totalSessions}</td>
                  <td className="py-4 text-sm">
                    <button type="button" onClick={() => toggleActive(m.id)} className="cursor-pointer">
                      {m.isActive ? (
                        <ToggleRight className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" style={{ color: "var(--muted)" }} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
