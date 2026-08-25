"use client";

import { useEffect, useState } from "react";
import { ToggleLeft, ToggleRight, Search, Eye } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { MentorApplicationModal } from "@/components/MentorApplicationModal";
import type { Mentor } from "@/lib/types";

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMentors();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const fetchMentors = () => {
    setLoading(true);
    api.get("/admin/mentors", {
      params: {
        q: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        limit: 50,
      },
    })
      .then((res) => setMentors(res.data.mentors ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  async function toggleActive(id: string) {
    try {
      const res = await api.put(`/admin/mentors/${id}/toggle-active`);
      setMentors((prev) =>
        prev.map((m) => m.id === id ? { ...m, isActive: res.data.mentor?.isActive ?? !m.isActive } : m)
      );
      if (selectedMentor?.id === id) {
        setSelectedMentor((prev) => prev ? { ...prev, isActive: res.data.mentor?.isActive ?? !prev.isActive } : null);
      }
    } catch {
      alert("Failed to toggle active status");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Mentors</p>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>All mentors.</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{mentors.length} mentor{mentors.length !== 1 ? "s" : ""} found</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search by name, email, company, or institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              color: "var(--fg)",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
            color: "var(--fg)",
          }}
        >
          <option value="All" style={{ background: "var(--bg)" }}>All Statuses</option>
          <option value="PENDING" style={{ background: "var(--bg)" }}>Pending</option>
          <option value="APPROVED" style={{ background: "var(--bg)" }}>Approved</option>
          <option value="REJECTED" style={{ background: "var(--bg)" }}>Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : mentors.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-2"
          style={{ border: "1px dashed var(--hairline)", color: "var(--muted)" }}
        >
          <p className="text-sm font-medium">No mentors match your search.</p>
        </div>
      ) : (
        <div
          className="w-full overflow-x-auto rounded-2xl"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 1%, transparent)",
          }}
        >
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                {["Mentor", "Institution", "Status", "Rating", "Sessions", "Active", "Action"].map((h) => (
                  <th key={h} className="text-left py-3.5 px-5 text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mentors.map((m, idx) => {
                const displayName = m.displayName || m.user?.name || "Mentor";
                const initials = displayName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={m.id}
                    className="transition-colors"
                    style={{ borderBottom: idx < mentors.length - 1 ? "1px solid var(--hairline)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="py-4 px-5 text-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shrink-0"
                          style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)", color: "var(--fg)", border: "1px solid var(--hairline)" }}
                        >
                          {m.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.avatar} alt={displayName} className="h-full w-full rounded-xl object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate font-semibold" style={{ color: "var(--fg)" }}>{displayName}</span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>{m.user?.email || m.institutionEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm">
                      <InstitutionBadge institutionName={m.institutionName} institutionType={m.institutionType} />
                    </td>
                    <td className="py-4 px-5 text-sm">
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                        m.approvalStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" :
                        m.approvalStatus === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                        "bg-red-500/10 text-red-600"
                      }`}>
                        {m.approvalStatus}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-sm" style={{ color: "var(--muted)" }}>{m.rating > 0 ? m.rating.toFixed(1) : "—"}</td>
                    <td className="py-4 px-5 text-sm" style={{ color: "var(--muted)" }}>{m.totalSessions}</td>
                    <td className="py-4 px-5 text-sm">
                      <button type="button" onClick={() => toggleActive(m.id)} className="cursor-pointer">
                        {m.isActive ? (
                          <ToggleRight className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" style={{ color: "var(--muted)" }} />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-5 text-sm">
                      <button
                        type="button"
                        onClick={() => setSelectedMentor(m)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                        style={{
                          background: "color-mix(in srgb, var(--fg) 6%, transparent)",
                          color: "var(--fg)",
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 text-amber-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mentor Application Details Modal */}
      {selectedMentor && (
        <MentorApplicationModal
          mentor={selectedMentor}
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onApprove={() => {
            fetchMentors();
          }}
          onReject={() => {
            fetchMentors();
          }}
        />
      )}
    </div>
  );
}

