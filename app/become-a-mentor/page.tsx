"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Rocket,
  CheckCircle,
  Mail,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCategories } from "@/lib/hooks";
import { AxiosError } from "axios";

type Step = "info" | "institution" | "expertise" | "otp" | "done";
type InstitutionType = "COLLEGE" | "COMPANY" | "STARTUP";

const INST_OPTIONS: { value: InstitutionType; label: string; icon: typeof GraduationCap }[] = [
  { value: "COLLEGE", label: "College / University", icon: GraduationCap },
  { value: "COMPANY", label: "Company", icon: Building2 },
  { value: "STARTUP", label: "Startup", icon: Rocket },
];

export default function BecomeMentorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];

  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Personal info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Institution
  const [institutionType, setInstitutionType] = useState<InstitutionType>("COLLEGE");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionEmail, setInstitutionEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  // Step 3: Expertise
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [expertise, setExpertise] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricePerSession, setPricePerSession] = useState("499");
  const [sessionDuration, setSessionDuration] = useState("30");

  // Step 4: OTP
  const [otp, setOtp] = useState("");

  // Pre-fill if logged in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  function buildPayload() {
    return {
      name, email, password, phone, displayName: displayName || name,
      bio, institutionType, institutionName, institutionEmail,
      department: department || undefined,
      graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      currentRole: currentRole || undefined,
      company: company || undefined,
      linkedinUrl: linkedinUrl || undefined,
      expertise: expertise.split(",").map((s) => s.trim()).filter(Boolean),
      categoryId, pricePerSession: parseInt(pricePerSession) * 100,
      sessionDuration: parseInt(sessionDuration),
    };
  }

  async function handleSendOTP(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register/mentor", buildPayload());
      setStep("otp");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Failed to send OTP.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-mentor-otp", { ...buildPayload(), otp });
      // Store auth tokens
      localStorage.setItem("helpmeman.accessToken", res.data.accessToken);
      localStorage.setItem("helpmeman.refreshToken", res.data.refreshToken);
      localStorage.setItem("helpmeman.user", JSON.stringify(res.data.user));
      if (res.data.mentor) {
        localStorage.setItem("helpmeman.mentor", JSON.stringify(res.data.mentor));
      }
      setStep("done");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Invalid OTP.");
      } else {
        setError("Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ─── Step indicators ───
  const steps: { key: Step; label: string }[] = [
    { key: "info", label: "Personal" },
    { key: "institution", label: "Institution" },
    { key: "expertise", label: "Expertise" },
    { key: "otp", label: "Verify" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-(--bg)/70">
        <nav className="mx-auto flex max-w-[800px] items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-2xl tracking-tight">
            HelpMeMan<span className="text-(--muted)">.</span>
          </Link>
          <Link href="/signin" className="text-sm text-(--muted) hover:text-(--fg)">
            Already have an account?
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[600px] px-6 pt-28 pb-16">
        {step === "done" ? (
          /* ─── Success ─── */
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="font-display text-3xl">Application submitted!</h1>
            <p className="text-(--muted) max-w-sm leading-relaxed">
              Your mentor application is under review. You&rsquo;ll receive an
              email once approved. This usually takes 24–48 hours.
            </p>
            <Link
              href="/mentor"
              className="rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90"
            >
              Go to Mentor Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* ─── Progress bar ─── */}
            <div className="flex items-center gap-2 mb-10">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium shrink-0 ${
                      i <= currentIdx
                        ? "bg-(--accent) text-(--accent-fg)"
                        : "bg-(--fg)/5 text-(--muted)"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${i <= currentIdx ? "text-(--fg)" : "text-(--muted)"}`}>
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px ${i < currentIdx ? "bg-(--accent)" : "bg-(--fg)/10"}`} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            {/* ─── Step 1: Personal ─── */}
            {step === "info" && (
              <form
                onSubmit={(e) => { e.preventDefault(); setError(""); setStep("institution"); }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Step 1</p>
                  <h1 className="font-display text-3xl">Personal information.</h1>
                </div>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Full Name</span>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Email</span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    disabled={!!user}
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors disabled:opacity-50" />
                </label>
                {!user && (
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Password</span>
                    <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                  </label>
                )}
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Phone (optional)</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                </label>

                <button type="submit" className="self-end flex items-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 cursor-pointer">
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* ─── Step 2: Institution ─── */}
            {step === "institution" && (
              <form
                onSubmit={(e) => { e.preventDefault(); setError(""); setStep("expertise"); }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Step 2</p>
                  <h1 className="font-display text-3xl">Your institution.</h1>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {INST_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => setInstitutionType(opt.value)}
                      className={`flex flex-col items-center gap-2 rounded-xl py-4 text-sm cursor-pointer transition-colors ${
                        institutionType === opt.value ? "bg-(--accent) text-(--accent-fg)" : "bg-(--fg)/[0.02] hover:bg-(--fg)/5"
                      }`}>
                      <opt.icon className="h-5 w-5" />
                      {opt.label}
                    </button>
                  ))}
                </div>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Institution Name</span>
                  <input type="text" required value={institutionName} onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. IIT Bombay, Google, YC Startup"
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Institution Email</span>
                  <input type="email" required value={institutionEmail} onChange={(e) => setInstitutionEmail(e.target.value)}
                    placeholder="you@iitb.ac.in / you@google.com"
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                  <span className="text-[11px] text-(--muted)">We&rsquo;ll send an OTP to verify this email.</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Department</span>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CS, Product"
                      className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Graduation Year</span>
                    <input type="number" min={2000} max={2035} value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2023"
                      className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                  </label>
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep("info")}
                    className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--fg) cursor-pointer">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" className="flex items-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 cursor-pointer">
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ─── Step 3: Expertise ─── */}
            {step === "expertise" && (
              <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Step 3</p>
                  <h1 className="font-display text-3xl">Your expertise.</h1>
                </div>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Display Name</span>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={name || "How students will see you"}
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Bio</span>
                  <textarea required value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                    placeholder="Tell students about your journey..."
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors resize-none" />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Current Role</span>
                    <input type="text" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="SDE-2, PM, Founder..."
                      className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Company</span>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                      placeholder="Google, Startup name..."
                      className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">LinkedIn URL</span>
                  <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Expertise (comma-separated)</span>
                  <input type="text" required value={expertise} onChange={(e) => setExpertise(e.target.value)}
                    placeholder="DSA, System Design, PM Interviews"
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Category</span>
                  <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none cursor-pointer">
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Price per session (₹)</span>
                    <input type="number" required min={0} value={pricePerSession} onChange={(e) => setPricePerSession(e.target.value)}
                      className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">Duration (min)</span>
                    <select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}
                      className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none cursor-pointer">
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </label>
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep("institution")}
                    className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--fg) cursor-pointer">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 cursor-pointer disabled:opacity-50">
                    {loading ? "Sending OTP…" : "Verify & Submit"} <Mail className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ─── Step 4: OTP ─── */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Step 4</p>
                  <h1 className="font-display text-3xl">Verify your institution.</h1>
                  <p className="text-sm text-(--muted)">
                    We sent a 6-digit OTP to <strong>{institutionEmail}</strong>
                  </p>
                </div>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">OTP Code</span>
                  <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    className="bg-(--fg)/5 rounded-lg px-4 py-3 outline-none focus:bg-(--fg)/8 transition-colors text-center text-2xl tracking-[0.3em] font-mono" />
                </label>

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep("expertise")}
                    className="flex items-center gap-2 text-sm text-(--muted) hover:text-(--fg) cursor-pointer">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={loading || otp.length < 6}
                    className="flex items-center gap-2 rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 cursor-pointer disabled:opacity-50">
                    {loading ? "Verifying…" : "Complete Registration"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
