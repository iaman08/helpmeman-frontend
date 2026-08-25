"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { MentorApplicationModal } from "@/components/MentorApplicationModal";
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Eye } from "lucide-react";
import type { Mentor } from "@/lib/types";

export default function SuperAdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMentors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status, page]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/mentors`, {
        params: {
          q: search.trim() || undefined,
          status: status !== "All" ? status : undefined,
          page,
          limit: 20,
        },
      });
      setMentors(res.data.mentors || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch mentors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Approve this mentor?")) return;
    try {
      await api.post(`/admin/mentors/${id}/approve`);
      fetchMentors();
      if (selectedMentor?.id === id) setSelectedMentor(null);
    } catch (err) {
      alert("Failed to approve mentor");
    }
  };

  const handleReject = async (overrideId?: string, overrideReason?: string) => {
    const targetId = overrideId || rejectId;
    const finalReason = overrideReason || rejectReason;
    if (!targetId || !finalReason.trim()) return;
    try {
      await api.post(`/admin/mentors/${targetId}/reject`, { reason: finalReason.trim() });
      setRejectId(null);
      setRejectReason("");
      fetchMentors();
      if (selectedMentor?.id === targetId) setSelectedMentor(null);
    } catch (err) {
      alert("Failed to reject mentor");
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Mentors.</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search by name, email, company, or institution..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              color: "var(--fg)",
            }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
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

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--muted)" }} className="text-xs uppercase tracking-wider font-medium">
                <th className="px-6 py-4">Mentor</th>
                <th className="px-6 py-4">Institution</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : mentors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>No mentors found.</td>
                </tr>
              ) : (
                mentors.map((mentor, idx) => {
                  const displayName = mentor.displayName || mentor.user?.name || "Mentor";
                  return (
                    <tr key={mentor.id} className="transition-colors" style={{ borderBottom: idx < mentors.length - 1 ? "1px solid var(--hairline)" : "none" }}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold" style={{ color: "var(--fg)" }}>{displayName}</span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>{mentor.user?.email || mentor.institutionEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium" style={{ color: "var(--muted)" }}>
                        <InstitutionBadge institutionName={mentor.institutionName} institutionType={mentor.institutionType} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={mentor.approvalStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs font-medium" style={{ color: "var(--muted)" }}>
                          <span>Sessions: {mentor.totalSessions ?? 0}</span>
                          <span>Rating: {mentor.rating ? mentor.rating.toFixed(1) : "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMentor(mentor)}
                            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                            style={{
                              background: "color-mix(in srgb, var(--fg) 6%, transparent)",
                              color: "var(--fg)",
                            }}
                            title="View Application"
                          >
                            <Eye className="h-4 w-4 text-amber-500" />
                          </button>
                          {mentor.approvalStatus === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(mentor.id)}
                                className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setRejectId(mentor.id)}
                                className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--hairline)" }}>
            <span className="text-sm" style={{ color: "var(--muted)" }}>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl w-full max-w-md flex flex-col gap-4" style={{ border: "1px solid var(--hairline)", background: "var(--bg)", color: "var(--fg)" }}>
            <h3 className="font-display text-xl">Reject Mentor</h3>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Please provide a reason for rejecting this application.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-xl p-3 text-sm outline-none min-h-[100px]"
              style={{
                border: "1px solid var(--hairline)",
                background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                color: "var(--fg)",
              }}
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject()}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 cursor-pointer shadow"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Application Modal */}
      {selectedMentor && (
        <MentorApplicationModal
          mentor={selectedMentor}
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onApprove={(id) => handleApprove(id)}
          onReject={(id, reason) => handleReject(id, reason)}
        />
      )}
    </div>
  );
}

