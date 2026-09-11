"use client";

import { useEffect, useState } from "react";
import {
  PauseCircle,
  PlayCircle,
  ShieldOff,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Clock,
  UserX,
  FileText,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import type { User, UserDeletionRequest } from "@/lib/types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type TargetStatus = "ACTIVE" | "ON_HOLD" | "DISABLED";
type TabType = "users" | "requests";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");

  // Users Tab State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Status Modal State
  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<TargetStatus>("ON_HOLD");
  const [holdReason, setHoldReason] = useState("");
  const [updating, setUpdating] = useState(false);

  // Deletion Request Modal State
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Deletion Requests Tab State
  const [requests, setRequests] = useState<UserDeletionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState("All");
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [requestsTotal, setRequestsTotal] = useState(0);

  // Success Message Banner State
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "users") {
      const timer = setTimeout(() => { fetchUsers(); }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchDeletionRequests();
    }
  }, [activeTab, search, statusFilter, page, requestStatusFilter, requestsPage]);

  const fetchUsers = () => {
    setLoading(true);
    api.get("/admin/users", {
      params: {
        q: search || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        page,
        limit: 20,
      },
    })
      .then((res) => {
        setUsers(res.data.users ?? []);
        setTotalPages(res.data.totalPages ?? 1);
        setTotal(res.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchDeletionRequests = () => {
    setRequestsLoading(true);
    api.get("/admin/users/deletion-requests", {
      params: {
        status: requestStatusFilter !== "All" ? requestStatusFilter : undefined,
        page: requestsPage,
        limit: 20,
      },
    })
      .then((res) => {
        setRequests(res.data.items ?? []);
        setRequestsTotalPages(res.data.totalPages ?? 1);
        setRequestsTotal(res.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setRequestsLoading(false));
  };

  const openStatusModal = (user: User, status: TargetStatus) => {
    setStatusModalUser(user);
    setTargetStatus(status);
    setHoldReason("");
  };

  const handleUpdateStatus = async () => {
    if (!statusModalUser) return;
    setUpdating(true);
    try {
      await api.post(`/admin/users/${statusModalUser.id}/status`, {
        status: targetStatus,
        reason: holdReason,
      });
      fetchUsers();
      setStatusModalUser(null);
      setHoldReason("");
      showBanner(`Status for ${statusModalUser.name} updated to ${targetStatus}`);
    } catch {
      alert("Failed to update user account status.");
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setDeleteModalUser(user);
    setDeleteReason("");
    setDeleteError("");
  };

  const handleSubmitDeletionRequest = async () => {
    if (!deleteModalUser) return;
    if (!deleteReason.trim()) {
      setDeleteError("Please provide a reason for the deletion request.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await api.post(`/admin/users/${deleteModalUser.id}/request-deletion`, {
        reason: deleteReason.trim(),
      });
      showBanner(`Deletion request for ${deleteModalUser.name} submitted successfully to Super Admin.`);
      setDeleteModalUser(null);
      setDeleteReason("");
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to submit deletion request.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const showBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 5000);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Users</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>All users.</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Manage user accounts, roles, statuses, and submit deletion requests for Super Admin review.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="p-1 text-emerald-600 hover:opacity-75 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: "var(--hairline)" }}>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "users"
              ? "border-red-500 text-red-500 font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          All Users
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-500/10 font-mono">
            {total}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "requests"
              ? "border-red-500 text-red-500 font-semibold"
              : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          Deletion Requests
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-mono">
            Approvals
          </span>
        </button>
      </div>

      {activeTab === "users" && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)", color: "var(--fg)" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)", color: "var(--fg)" }}
            >
              <option value="All" style={{ background: "var(--bg)" }}>All Statuses</option>
              <option value="ACTIVE" style={{ background: "var(--bg)" }}>Active</option>
              <option value="ON_HOLD" style={{ background: "var(--bg)" }}>On Hold</option>
              <option value="DISABLED" style={{ background: "var(--bg)" }}>Disabled</option>
              <option value="DELETED" style={{ background: "var(--bg)" }}>Deleted</option>
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--hairline)" }}>
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    {["Name & Email", "Role", "Account Status", "Last Device & IP", "Email Verified", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3.5 px-4 text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: "var(--muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm" style={{ color: "var(--muted)" }}>
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, idx) => {
                      const userStatus = u.status || "ACTIVE";
                      const isActive = userStatus === "ACTIVE";
                      const isOnHold = userStatus === "ON_HOLD";
                      const isDisabled = userStatus === "DISABLED";
                      const isDeleted = userStatus === "DELETED";
                      const pendingDeletion = (u as any).pendingDeletion;
                      const isSuperAdmin = u.role === "SUPER_ADMIN";
                      const lastDevice = (u as any).lastBrowser || (u as any).lastOs ? `${(u as any).lastBrowser || 'Browser'} on ${(u as any).lastOs || 'OS'}` : "Web Browser";
                      const lastIp = (u as any).lastIp || "127.0.0.1";

                      return (
                        <tr
                          key={u.id}
                          className="transition-colors"
                          style={{ borderBottom: idx < users.length - 1 ? "1px solid var(--hairline)" : "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="py-4 px-4 text-sm">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium" style={{ color: "var(--fg)" }}>{u.name}</span>
                              <span className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
                              u.role === "SUPER_ADMIN" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                              u.role === "ADMIN" ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                              u.role === "MENTOR" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                              "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                                isDeleted ? "bg-zinc-500/15 text-zinc-500 border border-zinc-500/30" :
                                isOnHold ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" :
                                isDisabled ? "bg-red-500/15 text-red-600 border border-red-500/30" :
                                "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                              }`}>
                                {isDeleted ? <UserX className="w-3.5 h-3.5" /> :
                                 isOnHold ? <PauseCircle className="w-3.5 h-3.5" /> :
                                 isDisabled ? <ShieldOff className="w-3.5 h-3.5" /> :
                                 <CheckCircle2 className="w-3.5 h-3.5" />}
                                {userStatus}
                              </span>

                              {pendingDeletion && !isDeleted && (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold inline-flex items-center gap-1 bg-amber-500/15 text-amber-600 border border-amber-500/25"
                                  title={`Requested by ${pendingDeletion.requestedBy?.name || 'Admin'}: ${pendingDeletion.reason}`}
                                >
                                  <Clock className="w-3 h-3 animate-pulse" />
                                  Deletion Pending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium truncate max-w-[170px]" style={{ color: "var(--fg)" }}>
                                {lastDevice}
                              </span>
                              <span className="font-mono text-[10px] opacity-70" style={{ color: "var(--muted)" }}>
                                IP: {lastIp}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm" style={{ color: u.isEmailVerified ? "rgb(34, 197, 94)" : "var(--muted)" }}>
                            {u.isEmailVerified ? "Verified ✓" : "Unverified"}
                          </td>
                          <td className="py-4 px-4 text-xs font-mono" style={{ color: "var(--muted)" }}>{formatDate(u.createdAt)}</td>
                          <td className="py-4 px-4 text-sm">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {!isDeleted && (
                                <>
                                  {!isActive && (
                                    <button
                                      type="button"
                                      onClick={() => openStatusModal(u, "ACTIVE")}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors cursor-pointer border border-emerald-500/20"
                                    >
                                      <PlayCircle className="w-3 h-3" /> Reactivate
                                    </button>
                                  )}
                                  {!isOnHold && (
                                    <button
                                      type="button"
                                      onClick={() => openStatusModal(u, "ON_HOLD")}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-500/20"
                                    >
                                      <PauseCircle className="w-3 h-3" /> Hold
                                    </button>
                                  )}
                                  {!isDisabled && (
                                    <button
                                      type="button"
                                      onClick={() => openStatusModal(u, "DISABLED")}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20"
                                    >
                                      <ShieldOff className="w-3 h-3" /> Disable
                                    </button>
                                  )}

                                  {/* Delete Action: Requires Super Admin approval */}
                                  {!isSuperAdmin && (
                                    pendingDeletion ? (
                                      <span
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg text-amber-600 bg-amber-500/10 border border-amber-500/20 opacity-90 cursor-default"
                                        title="Deletion request already submitted to Super Admin"
                                      >
                                        <Clock className="w-3 h-3" /> Pending Approval
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => openDeleteModal(u)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer border border-rose-500/20"
                                        title="Request user deletion (requires Super Admin approval)"
                                      >
                                        <Trash2 className="w-3 h-3" /> Delete
                                      </button>
                                    )
                                  )}
                                </>
                              )}

                              {isDeleted && (
                                <span className="text-[11px] text-[var(--muted)] font-mono">
                                  Account Deleted
                                </span>
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
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-2" style={{ borderTop: "1px solid var(--hairline)" }}>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                Page {page} of {totalPages} · {total} users
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
        </>
      )}

      {/* Deletion Requests Tracking Tab */}
      {activeTab === "requests" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              Status of deletion requests submitted to Super Admin for approval.
            </div>
            <select
              value={requestStatusFilter}
              onChange={(e) => { setRequestStatusFilter(e.target.value); setRequestsPage(1); }}
              className="rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)", color: "var(--fg)" }}
            >
              <option value="All" style={{ background: "var(--bg)" }}>All Statuses</option>
              <option value="PENDING" style={{ background: "var(--bg)" }}>Pending Approval</option>
              <option value="APPROVED" style={{ background: "var(--bg)" }}>Approved</option>
              <option value="REJECTED" style={{ background: "var(--bg)" }}>Rejected</option>
            </select>
          </div>

          {requestsLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border flex flex-col items-center gap-3" style={{ borderColor: "var(--hairline)" }}>
              <FileText className="w-8 h-8 text-[var(--muted)] opacity-50" />
              <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>No deletion requests found.</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Requests submitted from the "All Users" tab will appear here.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--hairline)" }}>
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    {["Target User", "Reason for Deletion", "Requested By", "Status", "Super Admin Review", "Submitted At"].map((h) => (
                      <th key={h} className="text-left py-3.5 px-4 text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: "var(--muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, idx) => {
                    const isPending = r.status === "PENDING";
                    const isApproved = r.status === "APPROVED";
                    const isRejected = r.status === "REJECTED";

                    return (
                      <tr
                        key={r.id}
                        className="transition-colors"
                        style={{ borderBottom: idx < requests.length - 1 ? "1px solid var(--hairline)" : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="py-4 px-4 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium" style={{ color: "var(--fg)" }}>{r.user?.name || "Deleted User"}</span>
                            <span className="text-xs" style={{ color: "var(--muted)" }}>{r.user?.email || "N/A"}</span>
                            <span className="text-[10px] uppercase tracking-wider text-red-500 mt-0.5">{r.user?.role}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm max-w-[280px]">
                          <p className="text-xs italic bg-stone-500/5 p-2 rounded-lg border border-[var(--hairline)]" style={{ color: "var(--fg)" }}>
                            "{r.reason}"
                          </p>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className="font-medium" style={{ color: "var(--fg)" }}>{r.requestedBy?.name || "Admin"}</span>
                          <span className="block text-[10px]" style={{ color: "var(--muted)" }}>{r.requestedBy?.email}</span>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 ${
                            isPending ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" :
                            isApproved ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" :
                            "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                          }`}>
                            {isPending && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                            {isApproved && <Check className="w-3.5 h-3.5" />}
                            {isRejected && <XCircle className="w-3.5 h-3.5" />}
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          {r.reviewedBy ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium" style={{ color: "var(--fg)" }}>
                                By {r.reviewedBy.name}
                              </span>
                              {r.reviewNotes && (
                                <span className="text-[11px] italic" style={{ color: "var(--muted)" }}>
                                  Note: "{r.reviewNotes}"
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-[var(--muted)]">
                                {r.reviewedAt ? formatDate(r.reviewedAt) : ""}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs italic text-[var(--muted)]">Awaiting Super Admin</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs font-mono text-[var(--muted)]">
                          {formatDate(r.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Requests Pagination */}
          {!requestsLoading && requestsTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-2" style={{ borderTop: "1px solid var(--hairline)" }}>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                Page {requestsPage} of {requestsTotalPages} · {requestsTotal} requests
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setRequestsPage((p) => Math.max(1, p - 1))}
                  disabled={requestsPage === 1}
                  className="p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                  style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setRequestsPage((p) => Math.min(requestsTotalPages, p + 1))}
                  disabled={requestsPage === requestsTotalPages}
                  className="p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                  style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Status Modal (Hold / Disable / Reactivate) */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border"
            style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {targetStatus === "ON_HOLD" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : targetStatus === "DISABLED" ? (
                  <ShieldOff className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                <h3 className="text-base font-bold text-[var(--fg)]">
                  {targetStatus === "ON_HOLD" ? "Place Account On Hold" :
                   targetStatus === "DISABLED" ? "Disable Account" : "Reactivate Account"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="text-[var(--muted)] hover:text-[var(--fg)] p-1 bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Updating account status for <strong className="text-[var(--fg)]">{statusModalUser.name}</strong> ({statusModalUser.email})
              from <strong className="text-[var(--fg)]">{statusModalUser.status || "ACTIVE"}</strong> → <strong className="text-[var(--fg)]">{targetStatus}</strong>.
              An automated email notification will be sent.
            </p>

            {(targetStatus === "ON_HOLD" || targetStatus === "DISABLED") && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {targetStatus === "ON_HOLD" ? "Reason for Hold / Issue Details:" : "Reason for Disabling:"}
                </label>
                <textarea
                  rows={3}
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder={
                    targetStatus === "ON_HOLD"
                      ? "e.g. Conduct review, intake verification pending, reported policy issue..."
                      : "e.g. Repeated violations, fraudulent activity, admin request..."
                  }
                  className="w-full rounded-xl p-3 text-sm outline-none transition-colors"
                  style={{
                    border: "1px solid var(--hairline)",
                    background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                    color: "var(--fg)",
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--fg)] border border-[var(--hairline)] bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating}
                className={`px-5 py-2 text-xs font-semibold rounded-xl text-white transition-all cursor-pointer disabled:opacity-50 ${
                  targetStatus === "ON_HOLD" ? "bg-amber-600 hover:bg-amber-500" :
                  targetStatus === "DISABLED" ? "bg-red-600 hover:bg-red-500" :
                  "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {updating ? "Saving & Notifying..." :
                 targetStatus === "ON_HOLD" ? "Confirm Hold & Send Email" :
                 targetStatus === "DISABLED" ? "Disable & Notify User" :
                 "Confirm Reactivation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request User Deletion Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border"
            style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500">
                <Trash2 className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-[var(--fg)]">
                  Request User Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="text-[var(--muted)] hover:text-[var(--fg)] p-1 bg-transparent border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <span className="font-semibold">Requires Super Admin Authorization</span>
                <span>
                  Admin deletions cannot be executed immediately. This will submit a formal deletion request
                  to the <strong>Super Admin</strong> for review and final approval.
                </span>
              </div>
            </div>

            {/* Target User Summary Card */}
            <div
              className="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
              style={{ background: "color-mix(in srgb, var(--fg) 2%, transparent)", borderColor: "var(--hairline)" }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{deleteModalUser.name}</span>
                <span style={{ color: "var(--muted)" }}>{deleteModalUser.email}</span>
                <span className="text-[10px] text-[var(--muted)] mt-1 font-mono">
                  Joined: {formatDate(deleteModalUser.createdAt)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                  deleteModalUser.role === "SUPER_ADMIN" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                  deleteModalUser.role === "ADMIN" ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                  deleteModalUser.role === "MENTOR" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                  "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                }`}>
                  {deleteModalUser.role}
                </span>
                <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
                  Status: {deleteModalUser.status || "ACTIVE"}
                </span>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
                <span>Reason for Deletion Request <span className="text-rose-500">*</span></span>
                <span className="text-[10px] font-normal lowercase opacity-70">visible to super admin</span>
              </label>
              <textarea
                rows={4}
                value={deleteReason}
                onChange={(e) => {
                  setDeleteReason(e.target.value);
                  if (deleteError) setDeleteError("");
                }}
                placeholder="Specify the reason for requesting account deletion (e.g. Terms violation, account compromise, fraudulent activity, user request)..."
                className="w-full rounded-xl p-3 text-sm outline-none transition-colors"
                style={{
                  border: deleteError ? "1px solid rgb(244 63 94)" : "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                  color: "var(--fg)",
                }}
              />
              {deleteError && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {deleteError}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--fg)] border border-[var(--hairline)] bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDeletionRequest}
                disabled={deleting}
                className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? "Submitting to Super Admin..." : "Submit Request to Super Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
