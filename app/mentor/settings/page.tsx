"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Camera,
  Briefcase,
  Globe,
  Clock,
  Save,
  Link as LinkIcon,
  Zap,
  Building2,
  CheckCircle2,
  X,
  Languages,
  ChevronDown,
  Plus,
  HelpCircle,
  MessageSquare,
  Mail,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";
import { ImageCropModal } from "@/components/ImageCropModal";
import { CascadingAddressSelect } from "@/components/CascadingAddressSelect";
import { openTawkChat, setTawkVisibility } from "@/components/TawkToScript";

function MentorSupportPanel() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How and when are mentor payouts processed?",
      a: "Mentor payouts are processed automatically on a weekly cycle directly to your registered bank account / UPI ID. You can track all settled and upcoming payouts under 'Earnings' in your sidebar.",
    },
    {
      q: "What happens if a mentee does not show up to a session?",
      a: "If a mentee does not join the meeting within 15 minutes of the scheduled start time, you can mark the session as a mentee no-show. You will receive 100% of the agreed session fee.",
    },
    {
      q: "How do I connect my Google Calendar for availability?",
      a: "Navigate to 'Calendar' in your mentor sidebar and click 'Connect Google Calendar'. This enables real-time two-way synchronization, preventing scheduling conflicts.",
    },
    {
      q: "Can I adjust my pricing or session duration?",
      a: "Yes, you can update your pricing and session duration anytime under the 'Profile Settings' tab on this page. Changes apply to all new bookings immediately.",
    },
    {
      q: "How can I temporarily pause receiving bookings?",
      a: "Go to 'Availability' in your mentor sidebar to disable slots or set custom vacation dates. You won't receive booking requests for those periods.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Chat Card */}
      <div
        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
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
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: "var(--fg)" }}>Mentor Live Support</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Priority · Online
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                Direct assistance with payouts, session conflicts, and profile verification.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openTawkChat()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "#00A859", color: "#FFFFFF" }}
          >
            <MessageSquare size={16} />
            <span>Start Live Chat</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-4" style={{ borderTop: "1px solid var(--hairline)", color: "var(--muted)" }}>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-emerald-500" />
            <span>Dedicated Mentor Priority Queue (&lt; 5 mins)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Mentor Success Desk</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
            <HelpCircle size={18} style={{ color: "var(--fg)" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Mentor Guidelines & FAQs</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Answers to frequent mentor operational questions.</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl transition-colors"
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
                  <ChevronRight size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ color: "var(--muted)" }} />
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

      {/* Mentor Support Email & Grievance */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
              <Mail size={18} style={{ color: "var(--fg)" }} />
            </div>
            <div>
              <h4 className="text-sm font-bold" style={{ color: "var(--fg)" }}>Dedicated Mentor Email Desk</h4>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Email us directly at support@helpmeman.com</p>
            </div>
          </div>
          <a
            href="mailto:support@helpmeman.com"
            className="px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow transition-opacity flex items-center gap-2 hover:opacity-90"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            <span>Email Mentor Desk</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
import { LanguageMultiSelect } from "@/components/LanguageMultiSelect";
import { Skeleton } from "@/components/Skeleton";
import type { Mentor } from "@/lib/types";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "ur", label: "Urdu" },
  { value: "gu", label: "Gujarati" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "or", label: "Odia" },
  { value: "pa", label: "Punjabi" },
];

const EXPERTISE_SUGGESTIONS = [
  "React", "Node.js", "System Design", "Data Structures & Algorithms",
  "Product Management", "Machine Learning", "Python", "Go",
  "AWS", "DevOps", "GraphQL", "TypeScript", "Frontend Architecture",
  "Backend Engineering", "Mobile Development", "Flutter", "iOS / Swift",
  "UI/UX Design", "Career Transition", "Mock Interviews", "Resume Review",
];

const SESSION_DURATIONS = [
  { value: "30", label: "30 Minutes (Quick Chat)" },
  { value: "45", label: "45 Minutes (Standard)" },
  { value: "60", label: "60 Minutes (Deep Dive)" },
  { value: "90", label: "90 Minutes (Workshop)" },
];

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
      {children}
    </span>
  );
}

function Field({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <InputLabel>{label}</InputLabel>
      {children}
      {description && <p className="text-[10px] italic font-medium" style={{ color: "var(--muted)" }}>{description}</p>}
    </div>
  );
}

