"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  Bot,
  Copy,
  Download,
  RotateCcw,
  Check,
  Star,
  UserCheck,
  Zap,
  Code2,
  Briefcase,
  Database,
  Stethoscope,
  Scale,
  GraduationCap,
  Palette,
  Layers,
} from "lucide-react";
import api from "@/lib/api";
import { FooterSection } from "@/components/landing/FooterSection";

interface BulletRewrite {
  original: string;
  optimized: string;
  reasoning: string;
}

interface AnalysisResult {
  atsScore: number;
  ratingTier: string;
  subScores: {
    keywords: number;
    formatting: number;
    impactMetrics: number;
    roleRelevance: number;
  };
  summary: string;
  theRoast: string;
  strengths: string[];
  missingKeywords: string[];
  bulletRewrites: BulletRewrite[];
  correctedResumeText: string;
  portfolioTips: string[];
}

interface RecommendedMentor {
  id: string;
  displayName: string;
  currentRole?: string | null;
  company?: string | null;
  institutionName?: string | null;
  avatar?: string | null;
  pricePerSession: number;
  rating: number;
}

const PRESET_ROLES = [
  { id: "sde", label: "Software Engineer / SDE", icon: Code2 },
  { id: "pm", label: "Product Manager", icon: Briefcase },
  { id: "data", label: "Data Scientist / AI", icon: Database },
  { id: "medical", label: "Doctor / Medical Resident", icon: Stethoscope },
  { id: "law", label: "Corporate Lawyer / Legal", icon: Scale },
  { id: "mba", label: "MBA & Strategy Consultant", icon: GraduationCap },
  { id: "design", label: "UI/UX & Product Designer", icon: Palette },
];

