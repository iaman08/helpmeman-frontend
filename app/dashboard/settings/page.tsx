"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { User, Camera, CreditCard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { ImageCropModal } from "@/components/ImageCropModal";


export default function SettingsPage() {
  const { user, refreshUser, updateUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "payments">("profile");

  // Avatar Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("File too large. Max 5MB allowed.", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCropImageSrc(previewUrl);
    
    // Clear the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    const croppedUrl = URL.createObjectURL(croppedFile);
    setCropImageSrc(null); // Close modal
    setAvatarPreview(croppedUrl); // Show local preview instantly
    await uploadAvatar(croppedFile, croppedUrl);
  };

  const uploadAvatar = async (file: File, previewUrl: string) => {
    setAvatarSaving(true);

    try {
      // Mock logic for demo users
      if (user?.id.startsWith("demo_")) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
        updateUser({ avatar: previewUrl }); // Update globally
        toast("Profile photo updated!", "success");
        return;
      }

      const form = new FormData();
      form.append("avatar", file);

      await api.put("/users/me", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refreshUser();
      toast("Profile photo updated!", "success");
    } catch (err) {
      setAvatarPreview(null);
      if (err instanceof AxiosError) {
        toast(err.response?.data?.error || "Failed to upload photo.", "error");
      } else {
        toast("Something went wrong.", "error");
      }
    } finally {
      setAvatarSaving(false);
    }
  };

  const removePhoto = async () => {
    setAvatarPreview(null);
    try {
        if (user?.id.startsWith("demo_")) {
           updateUser({ avatar: null });
           toast("Photo removed.", "success");
           return;
        }
        await api.put("/users/me", { avatar: null });
        await refreshUser();
        toast("Photo removed.", "success");
    } catch {
        toast("Failed to remove photo.", "error");
    }
  };

  // Profile Form
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.email?.split("@")[0] ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentRole, setCurrentRole] = useState(user?.currentRole ?? "");
  const [saving, setSaving] = useState(false);

  const hasChanges =
    name !== (user?.name ?? "") ||
    username !== (user?.email?.split("@")[0] ?? "") ||
    phone !== (user?.phone ?? "") ||
    currentRole !== (user?.currentRole ?? "");

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Phone limit check
    if (phone && phone.length !== 10) {
      toast("Phone number must be exactly 10 digits.", "error");
      setSaving(false);
      return;
    }

    try {
      if (user?.id.startsWith("demo_")) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateUser({ name, phone, currentRole }); // Update globally
        toast("Profile updated successfully!", "success");
        return;
      }
      await api.put("/users/me", { name, phone, username, currentRole });
      await refreshUser();
      toast("Profile updated successfully!", "success");
    } catch (err) {
      if (err instanceof AxiosError) {
        toast(err.response?.data?.error || "Update failed.", "error");
      } else {
        toast("Something went wrong.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = avatarPreview || user?.avatar;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "JD";

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "payments", label: "Payments", icon: CreditCard },
  ] as const;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 md:px-0 py-4 md:py-8">
        <div className="mb-8 md:mb-10">
          <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs text-(--muted) font-bold">Configuration</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mt-2 tracking-tight">Settings.</h1>
          <p className="text-(--muted) mt-2 md:mt-3 text-sm md:text-base">Manage your account preferences and profile.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mb-8 md:mb-10 bg-(--fg)/[0.02] p-1.5 rounded-2xl sm:rounded-full w-full border border-(--hairline)">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-[13px] sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-(--fg) text-(--bg) shadow-md"
                  : "text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5"
              }`}
            >
              <tab.icon className={`h-4 w-4 hidden sm:block ${activeTab === tab.id ? "" : "opacity-70"}`} />
              {tab.label}
            </button>
          ))}
        </div>

      <div className="space-y-8 md:space-y-10">
        {activeTab === "profile" && (
          <>
            {/* Profile Photo Section */}
            <div className="bg-(--fg)/5 border border-(--hairline) rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 md:gap-12">
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-2xl sm:rounded-[2rem] overflow-hidden border-4 border-(--bg) shadow-2xl bg-gradient-to-br from-(--fg)/10 to-(--fg)/5 flex items-center justify-center">
                    {currentAvatar ? (
                      <img
                        src={currentAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-(--fg) tracking-tighter opacity-80">{initials}</span>
                    )}
                  </div>

                  <label className="absolute -bottom-2 -right-2 bg-(--accent) text-(--accent-fg) p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                      {name || "Your Name"}
                    </h3>
                    {currentRole ? (
                      <p className="text-sm text-(--muted) font-medium">
                        {currentRole}
                      </p>
                    ) : (
                      <p className="text-xs text-(--muted) italic">Add your current role below</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarSaving}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 bg-(--accent) text-(--accent-fg) rounded-xl sm:rounded-2xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {avatarSaving ? "Uploading..." : "Change Photo"}
                    </button>
                    <button
                      onClick={removePhoto}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 bg-(--fg)/10 text-(--muted) rounded-xl sm:rounded-2xl font-bold text-sm hover:bg-(--fg)/20 hover:text-(--fg) transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-(--fg)/5 border border-(--hairline) rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 sm:mb-8 md:mb-10">
                <div className="p-2 sm:p-2.5 bg-(--fg)/10 rounded-xl sm:rounded-2xl">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-(--fg)" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Personal Information</h3>
              </div>

              <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-(--muted) font-medium text-sm sm:text-base">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="username"
                      className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl pl-9 sm:pl-10 pr-4 sm:pr-5 py-3 sm:py-4 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 opacity-40 cursor-not-allowed italic text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Phone Number</label>
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-16 sm:w-20 bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-2 py-3 sm:py-4 text-center font-mono text-(--muted) text-sm sm:text-base">
                      +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit number"
                      className="flex-1 bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Current Role</label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Product Manager"
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-sm sm:text-base"
                  />
                </div>

                {hasChanges && (
                  <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => { setName(user?.name ?? ""); setPhone(user?.phone ?? ""); setUsername(user?.email?.split("@")[0] ?? ""); setCurrentRole(user?.currentRole ?? ""); }}
                      className="px-6 sm:px-8 py-3 sm:py-4 text-(--muted) hover:text-(--fg) transition-colors font-bold text-sm cursor-pointer"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 sm:px-10 py-3 sm:py-4 bg-(--accent) text-(--accent-fg) rounded-xl sm:rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </>
        )}

        {activeTab === "security" && (
          <div className="space-y-8 md:space-y-10">
            <div className="bg-(--fg)/5 border border-(--hairline) rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 sm:mb-8 md:mb-10">
                <div className="p-2 sm:p-2.5 bg-(--fg)/10 rounded-xl sm:rounded-2xl">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-(--fg)" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Authentication</h3>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">New Password</label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-sm sm:text-base"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end pt-3 sm:pt-4">
                  <button
                    type="button"
                    className="px-8 sm:px-10 py-3 sm:py-4 bg-(--accent) text-(--accent-fg) rounded-xl sm:rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    onClick={() => toast("Password update is disabled for demo accounts.", "info")}
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="bg-(--fg)/5 border border-(--hairline) rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 sm:p-2.5 bg-(--fg)/10 rounded-xl sm:rounded-2xl">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-(--fg)" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Payment History</h3>
                  <p className="text-sm text-(--muted) mt-0.5">All payments you&apos;ve made on HelpMeMan.</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-12 text-center bg-(--fg)/5 rounded-xl border border-dashed border-(--hairline)">
                <CreditCard className="w-8 h-8 text-(--muted) mb-3" />
                <p className="text-sm font-medium">No payments yet</p>
                <p className="text-xs text-(--muted) mt-1">When you book sessions, your payment history will appear here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      {cropImageSrc && (
        <ImageCropModal
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}