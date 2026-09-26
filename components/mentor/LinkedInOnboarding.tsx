"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  MapPin,
  Edit3,
  X,
  Plus,
  Shield,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronRight,
  User,
  DollarSign,
  Calendar,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LinkedInImportedData {
  linkedinId?: string;
  name?: string;
  headline?: string;
  about?: string;
  profileImage?: string;
  location?: string;
  profileUrl?: string;
  currentPosition?: string;
  company?: string;
  experiences?: Array<{ title?: string; company?: string; duration?: string }>;
  education?: Array<{ institution?: string; degree?: string; fieldOfStudy?: string }>;
  skills?: string[];
  certifications?: string[];
}

export interface RuthAnalysis {
  suggestedHeadline: string;
  suggestedBio: string;
  expertiseAreas: string[];
  mentoringTopics: string[];
  mentorCategories: string[];
  suggestedAudience: string[];
  suggestedSessionTopics: string[];
  missingInformation: string[];
  completionPercentage: number;
  importedList?: string[];
  stillNeededList?: string[];
}

export interface MentorFormState {
  displayName: string;
  headline: string;
  bio: string;
  currentRole: string;
  company: string;
  location: string;
  expertise: string[];
  mentoringTopics: string[];
  categorySlug: string;
  pricePerSession: number;
  sessionDuration: number;
  experienceYears: number;
  languages: string[];
  availabilities: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  avatar?: string;
}

interface LinkedInOnboardingProps {
  onContinueManual: () => void;
  initialImportedData?: LinkedInImportedData | null;
  initialError?: string | null;
  embedded?: boolean;
}

type Step = "choice" | "progress" | "review" | "missing_info" | "preview" | "published" | "error";

const DAYS_OF_WEEK = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
];

