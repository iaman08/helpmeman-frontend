"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import Cropper from "react-easy-crop";
import {
  Plus,
  Edit2,
  Trash2,
  Archive,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Move,
  Upload,
  User,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  Settings,
  Briefcase,
  Users,
  Grid,
  FileText,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import getCroppedImg from "@/lib/cropImage";
import { compressImage } from "@/lib/compressImage";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "AI",
  "Backend",
  "Frontend",
  "Mobile",
  "Marketing",
  "Community",
  "Support",
  "Research",
  "Operations",
  "Finance",
  "Legal",
  "HR",
  "Other"
];

const INITIAL_FORM = {
  fullName: "",
  username: "",
  role: "",
  department: "Engineering",
  bio: "",
  story: "",
  education: "",
  experience: "",
  achievements: "",
  projects: "",
  skills: "",
  interests: "",
  languages: "",
  location: "",
  country: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  twitter: "",
  website: "",
  instagram: "",
  facebook: "",
  status: "ONLINE",
  isFounder: false,
  isLeadership: false,
  isVerified: false,
  isActive: true,
  isFeatured: false,
  availableForMentorship: false,
  allowContact: true,
  showEmail: false,
  showSocialLinks: true,
  displayOrder: 0,
  joinedAt: "",
  leftAt: "",
};

