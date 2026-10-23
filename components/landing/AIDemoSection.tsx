"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { PriceDisplay } from "@/components/PriceDisplay";
import { RuthMascotInline, BotStateProvider } from "@/components/AICompanion/AICompanion";
import type { BotState } from "@/components/AICompanion/animationState";

interface MatchedMentor {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  company: string;
  expertise: string[];
  pricePerSession: number;
  sessionDuration: number;
  isOnline: boolean;
  fit: number;
}

interface MatchResponse {
  mentors: MatchedMentor[];
}

type Status = "idle" | "loading" | "done" | "error";

const SUGGESTIONS = [
  "Startup advice on GTM, MVP & growth",
  "Product manager from a US fintech for career mentoring",
  "Mock interview with a FAANG software engineer",
  "Resume review for a data science role",
];

const LOADING_STEPS = [
  "Understanding what you need...",
  "Scanning verified mentors...",
  "Calculating your match...",
];

/** Avatar wrapped in a match-progress ring with the % pill sitting on its edge. */
function MatchAvatar({ mentor, featured }: { mentor: MatchedMentor; featured: boolean }) {
  const size = 96;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gradId = `ring-${mentor.id}`;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F9BFF" />
            <stop offset="100%" stopColor="#0052FF" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-neutral-200/80 dark:stroke-white/[0.08]"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#${gradId})`}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * mentor.fit) / 100 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </svg>

      <div className="absolute inset-[7px] rounded-full overflow-hidden bg-neutral-100 dark:bg-[#1B1B24]">
        {mentor.avatar ? (
          <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2F7BFF] to-[#0038C9] text-white text-[30px] font-bold">
            {mentor.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {mentor.isOnline && (
        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[3px] border-white dark:border-[#121217]" />
      )}

      <div
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[12px] font-extrabold tabular-nums tracking-tight shadow-lg whitespace-nowrap ${
          featured
            ? "bg-gradient-to-r from-[#2F7BFF] to-[#0052FF] text-white shadow-blue-500/40"
            : "bg-white dark:bg-[#1E1E28] text-[#0052FF] dark:text-[#6EA8FF] border border-blue-500/20 shadow-black/5"
        }`}
      >
        {mentor.fit}% match
      </div>
    </div>
  );
}

function AIDemoSectionInner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const [inputValue, setInputValue] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [mentors, setMentors] = useState<MatchedMentor[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [demoBotState, setDemoBotState] = useState<BotState>("idle");

  const requestId = useRef(0);

  useEffect(() => {
    if (status !== "loading") return;
    setLoadingStep(0);
    const t = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1100);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status === "loading") setDemoBotState("thinking");
    else if (status === "done") {
      setDemoBotState("success");
      const t = setTimeout(() => setDemoBotState("idle"), 2200);
      return () => clearTimeout(t);
    } else setDemoBotState("idle");
  }, [status]);

  const runSearch = useCallback(async (raw: string) => {
    const query = raw.trim();
    if (query.length < 3) return;

    const myId = ++requestId.current;
    setStatus("loading");
    setErrorMsg("");
    setMentors([]);

    try {
      const res = await api.post("/public/ai/match-mentors", { query });
      if (myId !== requestId.current) return;
      setMentors((res.data as MatchResponse).mentors || []);
      setStatus("done");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    } catch (err: any) {
      if (myId !== requestId.current) return;
      setErrorMsg(err?.response?.data?.error || "We couldn't search right now. Please try again in a moment.");
      setStatus("error");
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSuggestion(null);
    runSearch(inputValue);
  };

  const handleSuggestion = (text: string) => {
    setInputValue(text);
    setActiveSuggestion(text);
    runSearch(text);
  };

  const handleClear = () => {
    requestId.current++;
    setInputValue("");
    setActiveSuggestion(null);
    setMentors([]);
    setErrorMsg("");
    setStatus("idle");
  };

  const isLoading = status === "loading";

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-14 md:py-20 lg:py-24 px-6 bg-white dark:bg-[#0B0B0C] border-t border-[#F3F4F6] dark:border-[#1F1F23] transition-colors duration-300 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-500/[0.03] dark:bg-blue-600/[0.05] blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-white/[0.08] bg-neutral-100/90 dark:bg-[#18181F] text-neutral-800 dark:text-neutral-200 text-[12px] font-semibold mb-5 select-none shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
            <span>Ruth AI Copilot</span>
          </div>

          <h2 className="text-[clamp(32px,5.5vw,56px)] font-bold tracking-[-0.035em] text-[#111111] dark:text-white leading-[1.08]">
            What do you need help with?
          </h2>

          <p className="mt-3.5 text-[16px] sm:text-[18px] text-[#6B7280] dark:text-[#9CA3AF] max-w-xl mx-auto leading-relaxed font-normal">
            Describe it and we will find the people who have done it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="max-w-[780px] mx-auto"
        >
          {/* Prompt box */}
          <div className="relative rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 bg-[#FBFBFC] dark:bg-[#131317] border border-neutral-200/90 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all focus-within:border-[#0066FF]/60 focus-within:ring-4 focus-within:ring-[#0066FF]/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                rows={2}
                value={inputValue}
                maxLength={500}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="e.g. a mock interview with a product manager at a US fintech"
                className="w-full bg-transparent border-none outline-none resize-none text-[16px] sm:text-[18px] font-medium text-[#111111] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-[#52525B] leading-[1.5] select-text"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-200/70 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-[12.5px] sm:text-[13px] text-[#6B7280] dark:text-[#8E8E93] min-h-[24px]">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-[#0066FF] dark:text-blue-400 font-medium">
                      <RuthMascotInline size={18} botState={demoBotState} />
                      <span key={loadingStep} className="animate-pulse">
                        {LOADING_STEPS[loadingStep]}
                      </span>
                    </div>
                  ) : (
                    <span>Searches skills, companies and real experience</span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {(status === "done" || status === "error") && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-3.5 py-2 rounded-full text-xs font-semibold text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={inputValue.trim().length < 3 || isLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-[13.5px] sm:text-[14.5px] shadow-md shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none shrink-0"
                  >
                    <span>Find an expert</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Suggestions */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {SUGGESTIONS.map((text) => {
              const selected = activeSuggestion === text;
              return (
                <button
                  key={text}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSuggestion(text)}
                  className={`px-4 py-2 sm:py-2.5 rounded-full text-[12.5px] sm:text-[13.5px] font-medium transition-all duration-200 cursor-pointer disabled:cursor-wait ${
                    selected
                      ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/25 scale-[1.02] border border-[#0066FF]"
                      : "bg-[#F3F4F6] dark:bg-[#1A1A22] text-[#374151] dark:text-[#D1D5DB] hover:text-[#111111] dark:hover:text-white border border-[#E5E7EB] dark:border-white/[0.08] hover:border-neutral-300 dark:hover:border-white/20 hover:scale-[1.01]"
                  }`}
                >
                  {text}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results */}
        <div ref={resultsRef} className="max-w-[860px] mx-auto">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5"
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-[28px] px-5 pt-7 pb-5 bg-white dark:bg-[#121217] border border-neutral-200/90 dark:border-white/[0.08] animate-pulse"
                  >
                    <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-white/[0.08] mx-auto" />
                    <div className="mt-6 h-3.5 w-2/3 mx-auto rounded bg-neutral-200 dark:bg-white/[0.08]" />
                    <div className="mt-2.5 h-2.5 w-1/2 mx-auto rounded bg-neutral-200 dark:bg-white/[0.08]" />
                    <div className="mt-6 h-10 w-full rounded-2xl bg-neutral-200 dark:bg-white/[0.08]" />
                  </div>
                ))}
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 max-w-[780px] mx-auto rounded-2xl px-5 py-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 text-[13.5px] text-rose-700 dark:text-rose-300"
              >
                {errorMsg}
              </motion.div>
            )}

            {status === "done" && mentors.length > 0 && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-12"
              >
                <div className="flex items-center justify-between mb-7 px-1">
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#6B7280] dark:text-[#8E8E93]">
                    Your best matches
                  </h3>
                  <Link
                    href="/mentors"
                    className="text-[13px] font-semibold text-[#0066FF] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Browse all</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {mentors.map((m, idx) => {
                    const featured = idx === 0;
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative rounded-[28px] ${
                          featured
                            ? "p-[1.5px] bg-gradient-to-b from-[#4F9BFF] via-[#0066FF]/60 to-[#0066FF]/10 shadow-[0_20px_50px_rgba(0,82,255,0.18)]"
                            : "p-px bg-neutral-200/90 dark:bg-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                        }`}
                      >
                        <div className="relative h-full rounded-[27px] bg-white dark:bg-[#121217] px-5 pt-7 pb-5 flex flex-col overflow-hidden">
                          {featured && (
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-40 bg-blue-500/[0.14] blur-3xl rounded-full pointer-events-none" />
                          )}

                          <MatchAvatar mentor={m} featured={featured} />

                          <div className="relative mt-7 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <h4 className="text-[17px] font-bold tracking-tight text-[#111111] dark:text-white truncate max-w-[85%]">
                                {m.name}
                              </h4>
                              <span className="w-4 h-4 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                ✓
                              </span>
                            </div>
                            <p className="mt-1 text-[13px] font-medium text-[#4B5563] dark:text-[#A1A1AA] line-clamp-1">
                              {m.role}
                            </p>
                            {m.company && (
                              <p className="mt-0.5 text-[12px] text-[#9CA3AF] dark:text-[#6B7280] line-clamp-1">
                                {m.company}
                              </p>
                            )}

                            {m.expertise.length > 0 && (
                              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
                                {m.expertise.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.06] text-[#4B5563] dark:text-[#C4C4CC] text-[11px] font-medium max-w-full truncate"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="relative mt-auto pt-5">
                            <div className="flex items-center justify-between mb-3 px-0.5">
                              <span className="text-[11px] font-semibold text-[#9CA3AF] dark:text-[#6B7280]">
                                {m.sessionDuration} min
                              </span>
                              <span className="text-[15px] font-bold text-[#111111] dark:text-white">
                                {m.pricePerSession > 0 ? <PriceDisplay amountInPaise={m.pricePerSession} /> : "Free"}
                              </span>
                            </div>
                            <Link
                              href={`/mentors/${m.id}`}
                              className={`group flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[13.5px] font-semibold no-underline transition-all active:scale-[0.98] ${
                                featured
                                  ? "bg-gradient-to-r from-[#2F7BFF] to-[#0052FF] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                                  : "bg-neutral-100 dark:bg-white/[0.06] text-[#111111] dark:text-white hover:bg-[#0066FF] hover:text-white"
                              }`}
                            >
                              <span>View &amp; book</span>
                              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {status === "done" && mentors.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-10 max-w-[780px] mx-auto rounded-3xl px-6 py-8 text-center bg-[#FBFBFC] dark:bg-[#131317] border border-neutral-200/90 dark:border-white/[0.08]"
              >
                <p className="text-[15px] font-semibold text-[#111111] dark:text-white">No close match for that yet</p>
                <p className="mt-1.5 text-[13.5px] text-[#6B7280] dark:text-[#9CA3AF]">
                  Try a skill, role or company, or browse every verified mentor.
                </p>
                <Link
                  href="/mentors"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-[13px] font-semibold no-underline transition-all"
                >
                  <span>Browse all mentors</span>
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function AIDemoSection() {
  return (
    <BotStateProvider>
      <AIDemoSectionInner />
    </BotStateProvider>
  );
}
