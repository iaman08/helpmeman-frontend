"use client";
// Force Next.js compiler cache bust after settings state refactoring


import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import {
  User, Save, Camera, X, Plus, Link as LinkIcon, Briefcase,
  Languages, ChevronDown, Award, CheckCircle2, Clock, Building2,
  Globe, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { ImageCropModal } from "@/components/ImageCropModal";
import type { Mentor } from "@/lib/types";
import { CascadingAddressSelect } from "@/components/CascadingAddressSelect";
import { LanguageMultiSelect } from "@/components/LanguageMultiSelect";
import { useAuth } from "@/lib/auth-context";


// ─── Indian + English language list ───
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi (हिन्दी)" },
  { value: "bn", label: "Bengali (বাংলা)" },
  { value: "te", label: "Telugu (తెలుగు)" },
  { value: "mr", label: "Marathi (मराठी)" },
  { value: "ta", label: "Tamil (தமிழ்)" },
  { value: "gu", label: "Gujarati (ગુજરાતી)" },
  { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { value: "ml", label: "Malayalam (മലയാളം)" },
  { value: "pa", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "or", label: "Odia (ଓଡ଼ିଆ)" },
];

const SKILL_SUGGESTIONS = [
  "React", "Node.js", "Python", "Java", "Kubernetes", "AWS", "System Design",
  "Product Management", "Machine Learning", "Data Structures", "Algorithms",
  "TypeScript", "Go", "Rust", "DevOps", "SQL", "MongoDB", "Docker", "DSA",
  "Interview Prep", "Resume Review", "Leadership", "Startup", "Finance",
];

const SESSION_DURATIONS = [
  { value: "15", label: "15 Minutes (Quick Chat)" },
  { value: "30", label: "30 Minutes (Regular)" },
  { value: "45", label: "45 Minutes (Extended)" },
  { value: "60", label: "60 Minutes (Deep Dive)" },
  { value: "90", label: "90 Minutes (Workshop)" },
];

// ─── Sub-components ───
function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">
      {children}
    </span>
  );
}

function Field({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <InputLabel>{label}</InputLabel>
      {children}
      {description && <p className="text-[10px] text-(--muted) italic">{description}</p>}
    </div>
  );
}

function inputCls() {
  return "w-full bg-(--fg)/5 border border-(--fg)/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)/20 focus:border-(--accent)/40 transition-all placeholder:text-(--muted)";
}

