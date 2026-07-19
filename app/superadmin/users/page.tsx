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
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Super Admin</p>
        <h1 className="font-display text-4xl leading-tight">Users.</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--muted)" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-(--fg)/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--fg)/20"
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="bg-(--fg)/5 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--fg)/20"
        >
          <option value="All">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="MENTOR">Mentor</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-(--fg)/5 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--fg)/20"
        >
          <option value="All">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
          <option value="DELETED">Deleted</option>
        </select>
      </div>

      <div className="bg-(--fg)/[0.02] rounded-2xl overflow-hidden border border-(--hairline)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-(--muted) bg-(--fg)/5">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--hairline)">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-(--muted)">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr 
                      className="hover:bg-(--fg)/5 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-(--fg)">{user.name}</span>
                          <span className="text-xs text-(--muted)">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-medium ${
                          user.role === 'SUPER_ADMIN' ? 'bg-violet-500/10 text-violet-500' :
                          user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' :
                          user.role === 'MENTOR' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 text-(--muted)">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                    {expandedId === user.id && (
                      <tr className="bg-(--fg)/[0.01]">
                        <td colSpan={4} className="px-6 py-4 border-l-4 border-violet-500">
                          <div className="flex flex-col gap-3">
                            <h4 className="text-xs uppercase tracking-wider text-(--muted) flex items-center gap-2">
                              <UserCog className="h-3 w-3" /> Manage Role
                            </h4>
                            <div className="flex gap-2">
                              {['STUDENT', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].map(r => (
                                <button
                                  key={r}
                                  onClick={() => handleRoleChange(user.id, r)}
                                  disabled={user.role === r}
                                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                    user.role === r 
                                      ? 'bg-(--fg)/10 text-(--fg) cursor-not-allowed' 
                                      : 'bg-(--fg)/5 hover:bg-(--fg)/10 text-(--muted) hover:text-(--fg)'
                                  }`}
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-(--hairline)">
            <span className="text-sm text-(--muted)">
              Page {page} of {totalPages}
            </span>
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
    </div>
  );
}
