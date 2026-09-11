"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import {
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Trash2,
  FileText,
  ShieldAlert,
  UserCheck,
  Ban,
  Check,
} from "lucide-react";
import type { UserDeletionRequest } from "@/lib/types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SuperAdminDeletionRequestsPage() {
  const [requests, setRequests] = useState<UserDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Approval Modal State
  const [approvingRequest, setApprovingRequest] = useState<UserDeletionRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Rejection Modal State
  const [rejectingRequest, setRejectingRequest] = useState<UserDeletionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Toast / Alert Notification State
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/super-admin/deletion-requests", {
        params: {
          q: search || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
          page,
          limit: 15,
        },
      });
      setRequests(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch deletion requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleApprove = async () => {
    if (!approvingRequest) return;
    setIsApproving(true);
    try {
      await api.post(`/super-admin/deletion-requests/${approvingRequest.id}/approve`, {
        notes: approvalNotes.trim() || undefined,
      });
      showToast(`User ${approvingRequest.user?.name || ""} account successfully deleted & deactivated.`);
      setApprovingRequest(null);
      setApprovalNotes("");
      fetchRequests();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to approve deletion request.";
      showToast(msg, "error");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Please specify a reason for rejecting this request.");
      return;
    }
    setIsRejecting(true);
    setRejectionError("");
    try {
      await api.post(`/super-admin/deletion-requests/${rejectingRequest.id}/reject`, {
        reason: rejectionReason.trim(),
      });
      showToast(`Deletion request for ${rejectingRequest.user?.name || ""} rejected.`);
      setRejectingRequest(null);
      setRejectionReason("");
      fetchRequests();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to reject deletion request.";
      setRejectionError(msg);
    } finally {
      setIsRejecting(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
            Super Admin
          </p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-semibold border border-rose-500/20">
            Authorization Queue
          </span>
        </div>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>
          User Deletion Approvals.
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Review and approve or reject account deletion requests submitted by platform administrators.
        </p>
      </div>

      {/* Notification Toast */}
      {toast && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-sm animate-in fade-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:opacity-75 cursor-pointer bg-transparent border-none text-current"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search by user name, email, or requester admin..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              color: "var(--fg)",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-2xl px-5 py-3 text-sm outline-none cursor-pointer font-medium"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
            color: "var(--fg)",
          }}
        >
          <option value="PENDING" style={{ background: "var(--bg)" }}>Pending Approvals</option>
          <option value="All" style={{ background: "var(--bg)" }}>All Requests</option>
          <option value="APPROVED" style={{ background: "var(--bg)" }}>Approved Deletions</option>
          <option value="REJECTED" style={{ background: "var(--bg)" }}>Rejected Requests</option>
        </select>
      </div>

      {/* Table Container */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[900px]">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                  color: "var(--muted)",
                }}
                className="text-[10px] uppercase tracking-[0.2em] font-semibold"
              >
                <th className="px-6 py-4">Target User</th>
                <th className="px-6 py-4">Reason for Deletion</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Review Details</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-44" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-56" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-28" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-5 w-28" /></td>
                      <td className="px-6 py-5"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm" style={{ color: "var(--muted)" }}>
                    <div className="flex flex-col items-center gap-3">
                      <UserX className="w-10 h-10 text-[var(--muted)] opacity-40" />
                      <p className="font-semibold text-base" style={{ color: "var(--fg)" }}>
                        No deletion requests found.
                      </p>
                      <p className="text-xs max-w-sm" style={{ color: "var(--muted)" }}>
                        {statusFilter === "PENDING"
                          ? "Great job! There are no pending deletion requests requiring your review."
                          : "No deletion requests match the current search or status filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((r, idx) => {
                  const isPending = r.status === "PENDING";
                  const isApproved = r.status === "APPROVED";
                  const isRejected = r.status === "REJECTED";

                  return (
                    <tr
                      key={r.id}
                      className="transition-colors"
                      style={{
                        borderBottom: idx < requests.length - 1 ? "1px solid var(--hairline)" : "none",
                      }}
                      onMouseEnter={(el) => (el.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                      onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                    >
                      {/* Target User */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>
                            {r.user?.name || "Deleted User"}
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            {r.user?.email || "N/A"}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                              r.user?.role === "SUPER_ADMIN" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                              r.user?.role === "ADMIN" ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                              r.user?.role === "MENTOR" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                              "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            }`}>
                              {r.user?.role}
                            </span>
                            <span className="text-[10px] text-[var(--muted)]">
                              Status: {r.user?.status || "ACTIVE"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-6 py-4 max-w-[260px]">
                        <p className="text-xs italic bg-stone-500/5 p-2.5 rounded-xl border border-[var(--hairline)] leading-relaxed" style={{ color: "var(--fg)" }}>
                          "{r.reason}"
                        </p>
                      </td>

                      {/* Requester */}
                      <td className="px-6 py-4 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold" style={{ color: "var(--fg)" }}>
                            {r.requestedBy?.name || "Admin"}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                            {r.requestedBy?.email}
                          </span>
                          <span className="text-[10px] uppercase text-[var(--muted)] font-mono">
                            {r.requestedBy?.role}
                          </span>
                        </div>
                      </td>

                      {/* Requested At */}
                      <td className="px-6 py-4 text-xs font-mono text-[var(--muted)]">
                        {formatDate(r.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 ${
                            isPending
                              ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                              : isApproved
                              ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                          }`}
                        >
                          {isPending && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                          {isApproved && <Check className="w-3.5 h-3.5" />}
                          {isRejected && <XCircle className="w-3.5 h-3.5" />}
                          {r.status}
                        </span>
                      </td>

                      {/* Review Details */}
                      <td className="px-6 py-4 text-xs">
                        {r.reviewedBy ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium" style={{ color: "var(--fg)" }}>
                              By {r.reviewedBy.name}
                            </span>
                            {r.reviewNotes && (
                              <span className="text-[11px] italic line-clamp-2" style={{ color: "var(--muted)" }}>
                                "{r.reviewNotes}"
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[var(--muted)]">
                              {r.reviewedAt ? formatDate(r.reviewedAt) : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--muted)] italic">Pending Super Admin review</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingRequest(r);
                                setRejectionReason("");
                                setRejectionError("");
                              }}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-600 dark:text-stone-300 border border-[var(--hairline)] hover:bg-stone-500/10 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setApprovingRequest(r);
                                setApprovalNotes("");
                              }}
                              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Approve Deletion
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--muted)] font-mono">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderTop: "1px solid var(--hairline)" }}
          >
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              Page {page} of {totalPages} · {total} requests
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Approval Confirmation Modal */}
      {approvingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border"
            style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-[var(--fg)]">
                  Approve User Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="text-[var(--muted)] hover:text-[var(--fg)] p-1 bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                <span className="font-semibold">Permanent Account Deactivation</span>
                <span>
                  Approving this request will immediately set the user's status to <strong>DELETED</strong>,
                  revoke all active authentication tokens/sessions, and unpublish mentor profiles.
                </span>
              </div>
            </div>

            {/* Target User Details */}
            <div
              className="p-3.5 rounded-xl border flex flex-col gap-2 text-xs"
              style={{ background: "color-mix(in srgb, var(--fg) 2%, transparent)", borderColor: "var(--hairline)" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm" style={{ color: "var(--fg)" }}>
                  {approvingRequest.user?.name}
                </span>
                <span className="font-mono text-red-500 font-semibold">{approvingRequest.user?.role}</span>
              </div>
              <div className="text-[var(--muted)]">{approvingRequest.user?.email}</div>
              <div className="pt-2 border-t border-[var(--hairline)] flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Admin's Reason:</span>
                <p className="italic text-[var(--fg)]">"{approvingRequest.reason}"</p>
                <span className="text-[10px] text-[var(--muted)]">
                  Requested by: {approvingRequest.requestedBy?.name} ({approvingRequest.requestedBy?.email})
                </span>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Approval Notes (Optional):
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Optional notes or reference regarding this deletion approval..."
                className="w-full rounded-xl p-3 text-sm outline-none transition-colors"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                  color: "var(--fg)",
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--fg)] border border-[var(--hairline)] bg-transparent hover:bg-stone-500/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isApproving ? "Executing Deletion..." : "Confirm & Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border"
            style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500">
                <XCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-[var(--fg)]">
                  Reject Deletion Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="text-[var(--muted)] hover:text-[var(--fg)] p-1 bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Rejecting this deletion request will preserve the account for{" "}
              <strong className="text-[var(--fg)]">{rejectingRequest.user?.name}</strong>. The requesting admin will be
              notified with your explanation.
            </p>

            {/* Rejection Reason Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                <span>Reason for Rejection <span className="text-rose-500">*</span></span>
                <span className="text-[10px] font-normal lowercase opacity-70">sent to requesting admin</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectionError) setRejectionError("");
                }}
                placeholder="Explain why this deletion request cannot be approved at this time..."
                className="w-full rounded-xl p-3 text-sm outline-none transition-colors"
                style={{
                  border: rejectionError ? "1px solid rgb(244 63 94)" : "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                  color: "var(--fg)",
                }}
              />
              {rejectionError && (
                <span className="text-xs text-rose-500 font-medium">{rejectionError}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--fg)] border border-[var(--hairline)] bg-transparent hover:bg-stone-500/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting}
                className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-amber-600 hover:bg-amber-500 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