export default function MentorSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser } = useAuth();


  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [mentor?.avatar, avatarPreview]);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pricePerSession, setPricePerSession] = useState("");
  const [sessionDuration, setSessionDuration] = useState("30");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [experienceYears, setExperienceYears] = useState("");

  // Structured Address State
  const [mentorAddress, setMentorAddress] = useState({
    country: "",
    state: "",
    city: "",
    locality: "",
    postalCode: ""
  });

  // Languages array state
  const [mentorLanguages, setMentorLanguages] = useState<string[]>([]);

  // Cached calculated stats for read-only display
  const [responseTimeText, setResponseTimeText] = useState("Usually replies within a day");
  const [activePresenceStatus, setActivePresenceStatus] = useState("Offline");
  const [isOnlineIndicator, setIsOnlineIndicator] = useState(false);

  // Skills / Expertise
  const [skills, setSkills] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // ─── Load mentor data ───
  useEffect(() => {
    api.get("/mentor/me")
      .then((res) => {
        const m: Mentor = res.data.mentor ?? res.data;
        setMentor(m);
        setDisplayName(m.displayName ?? "");
        setBio(m.bio ?? "");
        setCurrentRole(m.currentRole ?? "");
        setCompany(m.company ?? "");
        setLinkedinUrl(m.linkedinUrl ?? "");
        setPricePerSession(String(Math.round((m.pricePerSession ?? 0) / 100)));
        setSessionDuration(String(m.sessionDuration ?? 30));
        setSkills((m.expertise ?? []) as string[]);
        
        // Structured Location
        setMentorAddress({
          country: m.country ?? "",
          state: m.state ?? "",
          city: m.city ?? "",
          locality: m.locality ?? "",
          postalCode: m.postalCode ?? ""
        });

        // Languages
        const langsArray = Array.isArray(m.languages)
          ? m.languages
          : typeof m.languages === 'string'
          ? (m.languages as string).split(',').map(s => s.trim()).filter(Boolean)
          : [];
        setMentorLanguages(langsArray);

        // Read-only automatic metrics
        setResponseTimeText(m.averageResponseTime ?? "Usually replies within a day");
        setActivePresenceStatus(m.activeStatus ?? "Offline");
        setIsOnlineIndicator(m.isOnline ?? false);

        setExperienceYears(m.experienceYears !== undefined && m.experienceYears !== null ? String(m.experienceYears) : "");
        if (m.avatar) setAvatarPreview(m.avatar);
      })
      .catch(() => toast("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, []);

  // ─── Avatar upload flow ───
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("File too large. Max 5MB allowed.", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedFile: File) => {
    const preview = URL.createObjectURL(croppedFile);
    setCropImageSrc(null);
    setAvatarPreview(preview);
    setAvatarSaving(true);
    try {
      const form = new FormData();
      form.append("avatar", croppedFile);
      const { data } = await api.put("/mentor/me", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = data.avatar || data.mentor?.avatar || preview;
      setAvatarPreview(newUrl);
      updateUser({ avatar: newUrl });
      toast("Profile photo updated!", "success");
    } catch {
      // fallback: try users/me endpoint
      try {
        const form2 = new FormData();
        form2.append("avatar", croppedFile);
        const { data } = await api.put("/users/me", form2, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newUrl = data.avatar || preview;
        setAvatarPreview(newUrl);
        updateUser({ avatar: newUrl });
        toast("Profile photo updated!", "success");
      } catch {
        setAvatarPreview(mentor?.avatar ?? null);
        toast("Failed to upload photo.", "error");
      }
    } finally {
      setAvatarSaving(false);
    }
  };

  // ─── Expertise chips ───
  const handleExpertiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(",")) {
      const skill = value.slice(0, -1).trim();
      addSkill(skill);
    } else {
      setExpertiseInput(value);
      if (value.trim()) {
        const filtered = SKILL_SUGGESTIONS.filter(
          (s) => s.toLowerCase().includes(value.toLowerCase()) && !skills.includes(s)
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setExpertiseInput("");
    setShowSuggestions(false);
  };

  const removeSkill = (index: number) => setSkills((prev) => prev.filter((_, i) => i !== index));

  const handleExpertiseKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && expertiseInput.trim()) {
      e.preventDefault();
      addSkill(expertiseInput);
    }
  };

  // ─── Save profile ───
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/mentor/me", {
        displayName,
        bio,
        currentRole,
        company,
        linkedinUrl,
        expertise: skills,
        pricePerSession: Number(pricePerSession) * 100,
        sessionDuration: Number(sessionDuration),
        preferredLanguage,
        country: mentorAddress.country,
        state: mentorAddress.state,
        city: mentorAddress.city,
        locality: mentorAddress.locality,
        postalCode: mentorAddress.postalCode,
        languages: mentorLanguages,
        experienceYears: experienceYears ? Number(experienceYears) : null,
      });
      updateUser({ name: displayName });
      toast("Profile updated successfully!", "success");
    } catch (err) {
      if (err instanceof AxiosError) {
        toast(err.response?.data?.error ?? "Update failed.", "error");
      } else {
        toast("Something went wrong.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const currentAvatar = avatarPreview ?? mentor?.avatar;
  const initials = (mentor?.displayName ?? displayName ?? "M")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="max-w-3xl flex flex-col gap-8">
        {/* ─── Header ─── */}
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.22em] text-(--muted) font-bold">Mentor Panel</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Edit your profile<span className="text-orange-500">.</span>
          </h1>
          <p className="text-sm text-(--muted)">
            Configure how potential mentees see your professional profile and services.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* ─── Card: Mentor Information ─── */}
          <div className="rounded-2xl border border-(--fg)/10 bg-(--fg)/[0.02] overflow-hidden">
            {/* Card header */}
            <div className="px-4 sm:px-6 py-4 border-b border-(--fg)/10 flex items-center justify-between bg-(--fg)/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <User size={18} className="text-orange-500" />
                </div>
                <h2 className="font-bold text-base">Mentor Information</h2>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">
                  Public Profile
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col gap-8">
              {/* ─── Photo Section ─── */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-(--fg)/10">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-(--fg)/8 border-2 border-dashed border-(--fg)/20 flex items-center justify-center ring-4 ring-orange-500/10 group-hover:border-orange-500/40 transition-all">
                    {currentAvatar && !imageError ? (
                      <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                    ) : (
                      <span className="text-3xl font-bold text-(--fg)/30">{initials}</span>
                    )}
                    {/* Hover overlay */}
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
                  {/* Remove button */}
                  {currentAvatar && (
                    <button
                      type="button"
                      onClick={() => setAvatarPreview(null)}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
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
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    {displayName || "Mentor Name"}
                  </h3>
                  {company ? (
                    <p className="text-sm text-(--muted) font-medium flex items-center justify-center sm:justify-start gap-1.5">
                      <Building2 size={14} /> {company}
                    </p>
                  ) : (
                    <p className="text-xs text-(--muted) italic">Add a company below</p>
                  )}
                  <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarSaving}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                    >
                      {avatarSaving ? "Uploading..." : "Upload Photo"}
                    </button>
                    {currentAvatar && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-(--fg)/5 text-(--muted) hover:text-(--fg) transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Name + LinkedIn ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Display Name">
                  <input
                    type="text"
                    placeholder="e.g. Arjun Verma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className={inputCls()}
                  />
                </Field>

                <Field label="LinkedIn URL">
                  <div className="relative">
                    <LinkIcon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)" />
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className={`${inputCls()} pl-10`}
                    />
                  </div>
                </Field>
              </div>

              {/* ─── Bio ─── */}
              <Field label="Professional Bio" description="Max 500 characters. Tell us about your journey and expertise.">
                <textarea
                  rows={5}
                  placeholder="Share your experience as a mentor..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`${inputCls()} resize-none`}
                />
              </Field>

              {/* ─── Role + Company + Experience ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Field label="Current Role">
                  <div className="relative">
                    <Briefcase size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)" />
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className={`${inputCls()} pl-10`}
                    />
                  </div>
                </Field>

                <Field label="Company">
                  <input
                    type="text"
                    placeholder="e.g. Google, Startup..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={inputCls()}
                  />
                </Field>

                <Field label="Years of Experience">
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className={inputCls()}
                  />
                </Field>
              </div>

              {/* ─── Geographic Address ─── */}
              <div className="flex flex-col gap-1.5 border border-(--fg)/10 p-5 rounded-2xl bg-(--fg)/[0.01]">
                <h3 className="font-bold text-sm text-(--fg) flex items-center gap-2 mb-2">
                  <Globe size={16} className="text-orange-500" />
                  Geographic Location
                </h3>
                <CascadingAddressSelect
                  value={mentorAddress}
                  onChange={(updatedFields) => {
                    setMentorAddress(prev => ({ ...prev, ...updatedFields }));
                  }}
                />
              </div>

              {/* ─── Languages Spoken ─── */}
              <Field label="Languages Spoken" description="Select all languages you speak fluently. Popular choices are shown first.">
                <LanguageMultiSelect
                  selectedLanguages={mentorLanguages}
                  onChange={(langs) => setMentorLanguages(langs)}
                />
              </Field>

              {/* ─── Presence & Performance Read-only Card ─── */}
              <div className="rounded-2xl border border-(--fg)/10 bg-(--fg)/[0.02] overflow-hidden my-4">
                <div className="px-4 sm:px-6 py-4 border-b border-(--fg)/10 flex items-center gap-3 bg-(--fg)/[0.02]">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Zap size={18} className="text-emerald-500" />
                  </div>
                  <h2 className="font-bold text-base text-(--fg)">Presence & Performance Metrics</h2>
                </div>
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1 p-4 rounded-xl bg-(--fg)/5 border border-(--fg)/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">Presence Status</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isOnlineIndicator ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className="text-sm font-bold text-(--fg)">{activePresenceStatus}</span>
                    </div>
                    <p className="text-[10px] text-(--muted) mt-2 leading-relaxed">
                      Automatically updated based on active browser page focus and mouse interactions.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 p-4 rounded-xl bg-(--fg)/5 border border-(--fg)/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">Avg. Response Time</span>
                    <span className="text-sm font-bold mt-2 text-(--fg)">{responseTimeText}</span>
                    <p className="text-[10px] text-(--muted) mt-2 leading-relaxed">
                      Calculated as the average interval between a student's first message and your first reply.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 p-4 rounded-xl bg-(--fg)/5 border border-(--fg)/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">Platform Verification</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                        {mentor?.approvalStatus === 'APPROVED' ? 'Verified Partner' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-[10px] text-(--muted) mt-2 leading-relaxed">
                      Managed directly by the platform administration team.
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── Preferred Language ─── */}
              <Field label="Preferred Language">
                <div className="relative">
                  <Languages size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none" />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className={`${inputCls()} pl-10 pr-10 appearance-none cursor-pointer`}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-(--bg) text-(--fg)">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none" />
                </div>
              </Field>

              {/* ─── Expertise Chips ─── */}
              <Field
                label="Expertise Areas"
                description="Type a skill and press Enter or comma to add. Click suggestions to select."
              >
                <div className="relative">
                  <div className="min-h-[52px] w-full bg-(--fg)/5 border border-(--fg)/10 rounded-xl p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-(--accent)/20 focus-within:border-(--accent)/40 transition-all">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="hover:text-red-400 transition-colors"
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
                      className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] px-2 py-1"
                    />
                  </div>

                  {/* Suggestion dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-(--bg) border border-(--fg)/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {filteredSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={() => addSkill(suggestion)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-500/10 hover:text-orange-500 transition-colors flex items-center justify-between group border-b border-(--fg)/5 last:border-0"
                        >
                          {suggestion}
                          <Plus size={13} className="opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              {/* ─── Pricing + Duration ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Session Pricing (₹)">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) font-bold text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="499"
                      min={0}
                      value={pricePerSession}
                      onChange={(e) => setPricePerSession(e.target.value)}
                      className={`${inputCls()} pl-8`}
                    />
                  </div>
                </Field>

                <Field label="Default Session Duration">
                  <div className="relative">
                    <Clock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none" />
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className={`${inputCls()} pl-10 pr-10 appearance-none cursor-pointer`}
                    >
                      {SESSION_DURATIONS.map((d) => (
                        <option key={d.value} value={d.value} className="bg-(--bg) text-(--fg)">
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted) pointer-events-none" />
                  </div>
                </Field>
              </div>
            </div>

            {/* ─── Footer / Save ─── */}
            <div className="px-4 sm:px-6 py-4 border-t border-(--fg)/10 bg-(--fg)/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-(--fg) text-(--bg) px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
              >
                <Save size={16} className={saving ? "animate-pulse" : ""} />
                {saving ? "Saving..." : "Save Profile Updates"}
              </button>
            </div>
          </div>
        </form>

        {/* ─── Continue as Mentee Section ─── */}
        <div className="mt-8 bg-(--fg)/5 border border-(--hairline) rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 md:p-10 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-(--fg)/10 rounded-xl">
              <Zap size={20} className="text-(--fg)" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Continue as a Mentee</h3>
          </div>
          <p className="text-sm text-(--muted) mb-6">
            Want to explore other domains, browse available mentors, or book a guidance session? Switch to the mentee workspace.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-(--fg) text-(--bg) hover:opacity-90 rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            Switch to Mentee Panel
          </button>
        </div>
      </div>

      {/* ─── Crop Modal ─── */}
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
