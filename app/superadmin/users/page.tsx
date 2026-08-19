"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, ChevronLeft, ChevronRight, UserCog, PauseCircle, PlayCircle, AlertTriangle, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Status modal
  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "ON_HOLD" | "DISABLED">("ON_HOLD");
  const [holdReason, setHoldReason] = useState("");
  const [updating, setUpdating] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, role, status, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/users`, {
        params: {
          q: search,
          role: role !== "All" ? role : undefined,
          status: status !== "All" ? status : undefined,
          page,
          limit: 20
        }
      });
      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    try {
      await api.post(`/super-admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert("Failed to update role");
    }
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
    } catch (err) {
      alert("Failed to update account status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Users.</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              color: "var(--fg)",
            }}
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
            color: "var(--fg)",
          }}
        >
          <option value="All" style={{ background: "var(--bg)" }}>All Roles</option>
          <option value="STUDENT" style={{ background: "var(--bg)" }}>Student</option>
          <option value="MENTOR" style={{ background: "var(--bg)" }}>Mentor</option>
          <option value="ADMIN" style={{ background: "var(--bg)" }}>Admin</option>
          <option value="SUPER_ADMIN" style={{ background: "var(--bg)" }}>Super Admin</option>
        </select>
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
          <option value="ACTIVE" style={{ background: "var(--bg)" }}>Active</option>
          <option value="ON_HOLD" style={{ background: "var(--bg)" }}>On Hold</option>
          <option value="DISABLED" style={{ background: "var(--bg)" }}>Disabled</option>
          <option value="DELETED" style={{ background: "var(--bg)" }}>Deleted</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--muted)" }} className="text-xs uppercase tracking-wider font-medium">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>No users found.</td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const isOnHold = user.status === "ON_HOLD";
                  return (
                    <React.Fragment key={user.id}>
                      <tr 
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: idx < users.length - 1 || expandedId === user.id ? "1px solid var(--hairline)" : "none" }}
                        onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                        onMouseEnter={(el) => (el.currentTarget.style.background = "color-mix(in srgb, var(--fg) 3%, transparent)")}
                        onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium" style={{ color: "var(--fg)" }}>{user.name}</span>
                            <span className="text-xs" style={{ color: "var(--muted)" }}>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
                            user.role === 'SUPER_ADMIN' ? 'bg-violet-500/10 text-violet-600' :
                            user.role === 'ADMIN' ? 'bg-red-500/10 text-red-600' :
                            user.role === 'MENTOR' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-blue-500/10 text-blue-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-4 text-xs font-mono" style={{ color: "var(--muted)" }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {isOnHold ? (
                            <button
                              type="button"
                              onClick={() => {
                                setStatusModalUser(user);
                                setTargetStatus("ACTIVE");
                                setHoldReason("");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors cursor-pointer border border-emerald-500/20"
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> Reactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setStatusModalUser(user);
                                setTargetStatus("ON_HOLD");
                                setHoldReason("");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-500/20"
                            >
                              <PauseCircle className="w-3.5 h-3.5" /> Put On Hold
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedId === user.id && (
                        <tr style={{ background: "color-mix(in srgb, var(--fg) 2%, transparent)", borderBottom: "1px solid var(--hairline)" }}>
                          <td colSpan={5} className="px-6 py-4 border-l-4 border-violet-500">
                            <div className="flex flex-col gap-3">
                              <h4 className="text-xs uppercase tracking-wider font-semibold flex items-center gap-2" style={{ color: "var(--fg)" }}>
                                <UserCog className="h-3.5 w-3.5 text-violet-500" /> Manage Role
                              </h4>
                              <div className="flex gap-2">
                                {['STUDENT', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].map(r => (
                                  <button
                                    key={r}
                                    onClick={() => handleRoleChange(user.id, r)}
                                    disabled={user.role === r}
                                    className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-40"
                                    style={{
                                      border: "1px solid var(--hairline)",
                                      background: user.role === r ? "color-mix(in srgb, var(--fg) 10%, transparent)" : "color-mix(in srgb, var(--fg) 4%, transparent)",
                                      color: "var(--fg)",
                                    }}
                                  >
                                    Make {r}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--hairline)" }}>
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              Page {page} of {totalPages}
            </span>
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
                ) : (
                  <PlayCircle className="w-5 h-5 text-emerald-500" />
                )}
                <h3 className="text-base font-bold text-[var(--fg)]">
                  {targetStatus === "ON_HOLD" ? "Place Account On Hold" : "Reactivate Account"}
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
              Updating status for <strong className="text-[var(--fg)]">{statusModalUser.name}</strong> ({statusModalUser.email}). An automated email notification will be sent to the user.
            </p>

            {targetStatus === "ON_HOLD" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Reason for Hold:
                </label>
                <textarea
                  rows={3}
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="e.g. Policy review, verification update pending, reported conduct issue..."
                  className="w-full rounded-xl p-3 text-sm outline-none resize-none"
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
                  targetStatus === "ON_HOLD" ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {updating ? "Saving..." : targetStatus === "ON_HOLD" ? "Confirm Hold & Send Email" : "Confirm Reactivation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
