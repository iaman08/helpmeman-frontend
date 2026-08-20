"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, FileText, Send, HelpCircle, Target, Link2 } from "lucide-react";
import api from "@/lib/api";

interface PreSessionIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  mentorName: string;
  categorySlug?: string;
  onSuccess?: (aiSummary: string) => void;
}

export function PreSessionIntakeModal({
  isOpen,
  onClose,
  bookingId,
  mentorName,
  categorySlug = "general",
  onSuccess,
}: PreSessionIntakeModalProps) {
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [keyQuestions, setKeyQuestions] = useState("");
  const [currentLevel, setCurrentLevel] = useState("");
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Category specific placeholders
  const getGoalPlaceholder = () => {
    if (categorySlug.includes("medical") || categorySlug.includes("neet")) {
      return "Example: Need strategy to score 650+ in NEET UG / Biology NCERT revision plan";
    }
    if (categorySlug.includes("health") || categorySlug.includes("nutrition") || categorySlug.includes("fitness") || categorySlug.includes("gym")) {
      return "Example: Custom fat loss & hypertrophy workout split + daily macro breakdown";
    }
    if (categorySlug.includes("law")) {
      return "Example: CLAT UG legal reasoning strategy & NLU admission counseling";
    }
    return "Example: System Design preparation for SDE-2 interview / Code review";
  };

  const getQuestionsPlaceholder = () => {
    if (categorySlug.includes("medical") || categorySlug.includes("neet")) {
      return "1. How to improve Physics numerical speed?\n2. Recommended 3-month revision timetable?\n3. AIIMS vs MAMC cutoff guidance";
    }
    if (categorySlug.includes("health") || categorySlug.includes("nutrition") || categorySlug.includes("fitness") || categorySlug.includes("gym")) {
      return "1. Optimal 4-day workout split for fat loss without muscle loss?\n2. High-protein meal options & daily macro targets?\n3. Progressive overload strategy & injury prevention tips";
    }
    return "1. How should I structure my 45-min preparation?\n2. Key areas I should improve based on my background\n3. Next steps for career transition";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryGoal.trim()) {
      setError("Please specify your primary goal for this consultation.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const answersObj = {
        primaryGoal: primaryGoal.trim(),
        keyQuestions: keyQuestions.trim().split("\n").filter(Boolean),
        currentLevel: currentLevel.trim(),
        links: links.trim(),
      };

      const res = await api.post(`/bookings/${bookingId}/intake`, {
        intakeAnswers: answersObj,
      });

      const summary = res.data?.booking?.aiBriefSummary || "Session prerequisites saved successfully!";
      setAiSummary(summary);
      if (onSuccess) onSuccess(summary);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to save pre-session details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-zinc-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Pre-Session Prerequisites</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Help <span className="text-amber-400 font-semibold">{mentorName}</span> prepare a 10-second summary so your call starts with zero delay!
            </p>
          </div>
        </div>

        {aiSummary ? (
          /* Success AI Brief Preview State */
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
              <div>
                <h4 className="text-sm font-bold text-emerald-400">Briefing Ready & Sent to Mentor!</h4>
                <p className="text-xs text-zinc-300">
                  {mentorName} will review this AI summary before joining your Google Meet call.
                </p>
              </div>
            </div>

            <div className="p-5 bg-zinc-900/90 border border-amber-500/30 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles size={14} />
                <span>⚡ AI-Generated Mentor Briefing</span>
              </div>
              <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                {aiSummary}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Done & Ready for Call
            </button>
          </div>
        ) : (
          /* Intake Form State */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            {/* Primary Goal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Target size={14} className="text-amber-400" />
                Primary Goal of Consultation <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder={getGoalPlaceholder()}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
              />
            </div>

            {/* Key Questions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-amber-400" />
                Top Questions to Address (1 per line)
              </label>
              <textarea
                rows={3}
                value={keyQuestions}
                onChange={(e) => setKeyQuestions(e.target.value)}
                placeholder={getQuestionsPlaceholder()}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
              />
            </div>

            {/* Background / Current Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <FileText size={14} className="text-amber-400" />
                Current Background / Preparation Status
              </label>
              <input
                type="text"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                placeholder="Example: 3rd year MBBS student / Dropper preparing for NEET / 5 yrs SDE"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
              />
            </div>

            {/* External Links / Documents */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Link2 size={14} className="text-amber-400" />
                Document / Resume / Diet Log Link (Optional)
              </label>
              <input
                type="url"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder="Google Drive link to resume, diet journal, or mock test scorecard"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl transition-all border border-zinc-800 cursor-pointer"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Generating AI Brief...</span>
                ) : (
                  <>
                    <span>Submit & Generate Brief</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