function inputStyle() {
  return {
    border: "1px solid var(--hairline)",
    background: "color-mix(in srgb, var(--fg) 3%, transparent)",
    color: "var(--fg)",
  };
}

export default function MentorSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser } = useAuth();

  const TABS = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "support", label: "Help & Support", icon: HelpCircle },
  ] as const;

  const [activeTab, setActiveTab] = useState<"profile" | "support">("profile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "support") {
        setActiveTab("support");
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

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [sessionDuration, setSessionDuration] = useState("30");
  const [skills, setSkills] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  const [mentorAddress, setMentorAddress] = useState({
    country: "",
    state: "",
    city: "",
    locality: "",
    postalCode: "",
  });

  const [mentorLanguages, setMentorLanguages] = useState<string[]>([]);

  useEffect(() => {
    api
      .get("/mentor/me")
      .then((res) => {
        const m: Mentor = res.data.mentor;
        setMentor(m);
        setDisplayName(m.displayName ?? "");
        setBio(m.bio ?? "");
        setLinkedinUrl(m.linkedinUrl ?? "");
        setCurrentRole(m.currentRole ?? "");
        setCompany(m.company ?? "");
        setExperienceYears(m.experienceYears != null ? String(m.experienceYears) : "");
        setPricePerSession(m.pricePerSession != null ? String(m.pricePerSession) : "");
        setSessionDuration(m.sessionDuration != null ? String(m.sessionDuration) : "30");
        setSkills(m.expertise ?? []);
        setPreferredLanguage((m as any).preferredLanguage ?? "en");
        setAvatarPreview(m.avatar ?? null);
        setImageError(false);

        setMentorAddress({
          country: (m as any).country ?? "",
          state: (m as any).state ?? "",
          city: (m as any).city ?? "",
          locality: (m as any).locality ?? "",
          postalCode: (m as any).postalCode ?? "",
        });

        setMentorLanguages(Array.isArray(m.languages) ? m.languages : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    setAvatarSaving(true);
    try {
      const formData = new FormData();
      formData.append("avatar", croppedBlob, "avatar.png");
      const res = await api.put("/mentor/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res.data.avatar;
      setAvatarPreview(newUrl);
      setImageError(false);
      await updateUser({ avatar: newUrl });
      toast("Profile photo updated successfully", "success");
    } catch {
      toast("Failed to update photo. Please try again.", "error");
    } finally {
      setAvatarSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setExpertiseInput("");
    setShowSuggestions(false);
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExpertiseKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(expertiseInput);
    } else if (e.key === "Backspace" && !expertiseInput && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      addSkill(val.replace(",", ""));
    } else {
      setExpertiseInput(val);
      setShowSuggestions(val.trim().length > 0);
    }
  };

  const filteredSuggestions = EXPERTISE_SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(expertiseInput.toLowerCase().trim()) &&
      !skills.includes(s)
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        linkedinUrl: linkedinUrl.trim() || null,
        currentRole: currentRole.trim() || null,
        company: company.trim() || null,
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        pricePerSession: pricePerSession ? parseInt(pricePerSession) : 0,
        sessionDuration: parseInt(sessionDuration),
        expertise: skills,
        preferredLanguage,
        country: mentorAddress.country || null,
        state: mentorAddress.state || null,
        city: mentorAddress.city || null,
        locality: mentorAddress.locality || null,
        postalCode: mentorAddress.postalCode || null,
        languages: mentorLanguages,
      };

      const res = await api.put("/mentor/me", payload);
      setMentor(res.data.mentor);
      await updateUser({ name: displayName.trim() });
      toast("Mentor profile updated successfully", "success");
    } catch (err: any) {
      toast(err.response?.data?.error || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "M";

  const currentAvatar = avatarPreview || mentor?.avatar || null;

  const isOnlineIndicator = (mentor as any)?.isOnline ?? true;
  const activePresenceStatus = (mentor as any)?.activeStatus ?? "Online";
  const avgResponseTimeMin = (mentor as any)?.avgResponseTimeMin;
  const responseTimeText = avgResponseTimeMin
    ? `${avgResponseTimeMin} mins`
    : "< 15 mins";

  if (loading) {
    return (
      <div className="max-w-3xl flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl flex flex-col gap-8">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>Mentor Panel</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--fg)" }}>
            Edit your profile<span className="text-amber-500">.</span>
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
            Configure how potential mentees see your professional profile and services.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 rounded-2xl sm:rounded-full w-full" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2.5 rounded-xl sm:rounded-full text-[13px] sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer"
                style={{
                  background: isActive ? "var(--fg)" : "transparent",
                  color: isActive ? "var(--bg)" : "var(--muted)",
                }}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "profile" && (
          <>
            <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <User size={18} className="text-amber-500" />
                </div>
                <h2 className="font-semibold text-base" style={{ color: "var(--fg)" }}>Mentor Information</h2>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Public Profile
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col gap-8">
              {/* Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6" style={{ borderBottom: "1px solid var(--hairline)" }}>
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center transition-all" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 6%, transparent)" }}>
                    {currentAvatar && !imageError ? (
                      <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                    ) : (
                      <span className="text-3xl font-semibold opacity-40" style={{ color: "var(--fg)" }}>{initials}</span>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity rounded-full">
                      <Camera size={22} className="text-white mb-1" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  {currentAvatar && (
                    <button
                      type="button"
                      onClick={() => setAvatarPreview(null)}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  )}
                  {avatarSaving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="text-center sm:text-left flex flex-col gap-1">
                  <h3 className="font-display text-2xl font-extrabold tracking-tight" style={{ color: "var(--fg)" }}>
                    {displayName || "Mentor Name"}
                  </h3>
                  {company ? (
                    <p className="text-sm font-semibold flex items-center justify-center sm:justify-start gap-1.5" style={{ color: "var(--muted)" }}>
                      <Building2 size={14} /> {company}
                    </p>
                  ) : (
                    <p className="text-xs italic font-medium" style={{ color: "var(--muted)" }}>Add a company below</p>
                  )}
                  <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarSaving}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {avatarSaving ? "Uploading..." : "Upload Photo"}
                    </button>
                    {currentAvatar && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name + LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Display Name">
                  <input
                    type="text"
                    placeholder="e.g. Arjun Verma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none font-medium"
                    style={inputStyle()}
                  />
                </Field>

                <Field label="LinkedIn URL">
                  <div className="relative">
                    <LinkIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none font-medium"
                      style={inputStyle()}
                    />
                  </div>
                </Field>
              </div>

              {/* Bio */}
              <Field label="Professional Bio" description="Max 500 characters. Tell us about your journey and expertise.">
                <textarea
                  rows={5}
                  placeholder="Share your experience as a mentor..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none font-medium"
                  style={inputStyle()}
                />
              </Field>

              {/* Role + Company + Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Field label="Current Role">
                  <div className="relative">
                    <Briefcase size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none font-medium"
                      style={inputStyle()}
                    />
                  </div>
                </Field>

                <Field label="Company">
                  <input
                    type="text"
                    placeholder="e.g. Google, Startup..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none font-medium"
                    style={inputStyle()}
                  />
                </Field>

                <Field label="Years of Experience">
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none font-medium"
                    style={inputStyle()}
                  />
                </Field>
              </div>

              {/* Geographic Address */}
              <div className="flex flex-col gap-1.5 p-5 rounded-2xl" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-2" style={{ color: "var(--fg)" }}>
                  <Globe size={16} className="text-amber-500" />
                  Geographic Location
                </h3>
                <CascadingAddressSelect
                  value={mentorAddress}
                  onChange={(updatedFields) => {
                    setMentorAddress(prev => ({ ...prev, ...updatedFields }));
                  }}
                />
              </div>

              {/* Languages Spoken */}
              <Field label="Languages Spoken" description="Select all languages you speak fluently. Popular choices are shown first.">
                <LanguageMultiSelect
                  selectedLanguages={mentorLanguages}
                  onChange={(langs) => setMentorLanguages(langs)}
                />
              </Field>

              {/* Presence Metrics */}
              <div className="rounded-2xl overflow-hidden my-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                <div className="px-4 sm:px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Zap size={18} className="text-emerald-500" />
                  </div>
                  <h2 className="font-semibold text-base" style={{ color: "var(--fg)" }}>Presence & Performance Metrics</h2>
                </div>
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1 p-4 rounded-xl" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)" }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Presence Status</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isOnlineIndicator ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{activePresenceStatus}</span>
                    </div>
                    <p className="text-[10px] mt-2 leading-relaxed font-medium" style={{ color: "var(--muted)" }}>
                      Automatically updated based on active browser page focus and mouse interactions.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 p-4 rounded-xl" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)" }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Avg. Response Time</span>
                    <span className="text-sm font-semibold mt-2" style={{ color: "var(--fg)" }}>{responseTimeText}</span>
                    <p className="text-[10px] mt-2 leading-relaxed font-medium" style={{ color: "var(--muted)" }}>
                      Calculated as the average interval between a student's first message and your first reply.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 p-4 rounded-xl" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 4%, transparent)" }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Platform Verification</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-emerald-600 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                        {mentor?.approvalStatus === 'APPROVED' ? 'Verified Partner' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-[10px] mt-2 leading-relaxed font-medium" style={{ color: "var(--muted)" }}>
                      Managed directly by the platform administration team.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferred Language */}
              <Field label="Preferred Language">
                <div className="relative">
                  <Languages size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full rounded-xl pl-10 pr-10 py-3 text-sm outline-none appearance-none cursor-pointer font-medium"
                    style={inputStyle()}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value} style={{ background: "var(--bg)", color: "var(--fg)" }}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                </div>
              </Field>

              {/* Expertise Chips */}
              <Field
                label="Expertise Areas"
                description="Type a skill and press Enter or comma to add. Click suggestions to select."
              >
                <div className="relative">
                  <div className="min-h-[52px] w-full rounded-xl p-2 flex flex-wrap gap-2 transition-all" style={inputStyle()}>
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={handleExpertiseChange}
                      onKeyDown={handleExpertiseKeyDown}
                      onFocus={() => expertiseInput.trim() && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder={skills.length === 0 ? "e.g. React, System Design..." : "Add more..."}
                      className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] px-2 py-1 font-medium"
                      style={{ color: "var(--fg)" }}
                    />
                  </div>

                  {/* Suggestion dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-2 rounded-xl shadow-2xl max-h-48 overflow-y-auto" style={{ border: "1px solid var(--hairline)", background: "var(--bg)" }}>
                      {filteredSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={() => addSkill(suggestion)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-500/10 hover:text-amber-600 transition-colors flex items-center justify-between group last:border-0 cursor-pointer"
                          style={{ borderBottom: "1px solid var(--hairline)", color: "var(--fg)" }}
                        >
                          {suggestion}
                          <Plus size={13} className="opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              {/* Pricing + Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Session Pricing (₹)">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: "var(--muted)" }}>₹</span>
                    <input
                      type="number"
                      placeholder="499"
                      min={0}
                      value={pricePerSession}
                      onChange={(e) => setPricePerSession(e.target.value)}
                      className="w-full rounded-xl pl-8 pr-4 py-3 text-sm outline-none font-medium"
                      style={inputStyle()}
                    />
                  </div>
                </Field>

                <Field label="Default Session Duration">
                  <div className="relative">
                    <Clock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full rounded-xl pl-10 pr-10 py-3 text-sm outline-none appearance-none cursor-pointer font-medium"
                      style={inputStyle()}
                    >
                      {SESSION_DURATIONS.map((d) => (
                        <option key={d.value} value={d.value} style={{ background: "var(--bg)", color: "var(--fg)" }}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)" }} />
                  </div>
                </Field>
              </div>
            </div>

            {/* Footer / Save */}
            <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow cursor-pointer"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                <Save size={16} className={saving ? "animate-pulse" : ""} />
                {saving ? "Saving..." : "Save Profile Updates"}
              </button>
            </div>
          </div>
            </form>

            {/* Help & Support Shortcut Card */}
            <div className="mt-8 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                  <HelpCircle size={20} className="text-emerald-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--fg)" }}>Mentor Help & Support</h3>
              </div>
              <p className="text-sm mb-6 font-medium" style={{ color: "var(--muted)" }}>
                Need help with session payouts, calendar sync, or mentee questions? Connect with our dedicated support team in real-time.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("support")}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity cursor-pointer shadow flex items-center gap-2 hover:opacity-90"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                <HelpCircle size={16} />
                <span>Open Help & Support</span>
              </button>
            </div>

            {/* Continue as Mentee Section */}
            <div className="mt-8 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
                  <Zap size={20} style={{ color: "var(--fg)" }} />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--fg)" }}>Continue as a Mentee</h3>
              </div>
              <p className="text-sm mb-6 font-medium" style={{ color: "var(--muted)" }}>
                Want to explore other domains, browse available mentors, or book a guidance session? Switch to the mentee workspace.
              </p>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("hmm.activeRole", "mentee");
                  router.push("/dashboard");
                }}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-opacity cursor-pointer shadow"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                Switch to Mentee Panel
              </button>
            </div>
          </>
        )}

        {activeTab === "support" && <MentorSupportPanel />}
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
