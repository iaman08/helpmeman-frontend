"use client";

import { useEffect, useState } from "react";
import { PauseCircle, PlayCircle, ShieldOff, CheckCircle2, AlertTriangle, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import type { User } from "@/lib/types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type TargetStatus = "ACTIVE" | "ON_HOLD" | "DISABLED";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<TargetStatus>("ON_HOLD");
  const [holdReason, setHoldReason] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

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
    } catch {
      alert("Failed to update user account status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Users</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>All users.</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {!loading ? `${total} total users` : "Manage user accounts, roles, and account status"}
        </p>
      </div>

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
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                {["Name & Email", "Role", "Account Status", "Email Verified", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 pr-6 text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const userStatus = u.status || "ACTIVE";
                const isActive = userStatus === "ACTIVE";
                const isOnHold = userStatus === "ON_HOLD";
                const isDisabled = userStatus === "DISABLED";
                return (
                  <tr
                    key={u.id}
                    className="transition-colors"
                    style={{ borderBottom: idx < users.length - 1 ? "1px solid var(--hairline)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="py-4 pr-6 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium" style={{ color: "var(--fg)" }}>{u.name}</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-sm">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
                        u.role === "SUPER_ADMIN" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                        u.role === "ADMIN" ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                        u.role === "MENTOR" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                        "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-sm">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                        userStatus === "ON_HOLD" ? "bg-amber-500/15 text-amber-600 border border-amber-500/30" :
                        userStatus === "DISABLED" ? "bg-red-500/15 text-red-600 border border-red-500/30" :
                        "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                      }`}>
                        {userStatus === "ON_HOLD" ? <PauseCircle className="w-3.5 h-3.5" /> : userStatus === "DISABLED" ? <ShieldOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {userStatus}
                      </span>
                    </td>
                    <td className="py-4 pr-6 text-sm" style={{ color: u.isEmailVerified ? "rgb(34, 197, 94)" : "var(--muted)" }}>
                      {u.isEmailVerified ? "Verified ✓" : "Unverified"}
                    </td>
                    <td className="py-4 pr-6 text-xs font-mono" style={{ color: "var(--muted)" }}>{formatDate(u.createdAt)}</td>
                    <td className="py-4 text-sm">
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Account Status Modal */}
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
    </div>
  );
}
