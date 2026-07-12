"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { User, Camera, CreditCard, Bell, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { ImageCropModal } from "@/components/ImageCropModal";
import { NotificationSettingsPanel } from "@/components/NotificationSettingsPanel";
import { useCurrency, CURRENCY_CONFIGS } from "@/lib/currency-context";


export default function SettingsPage() {
  const { user, mentor, refreshUser, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { currency: activeCurrency, setCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<"profile" | "payments" | "notifications">("profile");
  const [switching, setSwitching] = useState(false);

  const handleContinueAsMentor = async () => {
    if (!user) return;
    if (user.role === "MENTOR" && mentor) {
      router.push("/mentor");
      return;
    }

    setSwitching(true);
    try {
      const token = localStorage.getItem("helpmeman.accessToken");
      if (token?.startsWith("demo_")) {
        updateUser({ role: "MENTOR", onboardingRole: "MENTOR" } as any);
        router.push("/onboarding");
        return;
      }
      await api.patch("/mentor/onboarding", { role: "MENTOR" });
      updateUser({ ...user, role: "MENTOR", onboardingRole: "MENTOR" });
      router.push("/onboarding");
    } catch (err) {
      toast("Failed to transition to mentor onboarding.", "error");
    } finally {
      setSwitching(false);
    }
  };

  // Avatar Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user?.avatar, avatarPreview]);

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
      const token = localStorage.getItem("helpmeman.accessToken");
      if (token?.startsWith("demo_")) {
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
        const token = localStorage.getItem("helpmeman.accessToken");
        if (token?.startsWith("demo_")) {
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
  const [username, setUsername] = useState(user?.username ?? user?.email?.split("@")[0] ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentRole, setCurrentRole] = useState(user?.currentRole ?? "");
  const [saving, setSaving] = useState(false);

  // Sync form states with loaded user data
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setUsername(user.username ?? user.email?.split("@")[0] ?? "");
      setPhone(user.phone ?? "");
      setCurrentRole(user.currentRole ?? "");
    }
  }, [user]);

  const hasChanges =
    name !== (user?.name ?? "") ||
    username !== (user?.username ?? user?.email?.split("@")[0] ?? "") ||
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
      const token = localStorage.getItem("helpmeman.accessToken");
      if (token?.startsWith("demo_")) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateUser({ name, phone, currentRole }); // Update globally
        toast("Profile updated successfully!", "success");
        return;
      }
      const { data } = await api.put("/users/me", { name, phone, username, currentRole });
      updateUser(data.user);
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
    { id: "notifications", label: "Notifications", icon: Bell },
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
            <div className="bg-(--fg)/[0.02] border border-(--hairline) rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-(--hairline) bg-gradient-to-br from-(--fg)/10 to-(--fg)/5 flex items-center justify-center shadow-lg">
                    {currentAvatar && !imageError ? (
                      <img
                        src={currentAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-2xl md:text-3xl font-semibold text-(--fg) tracking-tight opacity-90">{initials}</span>
                    )}
                  </div>

                  <label className="absolute bottom-0 right-0 bg-(--accent) text-(--accent-fg) p-2 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md">
                    <Camera className="w-3.5 h-3.5" />
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
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-(--fg)">
                      {name || "Your Name"}
                    </h3>
                    {currentRole ? (
                      <p className="text-xs sm:text-sm text-(--muted) font-medium">
                        {currentRole}
                      </p>
                    ) : (
                      <p className="text-xs text-(--muted) italic font-medium">Add your current role below</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarSaving}
                      className="px-4 py-2 bg-(--fg) text-(--bg) hover:opacity-90 active:scale-[0.98] transition-all rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {avatarSaving ? "Uploading..." : "Change Photo"}
                    </button>
                    {user?.avatar && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-4 py-2 bg-(--fg)/5 text-(--muted) hover:bg-(--fg)/10 hover:text-(--fg) active:scale-[0.98] transition-all rounded-xl font-bold text-xs cursor-pointer border border-(--hairline)"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-(--fg)/[0.02] border border-(--hairline) rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-(--fg)/10 rounded-xl">
                  <User className="w-4 h-4 text-(--fg)" />
                </div>
                <h3 className="text-lg font-bold">Personal Information</h3>
              </div>

              <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-(--muted) font-semibold ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl px-4 py-2.5 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-(--muted) font-semibold ml-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) font-semibold text-xs sm:text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="username"
                      className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl pl-8 pr-4 py-2.5 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-(--muted) font-semibold ml-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl px-4 py-2.5 opacity-40 cursor-not-allowed italic text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-(--muted) font-semibold ml-1">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="w-14 bg-(--fg)/5 border border-(--hairline) rounded-xl flex items-center justify-center font-mono text-(--muted) text-xs sm:text-sm py-2.5 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit number"
                      className="flex-1 bg-(--fg)/5 border border-(--hairline) rounded-xl px-4 py-2.5 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-(--muted) font-semibold ml-1">Current Role</label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Product Manager"
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl px-4 py-2.5 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all placeholder:text-(--muted) text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-(--muted) font-semibold ml-1">Preferred Currency</label>
                  <select
                    value={activeCurrency}
                    onChange={(e) => setCurrency(e.target.value, true)}
                    className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl px-4 py-2.5 focus:border-(--fg)/20 focus:bg-(--fg)/10 outline-none transition-all text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    {Object.entries(CURRENCY_CONFIGS).map(([code, config]) => (
                      <option key={code} value={code} className="bg-(--bg) text-(--fg)">
                        {code} ({config.symbol}) - {config.name}
                      </option>
                    ))}
                  </select>
                </div>

                {hasChanges && (
                  <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => { setName(user?.name ?? ""); setPhone(user?.phone ?? ""); setUsername(user?.username ?? user?.email?.split("@")[0] ?? ""); setCurrentRole(user?.currentRole ?? ""); }}
                      className="px-4 py-2 text-(--muted) hover:text-(--fg) transition-all font-bold text-xs cursor-pointer rounded-xl"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-(--fg) text-(--bg) rounded-xl font-bold text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Continue as Mentor Section */}
            <div className="bg-(--fg)/[0.02] border border-(--hairline) rounded-3xl p-6 md:p-8 backdrop-blur-xl mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-(--fg)/10 rounded-xl">
                  <Briefcase className="w-4 h-4 text-(--fg)" />
                </div>
                <h3 className="text-lg font-bold">Continue as Mentor</h3>
              </div>
              <p className="text-xs sm:text-sm text-(--muted) mb-6 leading-relaxed">
                Are you ready to share your expertise, guide other learners, and build your mentor profile? Switch to the mentor panel or start your mentor onboarding.
              </p>
              <button
                type="button"
                onClick={handleContinueAsMentor}
                disabled={switching}
                className="px-4 py-2 bg-(--fg) text-(--bg) rounded-xl font-bold text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {switching ? "Switching..." : (user?.role === "MENTOR" && mentor) ? "Switch to Mentor Panel" : "Become a Mentor"}
              </button>
            </div>
          </>
        )}


        {activeTab === "notifications" && <NotificationSettingsPanel />}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="bg-(--fg)/[0.02] border border-(--hairline) rounded-3xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-(--fg)/10 rounded-xl">
                  <CreditCard className="w-4 h-4 text-(--fg)" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Payment History</h3>
                  <p className="text-xs text-(--muted) mt-0.5">All payments you&apos;ve made on HelpMeMan.</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-12 text-center bg-(--fg)/[0.01] rounded-2xl border border-dashed border-(--hairline)">
                <CreditCard className="w-8 h-8 text-(--muted) mb-3" />
                <p className="text-sm font-semibold">No payments yet</p>
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