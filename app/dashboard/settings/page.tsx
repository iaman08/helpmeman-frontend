"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { User, Lock, CheckCircle, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  /* ─── Avatar upload ─── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg("File too large. Max 5MB.");
      return;
    }
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    uploadAvatar(file);
  }

  async function uploadAvatar(file: File) {
    setAvatarSaving(true);
    setAvatarMsg("");
    try {
      const form = new FormData();
      form.append("avatar", file);
      await api.put("/users/me", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      setAvatarMsg("Photo updated!");
    } catch (err) {
      setAvatarPreview(null);
      if (err instanceof AxiosError) {
        setAvatarMsg(err.response?.data?.error ?? "Upload failed.");
      } else {
        setAvatarMsg("Something went wrong.");
      }
    } finally {
      setAvatarSaving(false);
    }
  }

  /* ─── Profile form ─── */
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      await api.put("/users/me", { name, phone });
      await refreshUser();
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      if (err instanceof AxiosError) {
        setProfileMsg(err.response?.data?.error ?? "Update failed.");
      } else {
        setProfileMsg("Something went wrong.");
      }
    } finally {
      setProfileSaving(false);
    }
  }

  /* ─── Password form ─── */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwSuccess(false);
    if (newPw.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwMsg("Passwords do not match."); return; }
    setPwSaving(true);
    try {
      await api.put("/users/me/password", { currentPassword: currentPw, newPassword: newPw });
      setPwSuccess(true);
      setPwMsg("Password changed successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      if (err instanceof AxiosError) {
        setPwMsg(err.response?.data?.error ?? "Change failed.");
      } else {
        setPwMsg("Something went wrong.");
      }
    } finally {
      setPwSaving(false);
    }
  }

  const currentAvatar = avatarPreview ?? (user as { avatar?: string } | null)?.avatar ?? null;
  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Settings</p>
        <h1 className="font-display text-4xl leading-tight">Your profile.</h1>
      </div>

      {/* ─── Avatar Section ─── */}
      <div className="rounded-2xl bg-(--fg)/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Camera className="h-4 w-4 text-(--muted)" />
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">Profile Photo</h2>
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarSaving}
            className="relative group cursor-pointer shrink-0 disabled:cursor-wait"
            aria-label="Change profile photo"
          >
            <div className="h-20 w-20 rounded-full overflow-hidden bg-(--fg)/10 flex items-center justify-center text-2xl font-medium">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            {!avatarSaving && (
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
            )}
            {avatarSaving && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            )}
          </button>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarSaving}
              className="self-start text-sm rounded-full bg-(--fg)/5 px-5 py-2 hover:bg-(--fg)/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {avatarSaving ? "Uploading…" : "Change photo"}
            </button>
            <p className="text-xs text-(--muted)">JPG, PNG or WebP · Max 5MB</p>
            {avatarMsg && (
              <p className={`text-xs font-medium ${avatarMsg.includes("updated") ? "text-emerald-500" : "text-red-500"}`}>
                {avatarMsg}
              </p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* ─── Profile Section ─── */}
      <div className="rounded-2xl bg-(--fg)/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-4 w-4 text-(--muted)" />
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">Personal Information</h2>
        </div>
        <form onSubmit={handleProfileSave} className="flex flex-col gap-5 max-w-lg">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Email</span>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none opacity-50 cursor-not-allowed"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Full Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </label>
          {profileMsg && (
            <div className={`rounded-lg px-4 py-3 text-sm ${profileMsg.includes("success") ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
              {profileMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={profileSaving}
            className="self-start rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {profileSaving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* ─── Password Section ─── */}
      <div className="rounded-2xl bg-(--fg)/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-4 w-4 text-(--muted)" />
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 max-w-lg">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Current Password</span>
            <input
              type="password"
              required
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="current-password"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">New Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 8 characters"
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="new-password"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Confirm New Password</span>
            <input
              type="password"
              required
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors"
              autoComplete="new-password"
            />
          </label>
          {pwMsg && (
            <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${pwSuccess ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
              {pwSuccess && <CheckCircle className="h-4 w-4" />}
              {pwMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={pwSaving}
            className="self-start rounded-full bg-(--fg)/5 px-7 py-3 text-sm hover:bg-(--fg)/8 transition-colors cursor-pointer disabled:opacity-50"
          >
            {pwSaving ? "Changing…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