export default function LinkedInOnboarding({
  onContinueManual,
  initialImportedData = null,
  initialError = null,
  embedded = false,
}: LinkedInOnboardingProps) {
  const router = useRouter();
  const { user, mentor, setSessionFromToken, refreshUser } = useAuth();

  const [step, setStep] = useState<Step>(
    initialError ? "error" : initialImportedData ? "review" : "choice"
  );
  const [errorMessage, setErrorMessage] = useState<string>(initialError || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animated progress state
  const [progressStage, setProgressStage] = useState(0);

  // Imported profile & Ruth suggestions
  const [importedProfile, setImportedProfile] = useState<LinkedInImportedData | null>(
    initialImportedData
  );
  const [ruthAnalysis, setRuthAnalysis] = useState<RuthAnalysis | null>(null);

  // Editable mentor form state
  const [form, setForm] = useState<MentorFormState>({
    displayName: "",
    headline: "",
    bio: "",
    currentRole: "",
    company: "",
    location: "India",
    expertise: [],
    mentoringTopics: [],
    categorySlug: "general-mentorship",
    pricePerSession: 499,
    sessionDuration: 30,
    experienceYears: 3,
    languages: ["English", "Hindi"],
    availabilities: [
      { dayOfWeek: 1, startTime: "18:00", endTime: "21:00" },
      { dayOfWeek: 3, startTime: "18:00", endTime: "21:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "16:00" },
    ],
    avatar: "",
  });

  const [newSkillInput, setNewSkillInput] = useState("");
  const [newTopicInput, setNewTopicInput] = useState("");
  const [isEditingReview, setIsEditingReview] = useState(false);

  // ── Initialize form from imported data and Ruth analysis ──────────────────
  const applyDataToForm = useCallback((imported: LinkedInImportedData, analysis: RuthAnalysis) => {
    setForm({
      displayName: imported.name || user?.name || "Mentor",
      headline: analysis.suggestedHeadline || imported.headline || imported.currentPosition || "Experienced Mentor",
      bio: analysis.suggestedBio || imported.about || "Professional mentor helping students achieve their goals.",
      currentRole: imported.currentPosition || imported.headline || "Industry Specialist",
      company: imported.company || "Independent",
      location: imported.location || "India",
      expertise: analysis.expertiseAreas && analysis.expertiseAreas.length > 0
        ? analysis.expertiseAreas
        : imported.skills && imported.skills.length > 0
          ? imported.skills.slice(0, 6)
          : ["Career Guidance", "Mentorship", "Industry Insights"],
      mentoringTopics: analysis.mentoringTopics && analysis.mentoringTopics.length > 0
        ? analysis.mentoringTopics
        : ["Career Roadmap", "Resume & Portfolio Feedback", "Interview Preparation"],
      categorySlug: "general-mentorship",
      pricePerSession: 499,
      sessionDuration: 30,
      experienceYears: 3,
      languages: ["English", "Hindi"],
      availabilities: [
        { dayOfWeek: 1, startTime: "18:00", endTime: "21:00" },
        { dayOfWeek: 3, startTime: "18:00", endTime: "21:00" },
        { dayOfWeek: 6, startTime: "10:00", endTime: "16:00" },
      ],
      avatar: imported.profileImage || user?.avatar || "",
    });
  }, [user?.name, user?.avatar]);

  // ── Step progression animation ──────────────────────────────────────────
  const runProgressSequence = useCallback(async (imported: LinkedInImportedData) => {
    setStep("progress");
    setProgressStage(1); // Connecting to LinkedIn... ✓ Connected

    await new Promise((r) => setTimeout(r, 600));
    setProgressStage(2); // Importing your professional information...

    await new Promise((r) => setTimeout(r, 800));
    setProgressStage(3); // Ruth AI is preparing your mentor profile...

    try {
      // Call Ruth AI analysis endpoint
      const { data: analysis } = await api.post<RuthAnalysis>("/linkedin/ruth/analyze", {
        profileData: imported,
      });

      setRuthAnalysis(analysis);
      applyDataToForm(imported, analysis);

      await new Promise((r) => setTimeout(r, 600));
      setProgressStage(4); // Finished

      await new Promise((r) => setTimeout(r, 400));
      setStep("review");
    } catch (err) {
      console.warn("[LinkedIn Onboarding] Ruth analysis fallback:", err);
      // Construct fallback analysis
      const fallbackAnalysis: RuthAnalysis = {
        suggestedHeadline: imported.headline || `${imported.currentPosition || "Mentor"} at ${imported.company || "Leading Firm"}`,
        suggestedBio: imported.about || `${imported.name || "Mentor"} is an experienced professional offering actionable career guidance, interview insights, and practical mentorship.`,
        expertiseAreas: imported.skills?.slice(0, 6) || ["Career Strategy", "Industry Guidance", "Mentorship"],
        mentoringTopics: ["Career exploration", "Resume & Profile Review", "Interview Preparation"],
        mentorCategories: ["Career Guidance", "Technology"],
        suggestedAudience: ["Students", "Early-career Professionals"],
        suggestedSessionTopics: ["1-on-1 Mentorship Strategy", "Portfolio & Resume Review"],
        missingInformation: ["Pricing", "Availability", "Mentoring Experience"],
        completionPercentage: 75,
        importedList: ["Full Name", "Current Role", "Company"],
        stillNeededList: ["Pricing", "Availability", "Mentoring Experience"],
      };
      setRuthAnalysis(fallbackAnalysis);
      applyDataToForm(imported, fallbackAnalysis);
      setStep("review");
    }
  }, [applyDataToForm]);

  // ── Handle OAuth URL redirect ───────────────────────────────────────────
  async function handleStartLinkedIn() {
    setIsConnecting(true);
    setErrorMessage("");
    try {
      // Request authorization URL from backend
      const returnPath = window.location.pathname;
      const { data } = await api.get<{ url: string }>(`/linkedin/auth-url?returnPath=${encodeURIComponent(returnPath)}`);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to generate LinkedIn authentication link.");
      }
    } catch (err: any) {
      console.error("[LinkedIn Onboarding] Start error:", err);
      setIsConnecting(false);
      setErrorMessage(
        err?.response?.data?.error ||
        "Unable to start LinkedIn connection. Please try again or continue manually."
      );
      setStep("error");
    }
  }

  // ── Check if URL params contain OAuth callback results ──────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const linkedinSuccess = url.searchParams.get("linkedin");
    const linkedinError = url.searchParams.get("linkedinError");
    const token = url.searchParams.get("token");
    const refreshToken = url.searchParams.get("refreshToken");

    if (linkedinError) {
      const detailedMessage = url.searchParams.get("message");
      // Clean up URL
      url.searchParams.delete("linkedinError");
      url.searchParams.delete("message");
      window.history.replaceState({}, "", url.toString());

      if (linkedinError === "cancelled") {
        setErrorMessage("LinkedIn connection was cancelled. You can continue manually.");
      } else if (linkedinError === "account_conflict") {
        setErrorMessage("This LinkedIn account is already linked to another HelpMeMan account.");
      } else if (detailedMessage) {
        setErrorMessage(decodeURIComponent(detailedMessage));
      } else {
        setErrorMessage("Unable to import your LinkedIn information right now. You can try again or continue manually.");
      }
      setStep("error");
      return;
    }

    if (linkedinSuccess === "success") {
      // Clean up URL params
      url.searchParams.delete("linkedin");
      url.searchParams.delete("token");
      url.searchParams.delete("refreshToken");
      window.history.replaceState({}, "", url.toString());

      // If token provided, establish session
      const establishAndLoad = async () => {
        if (token) {
          await setSessionFromToken(token, refreshToken || undefined);
        }
        try {
          const { data } = await api.get<{ connected: boolean; profile: LinkedInImportedData }>("/linkedin/profile");
          if (data && data.profile) {
            setImportedProfile(data.profile);
            runProgressSequence(data.profile);
          }
        } catch (fetchErr) {
          console.error("[LinkedIn Onboarding] Failed to fetch profile after callback:", fetchErr);
          setErrorMessage("Failed to load imported profile data. You can try again or continue manually.");
          setStep("error");
        }
      };

      establishAndLoad();
    }
  }, [runProgressSequence, setSessionFromToken]);

  // ── Publish profile action ──────────────────────────────────────────────
  async function handlePublishProfile() {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        displayName: form.displayName,
        bio: form.bio,
        currentRole: form.currentRole,
        company: form.company,
        location: form.location,
        pricePerSession: form.pricePerSession,
        sessionDuration: form.sessionDuration,
        languages: form.languages,
        expertise: form.expertise,
        mentoringTopics: form.mentoringTopics,
        categorySlug: form.categorySlug,
        availabilities: form.availabilities,
        avatar: form.avatar,
        experienceYears: form.experienceYears,
      };

      const { data } = await api.post("/linkedin/publish", payload);

      if (data.success) {
        setStep("published");
        await refreshUser();
      } else {
        throw new Error(data.error || "Failed to publish profile");
      }
    } catch (err: any) {
      console.error("[LinkedIn Onboarding] Publish failed:", err);
      setErrorMessage(err?.response?.data?.error || "Failed to publish profile. Please check all fields.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Tag helpers ─────────────────────────────────────────────────────────
  function addSkill() {
    const trimmed = newSkillInput.trim();
    if (trimmed && !form.expertise.includes(trimmed)) {
      setForm((prev) => ({ ...prev, expertise: [...prev.expertise, trimmed] }));
      setNewSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setForm((prev) => ({ ...prev, expertise: prev.expertise.filter((s) => s !== skill) }));
  }

  function addTopic() {
    const trimmed = newTopicInput.trim();
    if (trimmed && !form.mentoringTopics.includes(trimmed)) {
      setForm((prev) => ({ ...prev, mentoringTopics: [...prev.mentoringTopics, trimmed] }));
      setNewTopicInput("");
    }
  }

  function removeTopic(topic: string) {
    setForm((prev) => ({ ...prev, mentoringTopics: prev.mentoringTopics.filter((t) => t !== topic) }));
  }

  function toggleDay(day: number) {
    const exists = form.availabilities.some((a) => a.dayOfWeek === day);
    if (exists) {
      setForm((prev) => ({
        ...prev,
        availabilities: prev.availabilities.filter((a) => a.dayOfWeek !== day),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        availabilities: [...prev.availabilities, { dayOfWeek: day, startTime: "18:00", endTime: "21:00" }],
      }));
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 1: CHOICE SCREEN (Section 2)
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "choice") {
    return (
      <main className="relative flex min-h-[85vh] items-center justify-center px-4 py-8 text-[var(--fg)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--hairline)] bg-[var(--fg)]/[0.03] text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Mentor Onboarding
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight">
              Become a Mentor
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-md mx-auto">
              Build your professional mentor profile in minutes.
            </p>
          </div>

          {/* Choice Cards Container */}
          <div className="space-y-4">
            {/* OPTION 1: Continue with LinkedIn */}
            <div className="rounded-2xl border-2 border-blue-500/30 bg-[var(--bg)]/90 p-6 sm:p-7 shadow-[0_20px_60px_rgba(10,102,194,0.08)] backdrop-blur transition hover:border-blue-500/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-md">
                    <FaLinkedin className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-[var(--fg)]">
                        Continue with LinkedIn
                      </h2>
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                        Recommended
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
                      Import your professional information securely from LinkedIn.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-emerald-500" /> Official OAuth
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> You control publication
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Ruth AI assisted
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-continue-linkedin"
                  onClick={handleStartLinkedIn}
                  disabled={isConnecting}
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-3 text-sm font-semibold transition shadow-sm hover:scale-[1.02] disabled:opacity-60 cursor-pointer"
                >
                  {isConnecting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaLinkedin className="h-4 w-4" />
                      Continue with LinkedIn
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Consent notice */}
              <div className="mt-5 pt-4 border-t border-[var(--hairline)] flex items-start gap-2 text-[11px] text-[var(--muted)] leading-relaxed">
                <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--muted)]" />
                <p>
                  By continuing, you allow HelpMeMan to access the LinkedIn information available through the permissions you approve and use it to create your mentor profile. We will never post to your LinkedIn profile.
                </p>
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--hairline)]" />
              </div>
              <span className="relative bg-[var(--bg)] px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                OR
              </span>
            </div>

            {/* OPTION 2: Continue Manually */}
            <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)]/70 p-6 sm:p-7 transition hover:border-[var(--fg)]/30 backdrop-blur">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--fg)]/[0.06] text-[var(--fg)]">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--fg)]">
                      Continue Manually
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
                      I'll enter my information myself.
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Have a natural, focused conversation with Ruth AI to build your profile step-by-step.
                    </p>
                  </div>
                </div>

                <button
                  id="btn-continue-manual"
                  onClick={onContinueManual}
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--fg)]/[0.04] hover:bg-[var(--fg)]/[0.08] text-[var(--fg)] px-5 py-3 text-sm font-semibold transition cursor-pointer"
                >
                  Continue Manually
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 2: PROGRESS / LOADING EXPERIENCE (Section 11)
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "progress") {
    return (
      <main className="relative flex min-h-[80vh] items-center justify-center px-4 py-8 text-[var(--fg)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-[var(--hairline)] bg-[var(--bg)]/90 p-8 shadow-2xl backdrop-blur text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-6">
            <FaLinkedin className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-display font-semibold tracking-tight">
            Importing from LinkedIn
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
            Ruth AI is structuring your verified profile...
          </p>

          <div className="mt-8 space-y-4 text-left">
            {/* Stage 1 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--fg)]/[0.02] border border-[var(--hairline)]">
              {progressStage >= 1 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">Connecting to LinkedIn</p>
                {progressStage >= 1 && <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ LinkedIn connected</p>}
              </div>
            </div>

            {/* Stage 2 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--fg)]/[0.02] border border-[var(--hairline)]">
              {progressStage >= 2 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : progressStage === 1 ? (
                <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-[var(--hairline)] shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">Importing professional information</p>
                {progressStage >= 2 && <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Identity & role imported</p>}
              </div>
            </div>

            {/* Stage 3 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--fg)]/[0.02] border border-[var(--hairline)]">
              {progressStage >= 3 ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : progressStage === 2 ? (
                <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border border-[var(--hairline)] shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">Ruth AI preparing mentor profile</p>
                {progressStage >= 3 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ✓ Expertise identified & topics prepared
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 3: PROFILE REVIEW SCREEN (Section 6, 7, 8)
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "review") {
    return (
      <main className="relative min-h-screen px-4 py-10 text-[var(--fg)] max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
              <Check className="h-3.5 w-3.5" /> LinkedIn Information Imported
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight">
              Review your mentor profile
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Ruth AI imported the following information from LinkedIn. You must explicitly confirm the details before publishing.
            </p>
          </div>

          {/* Main review card */}
          <div className="space-y-6">
            {/* Identity & Basic Info Card */}
            <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)]/80 p-6 sm:p-8 backdrop-blur shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[var(--hairline)]">
                <div className="flex items-center gap-4">
                  {form.avatar ? (
                    <img
                      src={form.avatar}
                      alt={form.displayName}
                      className="h-20 w-20 rounded-2xl object-cover border border-[var(--hairline)] shadow-sm"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--fg)]/[0.06] text-2xl font-bold">
                      {form.displayName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{form.displayName}</h2>
                    <p className="text-sm font-medium text-[var(--muted)] mt-0.5">
                      {form.currentRole} {form.company ? `at ${form.company}` : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" /> {form.location || "India"}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-blue-500">
                        <FaLinkedin className="h-3.5 w-3.5" /> Verified via LinkedIn
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingReview(!isEditingReview)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--hairline)] text-xs font-semibold hover:bg-[var(--fg)]/[0.04] transition cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  {isEditingReview ? "Done Editing" : "Edit Profile"}
                </button>
              </div>

              {/* Editable Fields Mode */}
              {isEditingReview ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                      className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--fg)] outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
                        Current Role
                      </label>
                      <input
                        type="text"
                        value={form.currentRole}
                        onChange={(e) => setForm({ ...form, currentRole: e.target.value })}
                        className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--fg)] outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-2 text-sm text-[var(--fg)] outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Headline (Ruth AI Suggestion) */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Mentor Headline
                  </label>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" /> Suggested by Ruth AI
                  </span>
                </div>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--bg)]/70 px-4 py-2.5 text-sm font-medium text-[var(--fg)] outline-none focus:border-amber-500"
                  placeholder="e.g. Product Manager helping early-stage founders build AI products"
                />
              </div>

              {/* Bio (Ruth AI Suggestion) */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Professional Bio
                  </label>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" /> Suggested by Ruth AI
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full rounded-xl border border-[var(--hairline)] bg-[var(--bg)]/70 p-3.5 text-sm leading-relaxed text-[var(--fg)] outline-none focus:border-amber-500 resize-none"
                  placeholder="Share your verified background and what you guide students on..."
                />
              </div>

              {/* Expertise Areas */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Expertise Areas
                  </label>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" /> Suggested by Ruth AI
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--fg)]/[0.03] px-3 py-1 text-xs font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-[var(--muted)] hover:text-red-500 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add an expertise tag..."
                    className="flex-1 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-1.5 text-xs text-[var(--fg)] outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="rounded-xl border border-[var(--hairline)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--fg)]/[0.04] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Mentoring Topics */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Mentoring Topics
                  </label>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" /> Suggested by Ruth AI
                  </span>
                </div>
                <ul className="space-y-2 mb-3">
                  {form.mentoringTopics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--fg)]/[0.02] text-xs font-medium"
                    >
                      <span>• {topic}</span>
                      <button
                        type="button"
                        onClick={() => removeTopic(topic)}
                        className="text-[var(--muted)] hover:text-red-500 cursor-pointer ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
                    placeholder="Add a mentoring topic..."
                    className="flex-1 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3.5 py-1.5 text-xs text-[var(--fg)] outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTopic}
                    className="rounded-xl border border-[var(--hairline)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--fg)]/[0.04] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep("choice")}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--hairline)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition cursor-pointer"
              >
                Back to Methods
              </button>

              <button
                id="btn-continue-missing-info"
                type="button"
                onClick={() => setStep("missing_info")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fg)] text-[var(--bg)] px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition cursor-pointer"
              >
                Next: Complete Preferences
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 4: SMART PROFILE COMPLETION (Section 9)
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "missing_info") {
    const percentage = ruthAnalysis?.completionPercentage || 75;

    return (
      <main className="relative min-h-screen px-4 py-10 text-[var(--fg)] max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-semibold tracking-tight">
              A few remaining details
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Ruth only asks what's still missing so your profile is ready to accept mentees.
            </p>

            {/* Smart Completion Meter */}
            <div className="mt-6 p-4 rounded-2xl border border-[var(--hairline)] bg-[var(--bg)]/80 backdrop-blur max-w-lg mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span>Profile Readiness</span>
                <span className="text-emerald-500 font-bold">{percentage}% complete</span>
              </div>
              <div className="h-2.5 w-full bg-[var(--fg)]/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-left">
                <div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Imported from LinkedIn:</span>
                  <p className="text-[var(--muted)]">✓ Identity & Current Role</p>
                  <p className="text-[var(--muted)]">✓ Organization & Skills</p>
                </div>
                <div>
                  <span className="font-semibold text-amber-500">Still needed:</span>
                  <p className="text-[var(--muted)]">○ Pricing & Availability</p>
                  <p className="text-[var(--muted)]">○ Mentoring experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Focused Missing Info Form */}
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--bg)]/80 p-6 sm:p-8 backdrop-blur space-y-6">
            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Total Professional / Mentoring Experience (Years)
              </label>
              <div className="flex items-center gap-3">
                {[1, 3, 5, 8, 10].map((years) => (
                  <button
                    key={years}
                    type="button"
                    onClick={() => setForm({ ...form, experienceYears: years })}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      form.experienceYears === years
                        ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
                        : "border-[var(--hairline)] hover:border-[var(--fg)]/40"
                    }`}
                  >
                    {years === 10 ? "10+ yrs" : `${years} yrs`}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Pricing */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Session Fee (per session)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Community / Free", value: 0 },
                  { label: "₹499", value: 499 },
                  { label: "₹999", value: 999 },
                  { label: "₹1,499", value: 1499 },
                ].map((tier) => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setForm({ ...form, pricePerSession: tier.value })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      form.pricePerSession === tier.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "border-[var(--hairline)] hover:border-[var(--fg)]/30 text-xs"
                    }`}
                  >
                    <div className="text-sm font-bold">{tier.label}</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      {tier.value === 0 ? "Volunteer mentorship" : "Paid 1-on-1"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Duration */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Session Duration
              </label>
              <div className="flex gap-3">
                {[30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setForm({ ...form, sessionDuration: mins })}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      form.sessionDuration === mins
                        ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]"
                        : "border-[var(--hairline)] hover:border-[var(--fg)]/40"
                    }`}
                  >
                    {mins} minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Availability Days */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Days Available for Sessions
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(({ day, label }) => {
                  const isSelected = form.availabilities.some((a) => a.dayOfWeek === day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`h-10 w-12 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-[var(--hairline)] hover:border-[var(--fg)]/30"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                You can fine-tune your specific slots or connect Google Calendar anytime in your mentor dashboard.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={() => setStep("review")}
              className="px-5 py-2.5 rounded-xl border border-[var(--hairline)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] transition cursor-pointer"
            >
              Back to Review
            </button>

            <button
              id="btn-continue-preview"
              type="button"
              onClick={() => setStep("preview")}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--fg)] text-[var(--bg)] px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition cursor-pointer"
            >
              Preview Final Profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 5: FINAL PREVIEW SCREEN (Section 23)
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <main className="relative min-h-screen px-4 py-10 text-[var(--fg)] max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Final Confirmation
            </p>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight mt-1">
              Here is what mentees will see
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              You own the final decision. Once published, your profile becomes active on HelpMeMan.
            </p>
          </div>

          {/* High Fidelity Mentor Card Preview */}
          <div className="rounded-3xl border border-[var(--hairline)] bg-[var(--bg)] p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-[var(--hairline)]">
              <div className="flex items-center gap-4">
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt={form.displayName}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-[var(--hairline)] shadow"
                  />
                ) : (
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-[var(--fg)]/[0.06] text-xl font-bold">
                    {form.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold">{form.displayName}</h2>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                      <Shield className="h-3 w-3" /> Verified
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[var(--muted)] mt-0.5">
                    {form.headline}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {form.currentRole} {form.company ? `• ${form.company}` : ""}
                  </p>
                </div>
              </div>

              {/* Pricing & Duration pill */}
              <div className="hidden sm:block text-right">
                <span className="text-lg font-bold">
                  {form.pricePerSession === 0 ? "Free" : `₹${form.pricePerSession}`}
                </span>
                <span className="block text-[11px] text-[var(--muted)]">
                  / {form.sessionDuration} min session
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="py-5 border-b border-[var(--hairline)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                About Mentorship
              </p>
              <p className="text-sm leading-relaxed text-[var(--fg)]/90">
                {form.bio}
              </p>
            </div>

            {/* Expertise Tags */}
            <div className="py-5 border-b border-[var(--hairline)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                Expertise
              </p>
              <div className="flex flex-wrap gap-1.5">
                {form.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--hairline)] bg-[var(--fg)]/[0.03] px-3 py-1 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Mentoring Topics */}
            {form.mentoringTopics.length > 0 && (
              <div className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Session Topics
                </p>
                <ul className="space-y-1.5 text-xs text-[var(--fg)]/90">
                  {form.mentoringTopics.map((topic) => (
                    <li key={topic} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Error notice if publish failed */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={() => setStep("review")}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[var(--hairline)] text-xs font-semibold hover:bg-[var(--fg)]/[0.04] transition cursor-pointer"
            >
              Edit Details
            </button>

            <button
              id="btn-publish-mentor-profile"
              type="button"
              onClick={handlePublishProfile}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 text-sm font-semibold transition hover:scale-[1.02] shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Publish Mentor Profile
                </>
              )}
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 6: PUBLISHED SUCCESS SCREEN
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "published") {
    return (
      <main className="relative flex min-h-[85vh] items-center justify-center px-4 py-8 text-[var(--fg)] text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg mb-6">
            <Check className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-display font-semibold tracking-tight">
            Profile Published!
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Welcome to the HelpMeMan mentor community, {form.displayName}. Your profile is now live and ready to connect with mentees.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => router.replace("/mentor")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--fg)] text-[var(--bg)] px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition cursor-pointer"
            >
              Go to Mentor Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCREEN 7: ERROR STATE (Section 12)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <main className="relative flex min-h-[80vh] items-center justify-center px-4 py-8 text-[var(--fg)]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-5">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-display font-semibold tracking-tight">
          LinkedIn Connection
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {errorMessage || "Unable to complete the LinkedIn connection."}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleStartLinkedIn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A66C2] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#004182] transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </button>

          <button
            type="button"
            onClick={onContinueManual}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--hairline)] px-5 py-2.5 text-xs font-semibold hover:bg-[var(--fg)]/[0.04] transition cursor-pointer"
          >
            Continue Manually
          </button>
        </div>
      </motion.div>
    </main>
  );
}
