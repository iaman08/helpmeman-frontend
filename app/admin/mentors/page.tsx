"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, PauseCircle, PlayCircle, ToggleLeft, ToggleRight, AlertTriangle, X, Search, Eye } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { MentorApplicationModal } from "@/components/MentorApplicationModal";
import type { Mentor } from "@/lib/types";

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Status modal state
  const [statusModalUser, setStatusModalUser] = useState<{ id: string; name: string; email: string; currentStatus: string } | null>(null);
  const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "ON_HOLD">("ON_HOLD");
  const [holdReason, setHoldReason] = useState("");
  const [updating, setUpdating] = useState(false);

  // Reject modal state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  async function approve(id: string) {
    setActionId(id);
    try {
      await api.post(`/admin/mentors/${id}/approve`);
      setMentors((prev) =>
        prev.map((m) => m.id === id ? { ...m, approvalStatus: "APPROVED", isActive: true } : m)
      );
      if (selectedMentor?.id === id) {
        setSelectedMentor((prev) => prev ? { ...prev, approvalStatus: "APPROVED", isActive: true } : null);
      }
    } catch { alert("Failed to approve mentor"); }
    finally { setActionId(null); }
  }

  async function reject(id: string, reasonOverride?: string) {
    const finalReason = reasonOverride || rejectReason;
    setActionId(id);
    try {
      await api.post(`/admin/mentors/${id}/reject`, { reason: finalReason });
      setMentors((prev) =>
        prev.map((m) => m.id === id ? { ...m, approvalStatus: "REJECTED", isActive: false } : m)
      );
      setRejectId(null);
      setRejectReason("");
      if (selectedMentor?.id === id) {
        setSelectedMentor((prev) => prev ? { ...prev, approvalStatus: "REJECTED", isActive: false } : null);
      }
    } catch { alert("Failed to decline mentor"); }
    finally { setActionId(null); }
  }

  async function toggleActive(id: string) {
    try {
      const res = await api.post(`/admin/mentors/${id}/toggle-active`);
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

  async function handleUpdateAccountStatus() {
    if (!statusModalUser) return;
    setUpdating(true);
    try {
      await api.post(`/admin/users/${statusModalUser.id}/status`, {
        status: targetStatus,
        reason: holdReason,
      });
      setMentors((prev) =>
        prev.map((m) =>
          m.userId === statusModalUser.id
            ? { ...m, isActive: targetStatus === "ACTIVE" }
            : m
        )
      );
      setStatusModalUser(null);
      setHoldReason("");
    } catch {
      alert("Failed to update mentor account status");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Mentors</p>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>All mentors.</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{mentors.length} mentor{mentors.length !== 1 ? "s" : ""} found — manage approvals, verification & account status</p>
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
          <table className="w-full min-w-[750px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                {["Mentor", "Institution", "Status", "Rating", "Sessions", "Active", "Actions"].map((h) => (
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
                        m.approvalStatus === "APPROVED" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                        m.approvalStatus === "PENDING" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                        "bg-red-500/10 text-red-600 border border-red-500/20"
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
                      <div className="flex items-center gap-2">
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
                        {m.approvalStatus === "PENDING" && (
                          <>
                            <button
                              type="button"
                              onClick={() => approve(m.id)}
                              disabled={actionId === m.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectId(m.id)}
                              disabled={actionId === m.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Decline Reason Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border" style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--fg)]">Decline Mentor Application</h3>
              <button type="button" onClick={() => setRejectId(null)} className="text-[var(--muted)] hover:text-[var(--fg)] p-1 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Provide feedback or reason for declining. An email notification with re-application instructions will be sent to the mentor.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please verify your LinkedIn profile link or complete expertise details..."
              className="w-full rounded-xl p-3 text-sm outline-none resize-none"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
            />
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={() => setRejectId(null)} className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--fg)] border border-[var(--hairline)] bg-transparent cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={() => reject(rejectId)} disabled={actionId === rejectId} className="px-5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white cursor-pointer disabled:opacity-50">
                Confirm Decline & Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Hold Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border" style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {targetStatus === "ON_HOLD" ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
                <h3 className="text-base font-bold text-[var(--fg)]">
                  {targetStatus === "ON_HOLD" ? "Place Mentor Account On Hold" : "Reactivate Mentor Account"}
                </h3>
              </div>
              <button type="button" onClick={() => setStatusModalUser(null)} className="text-[var(--muted)] hover:text-[var(--fg)] p-1 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Updating status for mentor <strong className="text-[var(--fg)]">{statusModalUser.name}</strong> ({statusModalUser.email}).
            </p>
            {targetStatus === "ON_HOLD" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Reason for Hold:</label>
                <textarea
                  rows={3}
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="e.g. Temporary schedule review, conduct investigation, pending verification update..."
                  className="w-full rounded-xl p-3 text-sm outline-none resize-none"
                  style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={() => setStatusModalUser(null)} className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--fg)] border border-[var(--hairline)] bg-transparent cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleUpdateAccountStatus} disabled={updating} className={`px-5 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer disabled:opacity-50 ${targetStatus === "ON_HOLD" ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"}`}>
                {updating ? "Saving..." : targetStatus === "ON_HOLD" ? "Confirm Hold & Send Email" : "Confirm Reactivation"}
              </button>
            </div>
          </div>
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

