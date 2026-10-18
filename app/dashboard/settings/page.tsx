"use client";

import { useState, useRef, useEffect } from "react";
import { User, Bell, CreditCard, Camera, Check, Building2, Award, Star, HelpCircle, MessageSquare, Mail, ExternalLink, ChevronRight, CheckCircle2, Clock, ShieldCheck, Plus, X, Globe } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { ImageCropModal } from "@/components/ImageCropModal";
import { PrivacyDataPanel } from "@/components/PrivacyDataPanel";
import { useCurrency, CURRENCY_CONFIGS } from "@/lib/currency-context";
import { useRouter } from "next/navigation";
import { openTawkChat, setTawkVisibility } from "@/components/TawkToScript";
import { BannerManager } from "@/components/BannerManager";
import { OrganizationAutocomplete } from "@/components/OrganizationAutocomplete";
import { LanguageProficiencySelector } from "@/components/LanguageProficiencySelector";
import { ProfileCard } from "@/components/ProfileCard";
import type { UserLanguage, OrganizationBranding, User as UserType } from "@/lib/types";

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
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(user?.bannerImageUrl ?? null);
  const [bannerPosition, setBannerPosition] = useState(user?.bannerPosition ?? "50% 50%");
  const [currentCompany, setCurrentCompany] = useState(user?.currentCompany ?? "");
  const [companyOrg, setCompanyOrg] = useState<OrganizationBranding | null>(user?.companyBranding ?? null);
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [universityOrg, setUniversityOrg] = useState<OrganizationBranding | null>(user?.universityBranding ?? null);
  const [degree, setDegree] = useState(user?.degree ?? "");
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear ? String(user.graduationYear) : "");
  const [city, setCity] = useState(user?.city ?? "");
  const [state, setState] = useState(user?.state ?? "");
  const [country, setCountry] = useState(user?.country ?? "India");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [languages, setLanguages] = useState<UserLanguage[]>(user?.languages ?? []);
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.socialLinks?.linkedin ?? "");
  const [githubUrl, setGithubUrl] = useState(user?.socialLinks?.github ?? "");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setHeadline(user.headline ?? "");
      setBio(user.bio ?? "");
      setBannerImageUrl(user.bannerImageUrl ?? null);
      setBannerPosition(user.bannerPosition ?? "50% 50%");
      setCurrentCompany(user.currentCompany ?? "");
      setCompanyOrg(user.companyBranding ?? null);
      setJobTitle(user.jobTitle ?? "");
      setUniversity(user.university ?? "");
      setUniversityOrg(user.universityBranding ?? null);
      setDegree(user.degree ?? "");
      setGraduationYear(user.graduationYear ? String(user.graduationYear) : "");
      setCity(user.city ?? "");
      setState(user.state ?? "");
      setCountry(user.country ?? "India");
      setSkills(user.skills ?? []);
      setLanguages(user.languages ?? []);
      setWebsiteUrl(user.websiteUrl ?? "");
      setLinkedinUrl(user.socialLinks?.linkedin ?? "");
      setGithubUrl(user.socialLinks?.github ?? "");
      setCurrentAvatar(user.avatar ?? null);
      setImageError(false);
    }
  }, [user]);

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

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) return;
    setSkills([...skills, trimmed]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        username: username.trim() || undefined,
        currentRole: currentRole.trim() || undefined,
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        bannerPosition,
        currentCompany: currentCompany.trim() || undefined,
        companyId: companyOrg?.id || undefined,
        jobTitle: jobTitle.trim() || undefined,
        university: university.trim() || undefined,
        universityId: universityOrg?.id || undefined,
        degree: degree.trim() || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) || undefined : undefined,
        skills,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        socialLinks: {
          linkedin: linkedinUrl.trim(),
          github: githubUrl.trim(),
        },
      };

      const [profileRes] = await Promise.all([
        api.put("/users/me", payload),
        api.put("/users/me/languages", { languages }),
      ]);

      if (profileRes.data?.user) {
        await updateUser({
          ...profileRes.data.user,
          languages,
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Preview user object synthesized for live card preview
  const previewUser: UserType = {
    id: user?.id || "preview-user",
    name: name || "Your Name",
    username: username || "username",
    email: user?.email || "email@example.com",
    role: user?.role || "STUDENT",
    isEmailVerified: true,
    avatar: currentAvatar,
    headline: headline || currentRole || "Full-Stack Developer | AI Enthusiast",
    bio: bio || "Passionate about building scalable systems and helping others grow in tech.",
    bannerImageUrl,
    bannerPosition,
    currentCompany: currentCompany || null,
    jobTitle: jobTitle || currentRole || null,
    university: university || null,
    skills: skills.length > 0 ? skills : ["React", "Node.js", "Python", "AI/ML"],
    city: city || "Ludhiana",
    state: state || "Punjab",
    country: country || "India",
    websiteUrl: websiteUrl || null,
    socialLinks: {
      linkedin: linkedinUrl || "",
      github: githubUrl || "",
    },
    followersCount: user?.followersCount || 84,
    followingCount: user?.followingCount || 238,
    languages: languages.length > 0 ? languages : [{ languageName: "English", proficiency: "Fluent" }, { languageName: "Hindi", proficiency: "Native" }],
    companyBranding: companyOrg,
    universityBranding: universityOrg,
    createdAt: user?.createdAt || new Date().toISOString(),
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
      <div className="max-w-6xl mx-auto px-4 md:px-0 py-4 md:py-8">
        <div className="mb-8 md:mb-10 flex flex-col gap-1.5">
          <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold" style={{ color: "var(--muted)" }}>Configuration</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: "var(--fg)" }}>Settings.</h1>
          <p className="text-sm md:text-base" style={{ color: "var(--muted)" }}>Manage your account preferences and professional profile.</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Cover Banner Manager */}
                <div className="rounded-3xl p-6 md:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>Cover Banner</h3>
                      <p className="text-xs text-[var(--muted)]">Upload a custom banner or let our system generate one automatically.</p>
                    </div>
                  </div>
                  <BannerManager
                    currentBannerUrl={bannerImageUrl}
                    bannerPosition={bannerPosition}
                    onUpdate={(newUrl, newPos) => {
                      setBannerImageUrl(newUrl);
                      if (newPos) setBannerPosition(newPos);
                    }}
                  />
                </div>

                {/* 2. Profile Photo */}
                <div className="rounded-3xl p-6 md:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
                        {currentAvatar && !imageError ? (
                          <img
                            src={currentAvatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <span className="text-2xl font-bold tracking-tight opacity-90" style={{ color: "var(--fg)" }}>{initials}</span>
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

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: "var(--fg)" }}>Profile Picture</h4>
                        <p className="text-xs text-[var(--muted)]">A professional circular photo overlapping your profile banner.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={avatarSaving}
                          className="px-3.5 py-1.5 rounded-xl font-semibold text-xs cursor-pointer shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ background: "var(--fg)", color: "var(--bg)" }}
                        >
                          {avatarSaving ? "Uploading..." : "Change Photo"}
                        </button>
                        {user?.avatar && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="px-3.5 py-1.5 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                            style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Personal & Professional Details Form */}
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="rounded-3xl p-6 md:p-8 space-y-5" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--hairline)]">
                      <User size={16} className="text-[var(--muted)]" />
                      <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>Personal & Role Information</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Username</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] font-semibold">@</span>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                            placeholder="username"
                            className="w-full rounded-xl pl-8 pr-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                            style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Professional Headline</label>
                        <input
                          type="text"
                          value={headline}
                          onChange={(e) => setHeadline(e.target.value)}
                          placeholder="e.g. Full-Stack Developer | AI Enthusiast | Open Source Contributor"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Job Title / Current Role</label>
                        <input
                          type="text"
                          value={currentRole}
                          onChange={(e) => {
                            setCurrentRole(e.target.value);
                            setJobTitle(e.target.value);
                          }}
                          placeholder="e.g. Software Engineer"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Phone Number</label>
                        <div className="flex gap-2">
                          <span className="px-3 py-2 rounded-xl text-xs font-mono font-semibold border border-[var(--hairline)] bg-[color:var(--fg)]/5">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="10-digit number"
                            className="flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                            style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Company & University Branding */}
                  <div className="rounded-3xl p-6 md:p-8 space-y-5" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--hairline)]">
                      <Building2 size={16} className="text-blue-500" />
                      <div>
                        <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>Organization Branding</h3>
                        <p className="text-xs text-[var(--muted)]">Select your company or university to automatically display its official logo badge.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Current Company</label>
                        <OrganizationAutocomplete
                          value={currentCompany}
                          onChange={(val, org) => {
                            setCurrentCompany(val);
                            setCompanyOrg(org || null);
                          }}
                          type="COMPANY"
                          placeholder="e.g. Google, Meta, Microsoft"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">University / College</label>
                        <OrganizationAutocomplete
                          value={university}
                          onChange={(val, org) => {
                            setUniversity(val);
                            setUniversityOrg(org || null);
                          }}
                          type="UNIVERSITY"
                          placeholder="e.g. IIT Delhi, IIT Bombay, NIT Jalandhar"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Degree / Program</label>
                        <input
                          type="text"
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          placeholder="e.g. B.Tech Computer Science"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Graduation Year</label>
                        <input
                          type="number"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          placeholder="e.g. 2025"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Skills Tags */}
                  <div className="rounded-3xl p-6 md:p-8 space-y-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>Skills & Expertise</h3>
                      <p className="text-xs text-[var(--muted)]">Displayed as clean, compact tags on your profile card.</p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Add skill (e.g. React, Node.js, Python, AI/ML)..."
                        className="flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                        style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[color:var(--fg)] text-[color:var(--bg)] hover:opacity-90 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-[var(--hairline)] bg-[color:var(--fg)]/5 text-[var(--fg)]"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:text-rose-500 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 6. Languages Spoken (Section 11) */}
                  <div className="rounded-3xl p-6 md:p-8 space-y-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>Languages Spoken</h3>
                      <p className="text-xs text-[var(--muted)]">Specify the languages you can communicate in and your proficiency level.</p>
                    </div>

                    <LanguageProficiencySelector
                      languages={languages}
                      onChange={(updatedLangs) => setLanguages(updatedLangs)}
                    />
                  </div>

                  {/* 7. Location & Bio */}
                  <div className="rounded-3xl p-6 md:p-8 space-y-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>Location & Bio</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Ludhiana"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Punjab"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g. India"
                          className="w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">Short Bio</label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell others about your professional background, expertise, or passions..."
                        className="w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                        style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                      />
                    </div>
                  </div>

                  {/* 8. Links */}
                  <div className="rounded-3xl p-6 md:p-8 space-y-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                    <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>Website & Social Links</h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-[var(--muted)] shrink-0" />
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://yourportfolio.com"
                          className="flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <FaLinkedin size={16} className="text-[#0a66c2] shrink-0" />
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <FaGithub size={16} className="text-[var(--fg)] shrink-0" />
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium border border-[var(--hairline)] focus:outline-none"
                          style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button Bar */}
                  <div className="sticky bottom-4 z-20 p-4 rounded-2xl border border-[var(--hairline)] shadow-xl flex items-center justify-between gap-4" style={{ background: "var(--bg)" }}>
                    {saveSuccess ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                        <Check size={16} />
                        <span>Profile updated successfully!</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">Changes are saved directly to your live profile.</span>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl font-semibold text-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
                      style={{ background: "var(--fg)", color: "var(--bg)" }}
                    >
                      {saving ? "Saving Changes..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Instant Live Preview */}
              <div className="lg:col-span-5 sticky top-8 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                      Instant Live Preview
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted)]">Updates in real-time</span>
                </div>

                {/* Render master ProfileCard in live interactive mode */}
                <ProfileCard
                  profile={previewUser}
                  mode="user"
                  className="shadow-2xl"
                />

                <p className="text-[11px] text-center text-[var(--muted)] italic">
                  This is how other users and mentees will see your card across HelpMeMan.
                </p>
              </div>
            </div>

              {/* Apply as a Mentor Card */}
              {user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN" && (
                <div
                  className="rounded-3xl p-6 md:p-8 mt-6 relative overflow-hidden transition-all"
                  style={{
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, color-mix(in srgb, var(--fg) 2%, transparent) 100%)",
                  }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/15 text-amber-500 rounded-2xl border border-amber-500/30 shadow-sm shrink-0">
                          <Award className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                              {mentor?.approvalStatus === "APPROVED"
                                ? "Mentor Portal"
                                : mentor?.approvalStatus === "PENDING"
                                ? "Mentor Application Pending"
                                : "Apply as a Mentor"}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              {mentor?.approvalStatus === "APPROVED"
                                ? "Active Mentor"
                                : mentor?.approvalStatus === "PENDING"
                                ? "Under Review"
                                : "Join Us"}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                            {mentor?.approvalStatus === "APPROVED"
                              ? "Manage your bookings, availability, and session earnings in your mentor workspace."
                              : mentor?.approvalStatus === "PENDING"
                              ? "Your application is currently being reviewed by our team. You can check the status anytime."
                              : "Share your knowledge, guide medical & exam aspirants, and earn by hosting 1-on-1 sessions."}
                          </p>
                        </div>
                      </div>

                      <button
                        id="apply-as-mentor-button"
                        type="button"
                        onClick={() => {
                          if (mentor?.approvalStatus === "APPROVED") {
                            router.push("/mentor");
                          } else if (mentor?.approvalStatus === "PENDING") {
                            router.push("/mentor/status");
                          } else {
                            router.push("/onboarding?role=mentor");
                          }
                        }}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl font-semibold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                        style={{ background: "#F59E0B", color: "#000000" }}
                      >
                        <span>
                          {mentor?.approvalStatus === "APPROVED"
                            ? "Go to Mentor Portal"
                            : mentor?.approvalStatus === "PENDING"
                            ? "View Application Status"
                            : "Apply as a Mentor"}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {!mentor && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-amber-500/15 text-xs">
                        <div className="flex items-center gap-2" style={{ color: "var(--fg)" }}>
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Set your own price & schedule</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: "var(--fg)" }}>
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>1-on-1 Google Meet sessions</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: "var(--fg)" }}>
                          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Official Verified Mentor badge</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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