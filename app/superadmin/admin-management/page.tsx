"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Plus, Trash2, KeyRound, Ban, CheckCircle, Edit2 } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function SuperAdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals / Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  
  // Edit mode
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", role: "" });

  const [tempPassword, setTempPassword] = useState<{name: string, password: string} | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/admin-management/admins`);
      const adminList = res.data?.data?.items || res.data?.admins || (Array.isArray(res.data) ? res.data : []);
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
      await api.post(`/super-admin/admin-management/admins`, formData);
      setShowAddForm(false);
      setFormData({ name: "", email: "", password: "", role: "ADMIN" });
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create admin");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/super-admin/admin-management/admins/${id}`, editData);
      setEditId(null);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update admin");
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const action = currentStatus === 'ACTIVE' ? 'disable' : 'enable';
      if (!window.confirm(`Are you sure you want to ${action} this administrator?`)) return;
      
      await api.post(`/super-admin/admin-management/admins/${id}/${action}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to change status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete this administrator? This action cannot be undone.")) return;
    try {
      await api.delete(`/super-admin/admin-management/admins/${id}`);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete admin");
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!window.confirm(`Reset password for ${name}?`)) return;
    try {
      const res = await api.post(`/super-admin/admin-management/admins/${id}/reset-password`);
      setTempPassword({ name, password: res.data.temporaryPassword });
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reset password");
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Admin Management.</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow transition-transform active:scale-[0.98] w-fit"
          >
            <Plus className="h-4 w-4" />
            Add Administrator
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <h2 className="font-display text-xl mb-4" style={{ color: "var(--fg)" }}>Create New Administrator</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Temporary Password</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}>
                <option value="ADMIN" style={{ background: "var(--bg)" }}>Administrator</option>
                <option value="SUPER_ADMIN" style={{ background: "var(--bg)" }}>Super Administrator</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer" style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}>Cancel</button>
              <button type="submit" className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow">Create Admin</button>
            </div>
          </form>
        </div>
      )}

      {tempPassword && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start justify-between">
          <div>
            <h3 className="text-emerald-500 font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password Reset Successful</h3>
            <p className="text-sm mt-1" style={{ color: "var(--fg)" }}>Temporary password for {tempPassword.name}: <strong className="font-mono bg-emerald-500/20 px-2 py-0.5 rounded ml-1">{tempPassword.password}</strong></p>
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>Please copy this and share it securely. It will not be shown again.</p>
          </div>
          <button onClick={() => setTempPassword(null)} className="text-xs font-semibold cursor-pointer" style={{ color: "var(--muted)" }}>Dismiss</button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted)" }} />
        <input
          type="text"
          placeholder="Filter administrators..."
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

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--muted)" }} className="text-xs uppercase tracking-wider font-medium">
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-32 float-right" /></td>
                  </tr>
                ))
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>No administrators found.</td>
                </tr>
              ) : (
                filteredAdmins.map((admin, idx) => (
                  <tr
                    key={admin.id}
                    className="transition-colors group"
                    style={{ borderBottom: idx < filteredAdmins.length - 1 ? "1px solid var(--hairline)" : "none" }}
                    onMouseEnter={(el) => (el.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                    onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-6 py-4">
                      {editId === admin.id ? (
                        <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="rounded px-2 py-1 text-sm w-full outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }} />
                      ) : (
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{admin.name}</span>
                          <span className="text-xs" style={{ color: "var(--muted)" }}>{admin.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editId === admin.id ? (
                        <select value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} className="rounded px-2 py-1 text-sm outline-none cursor-pointer" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}>
                          <option value="ADMIN" style={{ background: "var(--bg)" }}>ADMIN</option>
                          <option value="SUPER_ADMIN" style={{ background: "var(--bg)" }}>SUPER_ADMIN</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
                          admin.role === 'SUPER_ADMIN' ? 'bg-violet-500/10 text-violet-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                          {admin.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={admin.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-mono" style={{ color: "var(--muted)" }}>
                      {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      {editId === admin.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleUpdate(admin.id)} className="text-xs bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded font-semibold cursor-pointer">Save</button>
                          <button onClick={() => setEditId(null)} className="text-xs px-3 py-1 rounded font-semibold cursor-pointer" style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}>Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditId(admin.id); setEditData({ name: admin.name, role: admin.role }); }} className="p-1.5 rounded transition-colors cursor-pointer" style={{ color: "var(--muted)" }} title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleResetPassword(admin.id, admin.name)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded transition-colors cursor-pointer" title="Reset Password">
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleStatusToggle(admin.id, admin.status)} className={`p-1.5 rounded transition-colors cursor-pointer ${admin.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`} title={admin.status === 'ACTIVE' ? "Disable" : "Enable"}>
                            {admin.status === 'ACTIVE' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button onClick={() => handleDelete(admin.id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer" title="Delete">
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}