export default function ResumeRoastPage() {
  const [selectedRole, setSelectedRole] = useState("Software Engineer / SDE");
  const [customRole, setCustomRole] = useState("");
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recommendedMentors, setRecommendedMentors] = useState<RecommendedMentor[]>([]);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalRole = selectedRole === "custom" ? customRole || "Specialist" : selectedRole;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (activeTab === "file" && !file) {
      alert("Please upload a resume file (PDF or TXT).");
      return;
    }
    if (activeTab === "text" && !rawText.trim()) {
      alert("Please paste your resume text.");
      return;
    }

    setLoading(true);
    setScanStep(1);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const formData = new FormData();
      formData.append("targetRole", finalRole);
      if (portfolioUrl) formData.append("portfolioUrl", portfolioUrl);

      if (activeTab === "file" && file) {
        formData.append("resume", file);
      } else {
        formData.append("rawText", rawText);
      }

      const res = await api.post("/resume-roast/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(stepInterval);

      if (res.data?.analysis) {
        setResult(res.data.analysis);
        setRecommendedMentors(res.data.recommendedMentors || []);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error("Resume roast failed:", err);
      alert(err.response?.data?.error || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
      setScanStep(0);
    }
  };

  const handleCopyCleanResume = () => {
    if (!result?.correctedResumeText) return;
    navigator.clipboard.writeText(result.correctedResumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCleanResume = () => {
    if (!result?.correctedResumeText) return;
    const blob = new Blob([result.correctedResumeText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ATS-Optimized-Resume-${finalRole.replace(/[^a-z0-9]/gi, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40";
    if (score >= 70) return "text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-950/40";
    if (score >= 55) return "text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-950/40";
    return "text-red-500 border-red-500 bg-red-50 dark:bg-red-950/40";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0A0A0B] text-gray-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#0A0A0B]/80 border-b border-gray-200/80 dark:border-zinc-800/80">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 sm:px-10 py-4">
          <Link href="/" className="font-bold text-xl tracking-tight text-[var(--fg)] flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="HelpMeMan Logo" className="w-7 h-7 object-contain" />
            <span>HelpMeMan</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mentors" className="text-xs font-semibold px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm">
              Book 1:1 Mentor Review
            </Link>
            <Link href="/" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors hidden sm:block">
              ← Back to home
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-[1100px] px-6 sm:px-10 pt-28 pb-20 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            AI Resume & Portfolio Roast Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--fg)] leading-tight">
            Roast Your Resume. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Crack the ATS. Land Interviews.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            Upload your resume or paste text to receive an instant ATS score breakdown, witty constructive roast, missing keyword analysis, metric bullet point rewrites, and an AI-corrected version.
          </p>
        </div>

        {/* Input & Form Area */}
        {!result && (
          <div className="bg-white dark:bg-[#121214] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-xl space-y-8">
            {/* Step 1: Role Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
                1. Select Your Target Role
              </label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.label;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r.label);
                        setCustomRole("");
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                          : "bg-gray-50 dark:bg-zinc-900 text-[var(--fg)] border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {r.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedRole("custom")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    selectedRole === "custom"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-gray-50 dark:bg-zinc-900 text-[var(--fg)] border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                  }`}
                >
                  ✨ Custom Role
                </button>
              </div>

              {selectedRole === "custom" && (
                <input
                  type="text"
                  placeholder="Enter exact target role (e.g. Full Stack Developer at FAANG)"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="mt-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Step 2: Upload or Text Tab */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  2. Upload Resume or Paste Text
                </label>
                <div className="flex items-center gap-2 p-1 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab("file")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === "file" ? "bg-white dark:bg-zinc-800 text-[var(--fg)] shadow-xs" : "text-[var(--muted)]"
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("text")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === "text" ? "bg-white dark:bg-zinc-800 text-[var(--fg)] shadow-xs" : "text-[var(--muted)]"
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {activeTab === "file" ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 dark:bg-zinc-900/40"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-bounce" />
                  {file ? (
                    <div>
                      <p className="font-semibold text-sm text-[var(--fg)]">{file.name}</p>
                      <p className="text-xs text-[var(--muted)] mt-1">{(file.size / 1024).toFixed(1)} KB • Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-sm text-[var(--fg)]">Drag & drop your resume PDF here</p>
                      <p className="text-xs text-[var(--muted)] mt-1">Supports PDF, TXT, DOCX (Max 10MB)</p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  rows={8}
                  placeholder="Paste your raw resume text here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              )}
            </div>

            {/* Step 3: Optional Portfolio Link */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
                3. Portfolio / GitHub Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/username or https://yourportfolio.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Analyze Action Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleAnalyze}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base hover:opacity-95 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Bot className="w-5 h-5 animate-spin" />
                  <span>AI Engine Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span>Roast My Resume & Calculate ATS Score</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>

            {/* Loading Scanner Animation */}
            {loading && (
              <div className="p-6 bg-gray-50 dark:bg-zinc-900/80 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Zap className="w-4 h-4 animate-pulse" />
                  Processing Step {scanStep} of 4
                </div>
                <div className="space-y-2 text-xs text-[var(--muted)]">
                  <p className={scanStep >= 1 ? "text-[var(--fg)] font-medium" : "opacity-40"}>
                    ✓ Extracting document text & layout structure...
                  </p>
                  <p className={scanStep >= 2 ? "text-[var(--fg)] font-medium" : "opacity-40"}>
                    ✓ Evaluating ATS keyword density for {finalRole}...
                  </p>
                  <p className={scanStep >= 3 ? "text-[var(--fg)] font-medium" : "opacity-40"}>
                    ✓ Generating witty roast & identifying weak buzzwords...
                  </p>
                  <p className={scanStep >= 4 ? "text-[var(--fg)] font-medium" : "opacity-40"}>
                    ✓ Rewriting bullet points with STAR action metrics...
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results View Dashboard */}
        {result && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Top Reset Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Analyze Another Resume
              </button>
              <div className="text-xs text-[var(--muted)] font-medium">
                Target Role: <span className="text-[var(--fg)] font-bold">{finalRole}</span>
              </div>
            </div>

            {/* Scorecard Hero Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dial Card */}
              <div className="bg-white dark:bg-[#121214] p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col items-center justify-center text-center">
                <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mb-3 shadow-inner ${getScoreColor(result.atsScore)}`}>
                  <span className="text-3xl font-extrabold">{result.atsScore}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">/ 100 ATS</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {result.ratingTier}
                </div>
              </div>

              {/* Roast Card */}
              <div className="md:col-span-2 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-amber-500/10 p-6 sm:p-8 rounded-3xl border border-orange-500/20 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    The AI Resume Roast 🌶️
                  </div>
                  <p className="text-sm sm:text-base text-[var(--fg)] font-medium leading-relaxed italic">
                    "{result.theRoast}"
                  </p>
                </div>
                <p className="text-xs text-[var(--muted)] mt-4">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Sub-scores Breakdown */}
            <div className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
              <h3 className="text-sm font-bold text-[var(--fg)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                ATS Sub-Score Analysis
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                  <p className="text-xs text-[var(--muted)] font-medium">Keywords</p>
                  <p className="text-xl font-bold text-[var(--fg)] mt-1">{result.subScores.keywords}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                  <p className="text-xs text-[var(--muted)] font-medium">Formatting</p>
                  <p className="text-xl font-bold text-[var(--fg)] mt-1">{result.subScores.formatting}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                  <p className="text-xs text-[var(--muted)] font-medium">Impact Metrics</p>
                  <p className="text-xl font-bold text-[var(--fg)] mt-1">{result.subScores.impactMetrics}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                  <p className="text-xs text-[var(--muted)] font-medium">Role Relevance</p>
                  <p className="text-xl font-bold text-[var(--fg)] mt-1">{result.subScores.roleRelevance}%</p>
                </div>
              </div>
            </div>

            {/* Missing Keywords Cloud */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <div className="bg-white dark:bg-[#121214] p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
                <h3 className="text-sm font-bold text-[var(--fg)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Missing High-Priority ATS Keywords for {finalRole}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Before vs After Bullet Point Rewrites */}
            {result.bulletRewrites && result.bulletRewrites.length > 0 && (
              <div className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[var(--fg)] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Bullet Point Transformer (Before → AI STAR Rewrite)
                </h3>
                <div className="space-y-4">
                  {result.bulletRewrites.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 space-y-3"
                    >
                      <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                        <span className="font-bold">Original: </span> {b.original}
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 font-semibold">
                        <span className="font-bold">AI Optimized STAR Bullet: </span> {b.optimized}
                      </div>
                      <p className="text-[11px] text-[var(--muted)] italic">💡 {b.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corrected Resume Text Box */}
            <div className="bg-white dark:bg-[#121214] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--fg)] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Full ATS-Optimized Clean Resume
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCleanResume}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800 hover:opacity-90"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCleanResume}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download (.md)
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                rows={12}
                value={result.correctedResumeText}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs text-[var(--fg)] font-mono leading-relaxed focus:outline-none"
              />
            </div>

            {/* Human Mentor Booking CTA Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-extrabold">Want a 1:1 Live Resume & Mock Interview Roast?</h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                  Connect with verified mentors from IITs, AIIMS, FAANG, and top law/management firms for line-by-line feedback.
                </p>
              </div>
              <Link
                href="/mentors"
                className="px-6 py-3.5 rounded-2xl bg-white text-blue-600 font-bold text-xs uppercase tracking-wider hover:bg-blue-50 shadow-lg shrink-0"
              >
                Book 1:1 Live Review →
              </Link>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
