"use client";

import { useState, useRef, useEffect } from "react";
import { User, Bell, CreditCard, Camera, Check, Sparkles, Star, HelpCircle, MessageSquare, Mail, ExternalLink, ChevronRight, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { ImageCropModal } from "@/components/ImageCropModal";
import { PrivacyDataPanel } from "@/components/PrivacyDataPanel";
import { useCurrency, CURRENCY_CONFIGS } from "@/lib/currency-context";
import { useRouter } from "next/navigation";
import { openTawkChat, setTawkVisibility } from "@/components/TawkToScript";

function MenteeSupportPanel() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I join my scheduled Google Meet session?",
      a: "You can join directly from your HelpMeMan Dashboard under 'Meetings'. The meeting link is also sent to your registered email 10 minutes prior to your session.",
    },
    {
      q: "Can I reschedule or cancel my booking?",
      a: "Yes. You can reschedule or cancel a session up to 2 hours before the start time from your 'Bookings' panel for a full refund or instant reschedule.",
    },
    {
      q: "What if my mentor doesn't show up to the call?",
      a: "If your mentor has not joined within 5 minutes, please message them in Chat or click 'Start Live Chat' below so our support team can immediately assist or issue a full credit.",
    },
    {
      q: "Where can I view my session payment invoices?",
      a: "You can find your transaction history in the 'Payments' tab above.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Chat Card */}
      <div
        className="rounded-3xl p-6 md:p-8 relative overflow-hidden"
        style={{
          border: "1px solid rgba(16, 185, 129, 0.25)",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, color-mix(in srgb, var(--fg) 2%, transparent) 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6">
          <div className="flex items-center gap-4">
            {/* Green Icon Bubble */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-[#00A859] flex items-center justify-center shadow-[0_4px_20px_rgba(0,168,89,0.35)]">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C6.477 3 2 6.94 2 11.8c0 2.76 1.45 5.23 3.73 6.84-.16.96-.64 2.52-1.8 3.56-.2.18-.08.52.19.53 1.95.07 3.92-.71 5.08-1.58.91.24 1.86.37 2.8.37 5.523 0 10-3.94 10-8.8S17.523 3 12 3z" />
                </svg>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Live Support Chat</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                Instant real-time assistance with bookings, payments, and account queries.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openTawkChat()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#00A859", color: "#FFFFFF" }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start Live Chat</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-4" style={{ borderTop: "1px solid var(--hairline)", color: "var(--muted)" }}>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Usually replies in &lt; 5 minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dedicated HelpMeMan Support Agents</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-3xl p-6 md:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
            <HelpCircle className="w-4 h-4" style={{ color: "var(--fg)" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Frequently Asked Questions</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Quick answers to common questions.</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl transition-colors"
                style={{
                  border: "1px solid var(--hairline)",
                  background: isOpen ? "color-mix(in srgb, var(--fg) 4%, transparent)" : "transparent",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm cursor-pointer"
                  style={{ color: "var(--fg)" }}
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ color: "var(--muted)" }} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)", borderTop: "1px solid var(--hairline)" }}>
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Support & Grievance */}
      <div className="rounded-3xl p-6 md:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
              <Mail className="w-4 h-4" style={{ color: "var(--fg)" }} />
            </div>
            <div>
              <h4 className="text-sm font-bold" style={{ color: "var(--fg)" }}>Email Support</h4>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Prefer email? Write to our team at support@helpmeman.com</p>
            </div>
          </div>
          <a
            href="mailto:support@helpmeman.com"
            className="px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow transition-opacity flex items-center gap-2 hover:opacity-90"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            <span>Write Email</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function NotificationSettingsPanel() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const prefs = localStorage.getItem("helpmeman.notif_prefs");
      if (prefs) {
        const parsed = JSON.parse(prefs);
        setEmailNotifs(parsed.emailNotifs ?? true);
        setBookingReminders(parsed.bookingReminders ?? true);
        setMarketingNotifs(parsed.marketingNotifs ?? false);
      }
    } catch {}
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("helpmeman.notif_prefs", JSON.stringify({ emailNotifs, bookingReminders, marketingNotifs }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl p-6 md:p-8 space-y-6" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
          <Bell className="w-4 h-4" style={{ color: "var(--fg)" }} />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Notification Preferences</h3>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Choose how and when HelpMeMan contacts you.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Email Notifications</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Receive email updates about your session status and account activity.</p>
          </div>
          <button
            type="button"
            onClick={() => setEmailNotifs(!emailNotifs)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${emailNotifs ? "bg-emerald-500" : "bg-gray-400/30"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Booking Reminders</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Get reminded 1 hour and 15 minutes before your upcoming sessions.</p>
          </div>
          <button
            type="button"
            onClick={() => setBookingReminders(!bookingReminders)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${bookingReminders ? "bg-emerald-500" : "bg-gray-400/30"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${bookingReminders ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Platform Updates & Offers</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Receive occasional news about new features, top mentors, and special events.</p>
          </div>
          <button
            type="button"
            onClick={() => setMarketingNotifs(!marketingNotifs)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${marketingNotifs ? "bg-emerald-500" : "bg-gray-400/30"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${marketingNotifs ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4" style={{ borderTop: "1px solid var(--hairline)" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow flex items-center gap-2"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          {saved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
          <span>{saving ? "Saving..." : saved ? "Saved Preferences" : "Save Preferences"}</span>
        </button>
      </div>
    </div>
  );
}

export default function MenteeSettingsPage() {
  const { user, mentor, updateUser } = useAuth();
  const { currency: activeCurrency, setCurrency } = useCurrency();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "payments" | "privacy" | "support">("profile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "support" || tab === "notifications" || tab === "payments" || tab === "profile" || tab === "privacy") {
        setActiveTab(tab as any);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === "support") {
      setTawkVisibility(true);
    } else {
      setTawkVisibility(false);
    }
    return () => {
      setTawkVisibility(false);
    };
  }, [activeTab]);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [username, setUsername] = useState(user?.username ?? user?.email?.split("@")[0] ?? "");
  const [currentRole, setCurrentRole] = useState(user?.currentRole ?? "");

  const [saving, setSaving] = useState(false);

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(user?.avatar ?? null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setUsername(user.username ?? user.email?.split("@")[0] ?? "");
      setCurrentRole(user.currentRole ?? "");
      setCurrentAvatar(user.avatar ?? null);
      setImageError(false);
    }
  }, [user]);

  const hasChanges =
    name !== (user?.name ?? "") ||
    phone !== (user?.phone ?? "") ||
    username !== (user?.username ?? "") ||
    currentRole !== (user?.currentRole ?? "");

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCropImageSrc(reader.result as string); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    setAvatarSaving(true);
    try {
      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.png");
      const res = await api.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newAvatarUrl = res.data?.user?.avatar || res.data?.avatarUrl || res.data?.avatar;
      if (newAvatarUrl) {
        setCurrentAvatar(newAvatarUrl);
        setImageError(false);
        await updateUser(res.data?.user || { avatar: newAvatarUrl });
      }
    } catch {
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarSaving(false);
    }
  };

  const removePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;
    try {
      await api.delete("/users/avatar");
      setCurrentAvatar(null);
      await updateUser({ avatar: null });
    } catch {
      alert("Failed to remove photo");
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    setSaving(true);
    try {
      const res = await api.put("/users/me", {
        name: name.trim(),
        phone: phone.trim() || undefined,
        username: username.trim() || undefined,
        currentRole: currentRole.trim() || undefined,
      });
      if (res.data?.user) {
        await updateUser(res.data.user);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "privacy", label: "Privacy & DPDP", icon: ShieldCheck },
    { id: "support", label: "Help & Support", icon: HelpCircle },
  ] as const;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 md:px-0 py-4 md:py-8">
        <div className="mb-8 md:mb-10 flex flex-col gap-1.5">
          <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold" style={{ color: "var(--muted)" }}>Configuration</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: "var(--fg)" }}>Settings.</h1>
          <p className="text-sm md:text-base" style={{ color: "var(--muted)" }}>Manage your account preferences and profile.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mb-8 md:mb-10 p-1.5 rounded-2xl sm:rounded-full w-full" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-[13px] sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer"
                style={{
                  background: isActive ? "var(--fg)" : "transparent",
                  color: isActive ? "var(--bg)" : "var(--muted)",
                }}
              >
                <tab.icon className={`h-4 w-4 hidden sm:block ${isActive ? "" : "opacity-70"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-8 md:space-y-10">
          {activeTab === "profile" && (
            <>
              {/* Profile Photo Section */}
              <div className="rounded-3xl p-6 md:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center shadow-lg" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
                      {currentAvatar && !imageError ? (
                        <img
                          src={currentAvatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <span className="text-2xl md:text-3xl font-semibold tracking-tight opacity-90" style={{ color: "var(--fg)" }}>{initials}</span>
                      )}
                    </div>

                    <label className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer hover:scale-105 transition-transform shadow-md" style={{ background: "var(--fg)", color: "var(--bg)" }}>
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
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                        {name || "Your Name"}
                      </h3>
                      {currentRole ? (
                        <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--muted)" }}>
                          {currentRole}
                        </p>
                      ) : (
                        <p className="text-xs italic font-medium" style={{ color: "var(--muted)" }}>Add your current role below</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarSaving}
                        className="px-4 py-2 rounded-xl font-semibold text-xs cursor-pointer shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ background: "var(--fg)", color: "var(--bg)" }}
                      >
                        {avatarSaving ? "Uploading..." : "Change Photo"}
                      </button>
                      {user?.avatar && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="px-4 py-2 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                          style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="rounded-3xl p-6 md:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
                    <User className="w-4 h-4" style={{ color: "var(--fg)" }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Personal Information</h3>
                </div>

                <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold ml-1" style={{ color: "var(--muted)" }}>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-xl px-4 py-2.5 outline-none transition-colors text-xs sm:text-sm font-medium"
                      style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold ml-1" style={{ color: "var(--muted)" }}>Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-xs sm:text-sm" style={{ color: "var(--muted)" }}>@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="username"
                        className="w-full rounded-xl pl-8 pr-4 py-2.5 outline-none transition-colors text-xs sm:text-sm font-medium"
                        style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold ml-1" style={{ color: "var(--muted)" }}>Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full rounded-xl px-4 py-2.5 opacity-40 cursor-not-allowed italic text-xs sm:text-sm font-medium"
                      style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold ml-1" style={{ color: "var(--muted)" }}>Phone Number</label>
                    <div className="flex gap-2">
                      <div className="w-14 rounded-xl flex items-center justify-center font-mono text-xs sm:text-sm py-2.5 font-semibold" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)", color: "var(--fg)" }}>
                        +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit number"
                        className="flex-1 rounded-xl px-4 py-2.5 outline-none transition-colors text-xs sm:text-sm font-medium"
                        style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold ml-1" style={{ color: "var(--muted)" }}>Current Role</label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g. Software Engineer, Product Manager"
                      className="w-full rounded-xl px-4 py-2.5 outline-none transition-colors text-xs sm:text-sm font-medium"
                      style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.15em] font-semibold ml-1" style={{ color: "var(--muted)" }}>Preferred Currency</label>
                    <select
                      value={activeCurrency}
                      onChange={(e) => setCurrency(e.target.value, true)}
                      className="w-full rounded-xl px-4 py-2.5 outline-none transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                      style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                    >
                      {Object.entries(CURRENCY_CONFIGS).map(([code, config]) => (
                        <option key={code} value={code} style={{ background: "var(--bg)", color: "var(--fg)" }}>
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
                        className="px-4 py-2 font-semibold text-xs cursor-pointer rounded-xl transition-colors"
                        style={{ color: "var(--muted)" }}
                      >
                        Discard Changes
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded-xl font-semibold text-xs transition-opacity disabled:opacity-50 cursor-pointer shadow"
                        style={{ background: "var(--fg)", color: "var(--bg)" }}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Platform Review Section */}
              <div className="rounded-3xl p-6 md:p-8 mt-6" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Platform Review & Feedback</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Share your experience to help us improve HelpMeMan.</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
                  Your feedback directly influences platform features and helps other mentees make informed decisions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("open-platform-review-modal"));
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow flex items-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "var(--fg)", color: "var(--bg)" }}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Leave or Edit Review</span>
                </button>
              </div>

              {/* Help & Support Card */}
              <div className="rounded-3xl p-6 md:p-8 mt-6" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Help & Support</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Need assistance with your account, sessions, or payments?</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
                  Our dedicated support team is available in real-time. Chat live with us or check quick answers to common questions.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("support")}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow flex items-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "var(--fg)", color: "var(--bg)" }}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Open Help & Support</span>
                </button>
              </div>
            </>
          )}

          {activeTab === "notifications" && <NotificationSettingsPanel />}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="rounded-3xl p-6 md:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
                    <CreditCard className="w-4 h-4" style={{ color: "var(--fg)" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Payment History</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>All payments you&apos;ve made on HelpMeMan.</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl" style={{ border: "1px dashed var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
                  <CreditCard className="w-8 h-8 mb-3" style={{ color: "var(--muted)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>No payments yet</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>When you book sessions, your payment history will appear here.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && <PrivacyDataPanel userRole="STUDENT" />}

          {activeTab === "support" && <MenteeSupportPanel />}
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