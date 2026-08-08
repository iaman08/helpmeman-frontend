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
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Categories</p>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Manage categories.</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {showNew && (
        <form onSubmit={createCategory} className="rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Name</span>
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Slug</span>
              <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="auto" className="rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }} />
            </label>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <label className="flex flex-col gap-1.5 text-sm col-span-1">
              <span className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Icon</span>
              <input type="text" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} placeholder="📚" className="rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm col-span-3">
              <span className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Description</span>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }} />
            </label>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={saving} className="rounded-full px-5 py-2 text-sm font-medium cursor-pointer disabled:opacity-50" style={{ background: "var(--fg)", color: "var(--bg)" }}>Create</button>
            <button type="button" onClick={() => setShowNew(false)} className="rounded-full px-5 py-2 text-sm font-medium cursor-pointer" style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl px-5 py-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              {editId === cat.id ? (
                <div className="flex items-center gap-3">
                  <input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="rounded-lg px-2 py-1.5 w-12 text-center outline-none" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }} />
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-lg px-3 py-1.5 outline-none flex-1" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }} />
                  <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="rounded-lg px-3 py-1.5 outline-none flex-1 text-sm" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }} />
                  <button type="button" onClick={() => updateCategory(cat.id)} disabled={saving} className="text-emerald-500 cursor-pointer p-1"><Save className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setEditId(null)} className="cursor-pointer p-1" style={{ color: "var(--muted)" }}><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium" style={{ color: "var(--fg)" }}>{cat.name}</span>
                    <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>{cat.slug}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs max-w-48 truncate" style={{ color: "var(--muted)" }}>{cat.description}</span>
                    <button type="button" onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditDesc(cat.description ?? ""); setEditIcon(cat.icon ?? ""); }} className="cursor-pointer p-1 transition-opacity hover:opacity-70" style={{ color: "var(--muted)" }}><Pencil className="h-3.5 w-3.5" /></button>
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