export default function AdminTeamPage() {
  const { data, error, isLoading } = useSWR("/team?active=all", fetcher);
  const members = useMemo(() => data?.members ?? [], [data]);

  const [activeTab, setActiveTab] = useState<"active" | "archived" | "reorder">("active");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Editor preview tabs
  const [bioPreview, setBioPreview] = useState(false);
  const [storyPreview, setStoryPreview] = useState(false);

  // File Upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Cropper states
  const [cropMode, setCropMode] = useState<"image" | "cover" | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Drag & Drop reorder list state
  const [reorderList, setReorderList] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (members.length > 0) {
      // Sort active members for reordering
      const sorted = [...members]
        .filter((m: any) => m.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      setReorderList(sorted);
    }
  }, [members]);

  // Statistics calculation
  const stats = useMemo(() => {
    const active = members.filter((m: any) => m.isActive);
    const archived = members.filter((m: any) => !m.isActive);
    const leadership = members.filter((m: any) => m.isLeadership && m.isActive);
    const depts = new Set(active.map((m: any) => m.department));

    return {
      total: members.length,
      active: active.length,
      archived: archived.length,
      leadership: leadership.length,
      departments: depts.size,
    };
  }, [members]);

  // Auto-generate username from fullName if blank
  useEffect(() => {
    if (!editingId && form.fullName && !form.username) {
      const slug = form.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setForm((prev: any) => ({ ...prev, username: slug }));
    }
  }, [form.fullName, editingId]);

  const handleOpenAdd = () => {
    setForm({
      ...INITIAL_FORM,
      joinedAt: new Date().toISOString().substring(0, 10),
      displayOrder: members.length,
    });
    setEditingId(null);
    setImageFile(null);
    setCoverFile(null);
    setImagePreview(null);
    setCoverPreview(null);
    setErrorMessage("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const handleOpenEdit = (member: any) => {
    setForm({
      fullName: member.fullName,
      username: member.username,
      role: member.role,
      department: member.department,
      bio: member.bio,
      story: member.story || "",
      education: member.education || "",
      experience: member.experience || "",
      achievements: member.achievements || "",
      projects: member.projects || "",
      skills: member.skills.join(", "),
      interests: member.interests.join(", "),
      languages: member.languages.join(", "),
      location: member.location || "",
      country: member.country || "",
      email: member.email || "",
      phone: member.phone || "",
      linkedin: member.linkedin || "",
      github: member.github || "",
      twitter: member.twitter || "",
      website: member.website || "",
      instagram: member.instagram || "",
      facebook: member.facebook || "",
      status: member.status,
      isFounder: member.isFounder,
      isLeadership: member.isLeadership,
      isVerified: member.isVerified,
      isActive: member.isActive,
      isFeatured: member.isFeatured,
      availableForMentorship: member.availableForMentorship,
      allowContact: member.allowContact,
      showEmail: member.showEmail,
      showSocialLinks: member.showSocialLinks,
      displayOrder: member.displayOrder,
      joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString().substring(0, 10) : "",
      leftAt: member.leftAt ? new Date(member.leftAt).toISOString().substring(0, 10) : "",
    });
    setEditingId(member.id);
    setImageFile(null);
    setCoverFile(null);
    setImagePreview(member.imageUrl);
    setCoverPreview(member.coverUrl);
    setErrorMessage("");
    setSuccessMessage("");
    setShowModal(true);
  };

  // Handle uploader change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "cover") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setCropMode(type);
      };
      reader.readAsDataURL(file);
    }
  };

  // Complete cropping area selection
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Perform cropping & compression
  const handleCropSave = async () => {
    if (!cropSrc || !croppedAreaPixels || !cropMode) return;
    try {
      const croppedFile = await getCroppedImg(cropSrc, croppedAreaPixels);
      if (croppedFile) {
        // Compress image client side
        const compressed = await compressImage(croppedFile);
        if (cropMode === "image") {
          setImageFile(compressed);
          setImagePreview(URL.createObjectURL(compressed));
        } else {
          setCoverFile(compressed);
          setCoverPreview(URL.createObjectURL(compressed));
        }
      }
    } catch (err) {
      console.error("Cropping failed:", err);
    } finally {
      setCropMode(null);
      setCropSrc(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Form validation
    if (!form.fullName || !form.username || !form.role || !form.bio) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, String(val));
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (coverFile) {
        formData.append("cover", coverFile);
      }

      if (editingId) {
        await api.put(`/team/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMessage("Member profile updated successfully!");
      } else {
        await api.post("/team", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccessMessage("Team member added successfully!");
      }

      mutate("/team?active=all");
      setTimeout(() => setShowModal(false), 800);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "An error occurred saving member profile.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this team member?")) return;
    try {
      await api.delete(`/team/${id}`);
      mutate("/team?active=all");
    } catch {
      alert("Failed to delete member.");
    }
  };

  const handleToggleArchive = async (id: string, currentActive: boolean) => {
    try {
      await api.patch("/team/archive", { id, isActive: !currentActive });
      mutate("/team?active=all");
    } catch {
      alert("Failed to change archive status.");
    }
  };

  const handleToggleVerify = async (id: string, currentVerified: boolean) => {
    try {
      await api.patch("/team/verify", { id, isVerified: !currentVerified });
      mutate("/team?active=all");
    } catch {
      alert("Failed to update verification state.");
    }
  };

  // HTML5 Drag & Drop ordering handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    const list = [...reorderList];
    const draggedItem = list.splice(draggedIndex, 1)[0];
    list.splice(idx, 0, draggedItem);
    setDraggedIndex(idx);
    setReorderList(list);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    // Prepare display order array
    const orders = reorderList.map((m, idx) => ({
      id: m.id,
      displayOrder: idx,
    }));

    try {
      await api.patch("/team/order", { orders });
      mutate("/team?active=all");
      setSuccessMessage("Display order saved automatically.");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch {
      setErrorMessage("Failed to save reordered list.");
    }
  };

  // Render Table List
  const renderMembersTable = (list: any[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 border border-dashed border-(--hairline) rounded-2xl flex flex-col items-center">
          <Users className="w-8 h-8 text-(--muted) mb-2" />
          <p className="text-sm font-semibold">No team members found.</p>
          <p className="text-xs text-(--muted) mt-0.5">Click the "Add Team Member" button to get started.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {/* Table Head */}
        <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-(--muted) font-semibold select-none">
          <span className="col-span-3">Name</span>
          <span className="col-span-3">Role / Department</span>
          <span className="col-span-2">Presence State</span>
          <span className="col-span-2">Mentorship / Verified</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {/* Rows */}
        {list.map((m: any) => (
          <div
            key={m.id}
            className="grid grid-cols-12 gap-4 items-center rounded-xl bg-(--fg)/[0.02] border border-(--hairline)/30 hover:border-(--hairline) px-5 py-3.5 text-sm transition-all"
          >
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-(--hairline) shrink-0">
                <img
                  src={m.imageUrl || "/avatar_placeholder.jpg"}
                  alt={m.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <p className="font-semibold text-(--fg) truncate flex items-center gap-1">
                  {m.fullName}
                  {m.isFounder && <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">F</span>}
                </p>
                <p className="text-[11px] text-(--muted) truncate">@{m.username}</p>
              </div>
            </div>

            <div className="col-span-3 truncate">
              <p className="font-medium text-(--fg) truncate">{m.role}</p>
              <p className="text-xs text-(--muted) font-medium">{m.department}</p>
            </div>

            <span className="col-span-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                m.status === "ONLINE" ? "bg-emerald-500" :
                m.status === "AWAY" ? "bg-amber-500" : "bg-zinc-400"
              }`} />
              <span className="text-xs font-semibold text-(--fg)/80">{m.status}</span>
            </span>

            <div className="col-span-2 flex flex-col gap-1">
              <button
                onClick={() => handleToggleVerify(m.id, m.isVerified)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded self-start flex items-center gap-1 cursor-pointer transition-colors ${
                  m.isVerified
                    ? "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20"
                    : "bg-(--fg)/5 text-(--muted) hover:bg-(--fg)/10"
                }`}
              >
                {m.isVerified ? "✓ Verified" : "Verify"}
              </button>
              <span className="text-[10px] text-(--muted) font-semibold pl-2">
                {m.availableForMentorship ? "Bookable" : "Not Bookable"}
              </span>
            </div>

            <div className="col-span-2 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(m)}
                className="p-1.5 rounded-lg hover:bg-(--fg)/5 text-(--muted) hover:text-(--fg) transition-all cursor-pointer"
                title="Edit member"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleArchive(m.id, m.isActive)}
                className="p-1.5 rounded-lg hover:bg-(--fg)/5 text-(--muted) hover:text-amber-600 transition-all cursor-pointer"
                title={m.isActive ? "Archive profile" : "Restore profile"}
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/5 text-(--muted) hover:text-red-500 transition-all cursor-pointer"
                title="Delete permanently"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const activeMembers = useMemo(() => members.filter((m: any) => m.isActive), [members]);
  const archivedMembers = useMemo(() => members.filter((m: any) => !m.isActive), [members]);

  return (
    <div className="flex flex-col gap-8 text-(--fg)">
      {/* ─── Page Title Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted) font-semibold">Admin Panel</p>
          <h1 className="font-display text-4xl leading-tight">Team Management</h1>
          <p className="text-sm text-(--muted)">Directly manage the "Meet the Team" directory database records.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow transition-transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* ─── Dashboard Stats widgets ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-(--fg)/[0.02] border border-(--hairline) flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-(--muted) uppercase tracking-wider">Total Members</span>
          <span className="text-2xl font-bold">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-(--fg)/[0.02] border border-(--hairline) flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-(--muted) uppercase tracking-wider">Active</span>
          <span className="text-2xl font-bold text-emerald-600">{stats.active}</span>
        </div>
        <div className="p-4 rounded-2xl bg-(--fg)/[0.02] border border-(--hairline) flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-(--muted) uppercase tracking-wider">Leadership</span>
          <span className="text-2xl font-bold text-amber-600">{stats.leadership}</span>
        </div>
        <div className="p-4 rounded-2xl bg-(--fg)/[0.02] border border-(--hairline) flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-(--muted) uppercase tracking-wider">Departments</span>
          <span className="text-2xl font-bold text-indigo-600">{stats.departments}</span>
        </div>
        <div className="p-4 rounded-2xl bg-(--fg)/[0.02] border border-(--hairline) flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-(--muted) uppercase tracking-wider">Archived</span>
          <span className="text-2xl font-bold text-zinc-500">{stats.archived}</span>
        </div>
      </div>

      {/* ─── Action Tabs ─── */}
      <div className="flex border-b border-(--hairline) gap-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "active" ? "border-red-500 text-red-500" : "border-transparent text-(--muted) hover:text-(--fg)"
          }`}
        >
          Active Members ({activeMembers.length})
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "archived" ? "border-red-500 text-red-500" : "border-transparent text-(--muted) hover:text-(--fg)"
          }`}
        >
          Archived Members ({archivedMembers.length})
        </button>
        <button
          onClick={() => setActiveTab("reorder")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "reorder" ? "border-red-500 text-red-500" : "border-transparent text-(--muted) hover:text-(--fg)"
          }`}
        >
          Drag & Drop Order ({activeMembers.length})
        </button>
      </div>

      {/* Success/Error message overlays */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
          {successMessage}
        </div>
      )}

      {/* ─── Tab Content Views ─── */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl bg-(--fg)/5 animate-pulse" />
          ))}
        </div>
      ) : activeTab === "active" ? (
        renderMembersTable(activeMembers)
      ) : activeTab === "archived" ? (
        renderMembersTable(archivedMembers)
      ) : (
        /* Reorder Drag and Drop List view */
        <div className="border border-(--hairline) rounded-2xl overflow-hidden bg-(--fg)/[0.01] p-5">
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 mb-6">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Drag rows to change display order. Display changes will save automatically to database display_order index.
          </div>

          <div className="flex flex-col gap-2">
            {reorderList.map((m, idx) => (
              <div
                key={m.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 border border-(--hairline) p-3 rounded-xl bg-white select-none transition-all duration-150 cursor-grab active:cursor-grabbing ${
                  draggedIndex === idx ? "opacity-40 border-dashed border-red-400" : "hover:border-(--fg)/30 shadow-sm"
                }`}
              >
                <Move className="w-4 h-4 text-(--muted) shrink-0" />
                <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-(--hairline) bg-zinc-100">
                  <img
                    src={m.imageUrl || "/avatar_placeholder.jpg"}
                    alt={m.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-semibold text-xs text-(--fg) truncate">{m.fullName}</p>
                  <p className="text-[10px] text-(--muted) font-medium truncate">{m.role}</p>
                </div>
                <div className="shrink-0 text-right text-[10px] text-(--muted) font-bold font-mono">
                  Order Index: {idx}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          {/* Modal Container */}
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-[850px] h-[90vh] bg-bg border border-(--hairline) rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-(--hairline) flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-red-500" />
                {editingId ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-(--fg)/5 text-(--muted) hover:text-(--fg) transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar text-sm">
              {errorMessage && (
                <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold rounded-xl">
                  {errorMessage}
                </div>
              )}

              {/* 1. Basic Fields */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Primary details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={form.fullName}
                      onChange={(e) => setForm((p: any) => ({ ...p, fullName: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Username Slug (Unique) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. john-doe"
                      value={form.username}
                      onChange={(e) => setForm((p: any) => ({ ...p, username: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Role title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Head of Product"
                      value={form.role}
                      onChange={(e) => setForm((p: any) => ({ ...p, role: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Department *</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm((p: any) => ({ ...p, department: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-bg focus:border-amber-500 outline-none transition-all"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Image uploads (Avatar & Cover) */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Media uploads (Cropping & Compression)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-(--muted)">Profile Avatar Picture (1:1 Ratio)</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-zinc-100 border border-(--hairline) overflow-hidden flex-shrink-0 relative group">
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <label className="px-4 py-2 border border-(--hairline) hover:border-(--fg)/30 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Profile
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "image")}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Cover Picture */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-(--muted)">Banner Cover Image (16:9 Ratio)</label>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-32 rounded-xl bg-zinc-100 border border-(--hairline) overflow-hidden flex-shrink-0 relative">
                        {coverPreview ? (
                          <img src={coverPreview} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <label className="px-4 py-2 border border-(--hairline) hover:border-(--fg)/30 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Cover
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "cover")}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Text Areas (Bio & Story) */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Biographical Description (Markdown support)
                </h3>

                {/* Bio Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-(--muted)">Short Bio Description *</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBioPreview(false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${!bioPreview ? "bg-red-500/10 text-red-500" : "text-(--muted)"}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setBioPreview(true)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${bioPreview ? "bg-red-500/10 text-red-500" : "text-(--muted)"}`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                  {bioPreview ? (
                    <div className="p-3 border border-(--hairline) rounded-xl text-xs bg-(--fg)/[0.01] h-32 overflow-y-auto whitespace-pre-line text-(--fg)/80">
                      {form.bio || <span className="italic text-zinc-300">Nothing to preview</span>}
                    </div>
                  ) : (
                    <textarea
                      required
                      placeholder="Write a brief, punchy intro biography..."
                      value={form.bio}
                      onChange={(e) => setForm((p: any) => ({ ...p, bio: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all h-32 text-xs"
                    />
                  )}
                </div>

                {/* Story Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-(--muted)">Journey Story</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStoryPreview(false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${!storyPreview ? "bg-red-500/10 text-red-500" : "text-(--muted)"}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoryPreview(true)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${storyPreview ? "bg-red-500/10 text-red-500" : "text-(--muted)"}`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                  {storyPreview ? (
                    <div className="p-3 border border-(--hairline) rounded-xl text-xs bg-(--fg)/[0.01] h-40 overflow-y-auto whitespace-pre-line text-(--fg)/80">
                      {form.story || <span className="italic text-zinc-300">Nothing to preview</span>}
                    </div>
                  ) : (
                    <textarea
                      placeholder="Tell the detailed story of how they joined or their journey..."
                      value={form.story}
                      onChange={(e) => setForm((p: any) => ({ ...p, story: e.target.value }))}
                      className="px-3.5 py-2.5 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all h-40 text-xs"
                    />
                  )}
                </div>
              </div>

              {/* 4. Structured fields */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Structured Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Experience Details</label>
                    <textarea
                      placeholder="e.g. Senior Software Architect at Google (3 yrs)&#10;Software Dev at Amazon (2 yrs)"
                      value={form.experience}
                      onChange={(e) => setForm((p: any) => ({ ...p, experience: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all h-24 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Education Details</label>
                    <textarea
                      placeholder="e.g. B.Tech Computer Science, IIT Bombay (2021)&#10;M.S. Artificial Intelligence, Stanford (2023)"
                      value={form.education}
                      onChange={(e) => setForm((p: any) => ({ ...p, education: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all h-24 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Achievements</label>
                    <textarea
                      placeholder="e.g. ACM ICPC World Finalist 2022&#10;Open Source Contributor of the Year 2024"
                      value={form.achievements}
                      onChange={(e) => setForm((p: any) => ({ ...p, achievements: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all h-24 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Projects</label>
                    <textarea
                      placeholder="e.g. HelpMeMan Scheduler Engine (Node/Postgres)&#10;Linear Notion Integrations Library"
                      value={form.projects}
                      onChange={(e) => setForm((p: any) => ({ ...p, projects: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all h-24 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Skills, Languages, Interests (Comma Separated arrays) */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Skills, Languages & Interests (Comma Separated)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Skills List</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, Prisma, S3"
                      value={form.skills}
                      onChange={(e) => setForm((p: any) => ({ ...p, skills: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Languages Spoken</label>
                    <input
                      type="text"
                      placeholder="English, Hindi, Spanish"
                      value={form.languages}
                      onChange={(e) => setForm((p: any) => ({ ...p, languages: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Interests</label>
                    <input
                      type="text"
                      placeholder="Hiking, Chess, Open Source"
                      value={form.interests}
                      onChange={(e) => setForm((p: any) => ({ ...p, interests: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Contact & Social Profiles */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Contact & Social profiles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Email Address</label>
                    <input
                      type="email"
                      placeholder="member@helpmeman.com"
                      value={form.email}
                      onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Phone Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="+91 99999 99999"
                      value={form.phone}
                      onChange={(e) => setForm((p: any) => ({ ...p, phone: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Location / City</label>
                    <input
                      type="text"
                      placeholder="Bengaluru"
                      value={form.location}
                      onChange={(e) => setForm((p: any) => ({ ...p, location: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Country</label>
                    <input
                      type="text"
                      placeholder="India"
                      value={form.country}
                      onChange={(e) => setForm((p: any) => ({ ...p, country: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/username"
                      value={form.linkedin}
                      onChange={(e) => setForm((p: any) => ({ ...p, linkedin: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">GitHub URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/username"
                      value={form.github}
                      onChange={(e) => setForm((p: any) => ({ ...p, github: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Twitter/X URL</label>
                    <input
                      type="text"
                      placeholder="https://x.com/username"
                      value={form.twitter}
                      onChange={(e) => setForm((p: any) => ({ ...p, twitter: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Portfolio Website</label>
                    <input
                      type="text"
                      placeholder="https://username.com"
                      value={form.website}
                      onChange={(e) => setForm((p: any) => ({ ...p, website: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Settings Toggles */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Metadata & Settings Switches
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.isFounder}
                      onChange={(e) => setForm((p: any) => ({ ...p, isFounder: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Is Founder
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.isLeadership}
                      onChange={(e) => setForm((p: any) => ({ ...p, isLeadership: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Is Leadership
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.isVerified}
                      onChange={(e) => setForm((p: any) => ({ ...p, isVerified: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Is Verified
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((p: any) => ({ ...p, isFeatured: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Is Featured
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.availableForMentorship}
                      onChange={(e) => setForm((p: any) => ({ ...p, availableForMentorship: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Available for Mentorship
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.allowContact}
                      onChange={(e) => setForm((p: any) => ({ ...p, allowContact: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Allow Direct Contact
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.showEmail}
                      onChange={(e) => setForm((p: any) => ({ ...p, showEmail: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Show Public Email
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.showSocialLinks}
                      onChange={(e) => setForm((p: any) => ({ ...p, showSocialLinks: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Show Socials
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p: any) => ({ ...p, isActive: e.target.checked }))}
                      className="rounded border-(--hairline) text-red-500 focus:ring-red-500 w-4 h-4"
                    />
                    Is Active Profile
                  </label>
                </div>
              </div>

              {/* 8. Dates */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) border-b border-(--hairline) pb-1">
                  Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Joined Date</label>
                    <input
                      type="date"
                      value={form.joinedAt}
                      onChange={(e) => setForm((p: any) => ({ ...p, joinedAt: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-(--muted)">Departure Date (If Left)</label>
                    <input
                      type="date"
                      value={form.leftAt}
                      onChange={(e) => setForm((p: any) => ({ ...p, leftAt: e.target.value }))}
                      className="px-3.5 py-2 rounded-xl border border-(--hairline) bg-transparent focus:border-amber-500 outline-none transition-all text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-(--hairline) flex items-center justify-end gap-3 bg-(--fg)/[0.01] shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-(--hairline) hover:bg-(--fg)/5 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer shadow"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── react-easy-crop modal ─── */}
      {cropMode && cropSrc && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4">
          <div className="relative w-full max-w-[550px] h-[55vh] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={cropMode === "image" ? 1 : 16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Cropper controls */}
          <div className="w-full max-w-[550px] mt-4 flex flex-col gap-4 text-white">
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-400">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-grow accent-red-500 cursor-pointer h-1 rounded bg-zinc-800"
              />
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => {
                  setCropMode(null);
                  setCropSrc(null);
                }}
                className="px-4 py-2 border border-zinc-700 hover:bg-zinc-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
