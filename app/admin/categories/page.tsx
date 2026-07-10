"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Save, X } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/categories").then((res) => setCategories(res.data.categories ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function createCategory(e: FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post("/admin/categories", { name: newName, slug: newSlug || newName.toLowerCase().replace(/\s+/g, "-"), description: newDesc, icon: newIcon });
      setCategories((prev) => [...prev, res.data.category]); setShowNew(false); setNewName(""); setNewSlug(""); setNewDesc(""); setNewIcon("");
    } catch { alert("Failed"); } finally { setSaving(false); }
  }

  async function updateCategory(id: string) {
    setSaving(true);
    try {
      const res = await api.put(`/admin/categories/${id}`, { name: editName, description: editDesc, icon: editIcon });
      setCategories((prev) => prev.map((c) => c.id === id ? res.data.category : c)); setEditId(null);
    } catch { alert("Failed"); } finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Categories</p>
          <h1 className="font-display text-4xl leading-tight">Manage categories.</h1>
        </div>
        <button type="button" onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-5 py-2.5 text-sm hover:opacity-90 cursor-pointer">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showNew && (
        <form onSubmit={createCategory} className="rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm"><span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Name</span>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none" /></label>
            <label className="flex flex-col gap-1.5 text-sm"><span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Slug</span>
              <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="auto" className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none" /></label>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <label className="flex flex-col gap-1.5 text-sm col-span-1"><span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Icon</span>
              <input type="text" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} placeholder="📚" className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none" /></label>
            <label className="flex flex-col gap-1.5 text-sm col-span-3"><span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Description</span>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none" /></label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-full bg-(--accent) text-(--accent-fg) px-5 py-2 text-sm cursor-pointer disabled:opacity-50">Create</button>
            <button type="button" onClick={() => setShowNew(false)} className="rounded-full bg-(--fg)/5 px-5 py-2 text-sm cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl bg-(--fg)/[0.02] px-5 py-4">
              {editId === cat.id ? (
                <div className="flex items-center gap-3">
                  <input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="bg-(--fg)/5 rounded-lg px-2 py-1.5 w-12 text-center outline-none" />
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-(--fg)/5 rounded-lg px-3 py-1.5 outline-none flex-1" />
                  <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="bg-(--fg)/5 rounded-lg px-3 py-1.5 outline-none flex-1 text-sm" />
                  <button type="button" onClick={() => updateCategory(cat.id)} disabled={saving} className="text-emerald-500 cursor-pointer"><Save className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setEditId(null)} className="text-(--muted) cursor-pointer"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className="text-xl">{cat.icon}</span><span className="font-medium">{cat.name}</span><span className="text-xs text-(--muted) ml-2">{cat.slug}</span></div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-(--muted) max-w-48 truncate">{cat.description}</span>
                    <button type="button" onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditDesc(cat.description ?? ""); setEditIcon(cat.icon ?? ""); }} className="text-(--muted) hover:text-(--fg) cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
