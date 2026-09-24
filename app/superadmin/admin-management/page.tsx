"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Search,
  Plus,
  Trash2,
  KeyRound,
  Ban,
  CheckCircle,
  Edit2,
  Eye,
  EyeOff,
  ShieldAlert,
  UserPlus,
  X,
  Loader2,
  Shield,
  UserCheck,
} from "lucide-react";
import { useConfirm } from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt?: string | null;
  lastSeen?: string | null;
  createdAt: string;
}

interface SearchableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

export default function SuperAdminManagementPage() {
  const confirm = useConfirm();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create new credentials modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [showPassword, setShowPassword] = useState(false);

  // Promote existing user modal
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchableUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  // Edit mode
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", role: "ADMIN" });

  const [tempPassword, setTempPassword] = useState<{ name: string; password: string } | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!userQuery.trim() || userQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/super-admin/admin-management/search-users`, {
          params: { q: userQuery.trim() },
        });
        setSearchResults(res.data?.data || []);
      } catch (err) {
        console.error("Search users error:", err);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [userQuery]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/admin-management/admins`);
      const adminList: AdminUser[] =
        res.data?.data?.items || res.data?.admins || (Array.isArray(res.data) ? res.data : []);
      // Always sort Super Admin to the top
      adminList.sort((a, b) => (a.role === "SUPER_ADMIN" ? -1 : b.role === "SUPER_ADMIN" ? 1 : 0));
      setAdmins(adminList);
    } catch (err) {
      console.error("Failed to fetch admins", err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/super-admin/admin-management/admins`, {
        ...formData,
        role: "ADMIN", // Only regular Admins can be created
      });
      setShowAddForm(false);
      setFormData({ name: "", email: "", password: "", role: "ADMIN" });
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create admin");
    }
  };

  const handlePromote = async (user: SearchableUser) => {
    const isConfirmed = await confirm({
      title: "Make User Administrator?",
      message: `Are you sure you want to promote ${user.name} (${user.email}) to Administrator? They will receive full administrative access to manage the platform.`,
      confirmText: "Make Admin",
      cancelText: "Cancel",
      variant: "warning",
    });
    if (!isConfirmed) return;

    setPromotingId(user.id);
    try {
      await api.post(`/super-admin/admin-management/promote`, { userId: user.id });
      fetchAdmins();
      setShowPromoteModal(false);
      setUserQuery("");
      setSearchResults([]);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to promote user to Admin");
    } finally {
      setPromotingId(null);
    }
  };

  const handleRevokeAdmin = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: "Revoke Administrator Privileges?",
      message: `Are you sure you want to remove administrator access for ${name}? Their account will be converted to a regular user and they will no longer be able to access the admin dashboard.`,
      confirmText: "Revoke Admin Access",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!isConfirmed) return;

    try {
      await api.post(`/super-admin/admin-management/admins/${id}/remove-role`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to revoke admin privileges");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/super-admin/admin-management/admins/${id}`, {
        name: editData.name,
        role: "ADMIN",
      });
      setEditId(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update admin");
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const action = currentStatus === "ACTIVE" ? "disable" : "enable";
      const isConfirmed = await confirm({
        title: `${action === "disable" ? "Disable" : "Enable"} Administrator?`,
        message: `Are you sure you want to ${action} this administrator account?`,
        confirmText: action === "disable" ? "Disable" : "Enable",
        cancelText: "Cancel",
        variant: action === "disable" ? "warning" : "info",
      });
      if (!isConfirmed) return;

      await api.post(`/super-admin/admin-management/admins/${id}/${action}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to change status");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Delete Administrator Account?",
      message:
        "CRITICAL WARNING: Are you sure you want to permanently delete this administrator account? This action cannot be undone.",
      confirmText: "Delete Admin",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/super-admin/admin-management/admins/${id}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete admin");
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    const isConfirmed = await confirm({
      title: "Reset Password?",
      message: `Are you sure you want to reset the password for ${name}?`,
      confirmText: "Reset Password",
      cancelText: "Cancel",
      variant: "warning",
    });
    if (!isConfirmed) return;
    try {
      const res = await api.post(`/super-admin/admin-management/admins/${id}/reset-password`);
      const tempPass =
        res.data?.data?.password || res.data?.password || res.data?.temporaryPassword;
      setTempPassword({ name, password: tempPass });
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reset password");
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
          Super Admin
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>
              Admin Management.
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Manage platform administrators. Only 1 Super Admin is permitted by system policy.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => {
                setShowPromoteModal(true);
                setShowAddForm(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow transition-transform active:scale-[0.98] h-auto"
            >
              <UserPlus className="h-4 w-4" />
              Make User Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowPromoteModal(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border h-auto"
              style={{
                borderColor: "var(--hairline)",
                background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                color: "var(--fg)",
              }}
            >
              <Plus className="h-4 w-4" />
              Create Credentials
            </Button>
          </div>
        </div>
      </div>

      {/* Modal: Make existing user an Admin */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border"
            style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-violet-500" />
                <h3 className="text-base font-bold text-[var(--fg)]">Make User an Administrator</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setShowPromoteModal(false);
                  setUserQuery("");
                  setSearchResults([]);
                }}
                className="text-[var(--muted)] hover:text-[var(--fg)]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Search for any existing registered user (student or mentor) and promote them to Administrator with full dashboard access.
            </p>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--muted)" }}
              />
              <input
                autoFocus
                type="text"
                placeholder="Search user by name or email..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                  color: "var(--fg)",
                }}
              />
            </div>

            <div className="max-h-64 overflow-y-auto flex flex-col gap-2 mt-1">
              {searching ? (
                <div className="py-8 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  Searching users...
                </div>
              ) : userQuery.trim().length >= 2 && searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted)]">
                  No eligible non-admin users found matching &quot;{userQuery}&quot;.
                </div>
              ) : userQuery.trim().length < 2 ? (
                <div className="py-6 text-center text-xs text-[var(--muted)]">
                  Type at least 2 characters to search users.
                </div>
              ) : (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl border transition-colors"
                    style={{
                      borderColor: "var(--hairline)",
                      background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[var(--fg)]">{u.name}</span>
                      <span className="text-xs text-[var(--muted)]">{u.email}</span>
                      <span className="text-[10px] uppercase font-mono mt-0.5 text-amber-500">
                        Current: {u.role}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePromote(u)}
                      disabled={promotingId === u.id}
                      className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold shadow gap-1.5"
                    >
                      {promotingId === u.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Promoting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" /> Make Admin
                        </>
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--hairline)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPromoteModal(false);
                  setUserQuery("");
                  setSearchResults([]);
                }}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form: Create new administrator account */}
      {showAddForm && (
        <div
          className="rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl" style={{ color: "var(--fg)" }}>
              Create Administrator Credentials
            </h2>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowAddForm(false)}
              className="text-[var(--muted)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                Full Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Sarah Connor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                  color: "var(--fg)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="admin@helpmeman.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                  color: "var(--fg)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                Temporary Password
              </label>
              <div className="relative w-full">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none"
                  style={{
                    border: "1px solid var(--hairline)",
                    background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                    color: "var(--fg)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--fg)] transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
                Role
              </label>
              <input
                readOnly
                type="text"
                value="ADMIN (Platform Administrator)"
                className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed opacity-80"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                  color: "var(--fg)",
                }}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow"
              >
                Create Admin Account
              </Button>
            </div>
          </form>
        </div>
      )}

      {tempPassword && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start justify-between">
          <div>
            <h3 className="text-emerald-500 font-semibold flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Password Reset Successful
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--fg)" }}>
              Temporary password for {tempPassword.name}:{" "}
              <strong className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded ml-1">
                {tempPassword.password}
              </strong>
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              Please copy this and share it securely with the administrator. It will not be shown again.
            </p>
          </div>
          <button
            onClick={() => setTempPassword(null)}
            className="text-xs font-semibold cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: "var(--muted)" }}
        />
        <input
          type="text"
          placeholder="Filter administrators by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
            color: "var(--fg)",
          }}
        />
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid var(--hairline)",
          background: "color-mix(in srgb, var(--fg) 1%, transparent)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                  color: "var(--muted)",
                }}
                className="text-xs uppercase tracking-wider font-medium"
              >
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-40" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-24" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-8 w-32 float-right" />
                      </td>
                    </tr>
                  ))
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    No administrators found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, idx) => {
                  const isSuperAdmin = admin.role === "SUPER_ADMIN";
                  return (
                    <tr
                      key={admin.id}
                      className="transition-colors group"
                      style={{
                        borderBottom:
                          idx < filteredAdmins.length - 1 ? "1px solid var(--hairline)" : "none",
                      }}
                      onMouseEnter={(el) =>
                        (el.currentTarget.style.background =
                          "color-mix(in srgb, var(--fg) 2%, transparent)")
                      }
                      onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-6 py-4">
                        {editId === admin.id ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="rounded px-2 py-1 text-sm w-full outline-none"
                            style={{
                              border: "1px solid var(--hairline)",
                              background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                              color: "var(--fg)",
                            }}
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>
                              {admin.name}
                            </span>
                            <span className="text-xs" style={{ color: "var(--muted)" }}>
                              {admin.email}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isSuperAdmin ? (
                          <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold bg-violet-500/15 text-violet-600 border border-violet-500/30">
                            Primary Super Admin
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold bg-red-500/10 text-red-600">
                            {admin.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={admin.status} />
                      </td>
                      <td className="px-6 py-4 text-xs font-mono" style={{ color: "var(--muted)" }}>
                        {admin.lastLoginAt || admin.lastSeen
                          ? new Date(admin.lastLoginAt || admin.lastSeen!).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4">
                        {isSuperAdmin ? (
                          <div className="flex items-center justify-end">
                            <span className="text-xs font-medium text-[var(--muted)] px-2 py-1 rounded bg-black/5 dark:bg-white/5">
                              Owner (Protected)
                            </span>
                          </div>
                        ) : editId === admin.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="xs"
                              onClick={() => handleUpdate(admin.id)}
                              className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-semibold"
                            >
                              Save
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setEditId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRevokeAdmin(admin.id, admin.name)}
                              className="text-rose-500 hover:bg-rose-500/15 hover:text-rose-600"
                              title="Revoke Admin Access (Demote to User)"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setEditId(admin.id);
                                setEditData({ name: admin.name, role: admin.role });
                              }}
                              className="text-[var(--muted)] hover:text-[var(--fg)]"
                              title="Edit Name"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleResetPassword(admin.id, admin.name)}
                              className="text-blue-500 hover:bg-blue-500/10 hover:text-blue-600"
                              title="Reset Password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleStatusToggle(admin.id, admin.status)}
                              className={
                                admin.status === "ACTIVE"
                                  ? "text-amber-500 hover:bg-amber-500/10 hover:text-amber-600"
                                  : "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                              }
                              title={admin.status === "ACTIVE" ? "Disable" : "Enable"}
                            >
                              {admin.status === "ACTIVE" ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDelete(admin.id)}
                              className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                              title="Delete Administrator"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
