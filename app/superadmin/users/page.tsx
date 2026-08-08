"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, ChevronLeft, ChevronRight, UserCog } from "lucide-react";

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
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>No users found.</td>
                </tr>
              ) : (
                users.map((user, idx) => (
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
                    </tr>
                    {expandedId === user.id && (
                      <tr style={{ background: "color-mix(in srgb, var(--fg) 2%, transparent)", borderBottom: "1px solid var(--hairline)" }}>
                        <td colSpan={4} className="px-6 py-4 border-l-4 border-violet-500">
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
                ))
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
    </div>
  );
}
