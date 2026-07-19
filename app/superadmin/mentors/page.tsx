"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

interface Mentor {
  id: string;
  user: { name: string; email: string };
  institution: string;
  approvalStatus: string;
  sessionsCompleted: number;
  averageRating: number;
  createdAt: string;
}

export default function SuperAdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

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
          q: search,
          status: status !== "All" ? status : undefined,
          page,
          limit: 20
        }
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
    } catch (err) {
      alert("Failed to approve mentor");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    try {
      await api.post(`/admin/mentors/${rejectId}/reject`, { reason: rejectReason });
      setRejectId(null);
      setRejectReason("");
      fetchMentors();
    } catch (err) {
      alert("Failed to reject mentor");
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Super Admin</p>
        <h1 className="font-display text-4xl leading-tight">Mentors.</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--muted)" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-(--fg)/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--fg)/20"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-(--fg)/5 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--fg)/20"
        >
          <option value="All">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-(--fg)/[0.02] rounded-2xl overflow-hidden border border-(--hairline)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-(--muted) bg-(--fg)/5">
              <tr>
                <th className="px-6 py-4 font-medium">Mentor</th>
                <th className="px-6 py-4 font-medium">Institution</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--hairline)">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                  </tr>
                ))
              ) : mentors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-(--muted)">No mentors found.</td>
                </tr>
              ) : (
                mentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-(--fg)/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-(--fg)">{mentor.user?.name}</span>
                        <span className="text-xs text-(--muted)">{mentor.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-(--muted)">{mentor.institution || '-'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={mentor.approvalStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-(--muted)">
                        <span>Sessions: {mentor.sessionsCompleted}</span>
                        <span>Rating: {mentor.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {mentor.approvalStatus === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(mentor.id)}
                            className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setRejectId(mentor.id)}
                            className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-(--hairline)">
            <span className="text-sm text-(--muted)">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded bg-(--fg)/5 disabled:opacity-50 hover:bg-(--fg)/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded bg-(--fg)/5 disabled:opacity-50 hover:bg-(--fg)/10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-(--bg) p-6 rounded-2xl w-full max-w-md flex flex-col gap-4 border border-(--hairline)">
            <h3 className="font-display text-xl">Reject Mentor</h3>
            <p className="text-sm text-(--muted)">Please provide a reason for rejecting this application.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-(--fg)/5 border-none rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-red-500/50 min-h-[100px]"
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-(--fg)/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
