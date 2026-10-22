"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Check, X, ShieldCheck, Zap, Award, ArrowRight } from "lucide-react";
import { PriceDisplay } from "@/components/PriceDisplay";

const pricingTiers = [
  {
    name: "Starter",
    priceInPaise: 12900,
    duration: "Per Session",
    description: "Ideal for 11th & 12th standard students looking for academic direction.",
    features: [
      "1-on-1 verified mentor call",
      "30-minute session duration",
      "30-day offline chat follow-up",
      "Basic study templates & resources",
    ],
    cta: "Book Starter Session",
    popular: false,
  },
  {
    name: "Undergrad",
    priceInPaise: 19900,
    duration: "Per Session",
    description: "Best for college students seeking internship and specialization guidance.",
    features: [
      "1-on-1 verified mentor call",
      "45-minute session duration",
      "30-day offline chat follow-up",
      "Resume review & roadmap builder",
    ],
    cta: "Book Undergrad Session",
    popular: true,
  },
  {
    name: "Career",
    priceInPaise: 24900,
    duration: "Per Session",
    description: "Designed for job seekers and early career transitions.",
    features: [
      "1-on-1 verified mentor call",
      "60-minute session duration",
      "30-day offline chat follow-up",
      "Mock interview & referral guidance",
    ],
    cta: "Book Career Session",
    popular: false,
  },
  {
    name: "Premium Elite",
    priceInPaise: 49900,
    duration: "Per Session",
    description: "Exclusive access to top founders, FAANG leaders, and senior directors.",
    features: [
      "1-on-1 elite industry mentor call",
      "60-minute session duration",
      "7-day priority chat follow-up",
      "Direct referral pool access",
    ],
    cta: "Book Premium Session",
    popular: false,
  },
];

const comparisonFeatures = [
  {
    feature: "Pricing Model",
    helpmeman: "₹129 – ₹499 (Flat / Session)",
    topmate: "₹1,500 – ₹5,000+ per call",
    preplaced: "₹25,000 – ₹60,000 upfront",
    adplist: "Free (No accountability)",
    highlight: true,
  },
  {
    feature: "24/7 Ruth AI Career Copilot",
    helpmeman: true,
    topmate: false,
    preplaced: false,
    adplist: false,
    highlight: true,
  },
  {
    feature: "AI Resume Roast & ATS Optimizer",
    helpmeman: true,
    topmate: false,
    preplaced: "Manual only",
    adplist: false,
    highlight: true,
  },
  {
    feature: "Mentor Quality Standard",
    helpmeman: "100% 5-Stage Verified (AIR 1, FAANG)",
    topmate: "Unverified Creators",
    preplaced: "Restricted Cohorts",
    adplist: "Open Directory",
    highlight: true,
  },
  {
    feature: "Aptitude & Typing Certifications",
    helpmeman: true,
    topmate: false,
    preplaced: false,
    adplist: false,
    highlight: true,
  },
  {
    feature: "AI Session Notes & Action Items",
    helpmeman: true,
    topmate: false,
    preplaced: "Manual Docs",
    adplist: false,
    highlight: true,
  },
  {
    feature: "30-Day Offline Chat Follow-Up",
    helpmeman: "Included Free",
    topmate: "Charged per Message",
    preplaced: "Limited",
    adplist: false,
    highlight: true,
  },
  {
    feature: "Direct Referral & Placement Pool",
    helpmeman: true,
    topmate: "Mentor Dependent",
    preplaced: "Cohort Only",
    adplist: false,
    highlight: true,
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [viewMode, setViewMode] = useState<"comparison" | "pricing">("comparison");

  const renderValue = (val: string | boolean) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <Check className="w-4 h-4" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <X className="w-4 h-4" />
        </span>
      );
    }
    return <span className="text-xs font-semibold">{val}</span>;
  };

  return (
    <section id="pricing" ref={ref} className="py-10 md:py-14 lg:py-16 bg-white dark:bg-[#0A0A0A] border-t border-[#F3F4F6] dark:border-[#1F1F23] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header & View Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-8 md:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Unmatched Value & Transparency
          </div>

          <h2 className="text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.02em] text-[#111111] dark:text-white leading-[1.1]">
            Why Students Choose HelpMeMan
          </h2>
          <p className="mt-4 text-[16px] text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">
            See how HelpMeMan stacks up against traditional platforms like Topmate, Preplaced, and open directories.
          </p>

          {/* Toggle Pills */}
          <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setViewMode("comparison")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${viewMode === "comparison"
                ? "bg-blue-600 text-white shadow-md"
                : "text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white"
                }`}
            >
              HelpMeMan vs Competitors
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pricing")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${viewMode === "pricing"
                ? "bg-blue-600 text-white shadow-md"
                : "text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white"
                }`}
            >
              Pricing Tiers
            </button>
          </div>
        </motion.div>

        {/* ── 1. DUAL-CARD "VS" COMPARISON (AUTHENTIC HELPMEMAN DESIGN) ──────────────────── */}
        {viewMode === "comparison" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-10 w-full"
          >
            {/* Dual Cards Main Layout */}
            <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
              
              {/* ── Left Card: The Competitors ─────────────────────────── */}
              <div className="relative flex flex-col justify-between rounded-[32px] sm:rounded-[36px] p-7 sm:p-10 bg-[#F8FAFC] dark:bg-[#121217] border border-slate-200/90 dark:border-white/[0.08] shadow-sm transition-all">
                <div>
                  {/* Top Header Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E2E8F0] dark:bg-[#1E222B] text-slate-600 dark:text-slate-300 text-[11px] font-bold tracking-[0.14em] uppercase">
                      COMPETITOR
                    </span>
                  </div>

                  {/* Competitor Brand Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1A1D24] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C35]" />
                      Topmate
                    </span>
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1A1D24] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]" />
                      Preplaced
                    </span>
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1A1D24] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
                      ADPList / Directories
                    </span>
                  </div>

                  {/* Card Title & Description */}
                  <h3 className="text-2xl sm:text-[32px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Topmate & Preplaced
                  </h3>
                  <p className="mt-2.5 text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                    Built for creator monetisation and expensive calls, not structured student career placement.
                  </p>

                  {/* Comparison Rows (Clean editorial layout, no nested box clutter) */}
                  <div className="mt-8 divide-y divide-slate-200/70 dark:divide-white/[0.06]">
                    {/* Row 1: Pricing */}
                    <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                          PRICING MODEL
                        </span>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                          Topmate (₹1.5k–₹5k/call) • Preplaced (₹25k–₹60k upfront)
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-rose-500 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Row 2: Mentor Standard */}
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                          MENTOR STANDARD
                        </span>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                          Topmate creators & ADPList open directories (high no-show rates)
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-rose-500 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Row 3: AI Career Copilot */}
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                          AI CAREER COPILOT
                        </span>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                          Zero AI tools — no ATS resume roast, pre-briefs, or skill tests
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-rose-500 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Row 4: Session Workspace */}
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                          SESSION WORKSPACE
                        </span>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                          Manual meeting links, missed calendar invites & no structured agenda
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-rose-500 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Row 5: Post-Call Support */}
                    <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                          POST-CALL SUPPORT
                        </span>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                          Call abruptly ends — extra fee per text or locked into costly cohorts
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-rose-500 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Central "VS" Circular Badge (Anchored between cards) ──────────────────────────── */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[#0066FF] text-white font-black text-xs tracking-wider flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white dark:border-[#0A0A0A]">
                  VS
                </div>
              </div>

              {/* ── Right Card: HelpMeMan (Hero / YOU Card) ─────────────────── */}
              <div className="relative flex flex-col justify-between rounded-[32px] sm:rounded-[36px] p-7 sm:p-10 bg-white dark:bg-[#15151C] border-2 border-[#0066FF]/60 dark:border-[#3B82F6]/60 shadow-[0_16px_40px_rgba(0,102,255,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all">
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/[0.04] dark:bg-blue-500/[0.08] blur-3xl rounded-full pointer-events-none -z-10" />

                <div>
                  {/* Top Header Row with YOU badge */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Brand Row with HelpMeMan Logo & PREMIUM badge */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black border border-white/10 flex items-center justify-center p-2 shadow-sm shrink-0">
                        <img src="/logo.svg" alt="HelpMeMan" className="w-full h-full object-contain" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#EBF3FF] dark:bg-blue-500/15 text-[#0066FF] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-500/20">
                        PREMIUM
                      </span>
                    </div>

                    <span className="px-4 py-1.5 rounded-full bg-[#0066FF] text-white text-[11px] font-extrabold tracking-[0.14em] uppercase shadow-md shadow-blue-500/20">
                      YOU
                    </span>
                  </div>

                  {/* Card Title & Description */}
                  <h3 className="text-2xl sm:text-[32px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                    HelpMeMan
                  </h3>
                  <p className="mt-2.5 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                    Engineered for verified 1-on-1 mentorship & guaranteed student career growth.
                  </p>

                  {/* Comparison Rows (Clean editorial layout matching reference image) */}
                  <div className="mt-8 divide-y divide-blue-50 dark:divide-white/[0.06]">
                    {/* Row 1: Pricing */}
                    <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0066FF] dark:text-[#3B82F6]">
                          PRICING MODEL
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                          Transparent, flat student fee (₹129 – ₹499 flat per call)
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Row 2: Mentor Standard */}
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0066FF] dark:text-[#3B82F6]">
                          MENTOR STANDARD
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                          100% 5-stage verified mentors (FAANG, AIR 1, IITs, IIMs)
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Row 3: AI Career Copilot */}
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0066FF] dark:text-[#3B82F6]">
                          AI CAREER COPILOT
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                          24/7 Ruth AI Copilot, instant ATS Resume Roast & Auto Briefs
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Row 4: Session Workspace */}
                    <div className="flex items-center justify-between gap-4 py-4">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0066FF] dark:text-[#3B82F6]">
                          SESSION WORKSPACE
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                          Browser-first, 1-click Google Meet with auto host privileges
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Row 5: Post-Call Support */}
                    <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0066FF] dark:text-[#3B82F6]">
                          POST-CALL SUPPORT
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                          30-day offline chat follow-up included free + direct referral pool
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-[#0066FF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <a
                href="/mentors"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Find Your Verified Mentor</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-100 dark:bg-[#1E1E24] hover:bg-slate-200 dark:hover:bg-[#272730] text-slate-800 dark:text-white font-semibold text-sm transition-all"
              >
                <span>Get Started for Free</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* ── 2. PRICING CARDS VIEW ────────────────────────────────────────────── */}
        {viewMode === "pricing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          >
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${tier.popular
                  ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xl scale-[1.02] md:scale-[1.03] lg:scale-[1.04] border border-transparent"
                  : "bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-white hover:border-[#CCCCCC] dark:hover:border-[#3F3F46] hover:shadow-md"
                  }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] uppercase font-bold tracking-[0.15em] px-3 py-1 rounded-full">
                    Most Chosen
                  </div>
                )}

                {/* Title & Price */}
                <div className="mb-6">
                  <h3 className={`text-[15px] font-medium tracking-tight uppercase ${tier.popular ? "text-[#9CA3AF] dark:text-[#6B7280]" : "text-[#6B7280] dark:text-[#A1A1AA]"}`}>
                    {tier.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-[40px] font-semibold tracking-[-0.02em] leading-none">
                      <PriceDisplay amountInPaise={tier.priceInPaise} />
                    </span>
                    <span className={`text-[13px] ${tier.popular ? "text-[#9CA3AF] dark:text-[#6B7280]" : "text-[#6B7280] dark:text-[#A1A1AA]"}`}>
                      / {tier.duration}
                    </span>
                  </div>
                  <p className={`mt-4 text-[13px] leading-[1.6] ${tier.popular ? "text-[#D1D5DB] dark:text-[#4B5563]" : "text-[#4B5563] dark:text-[#D1D5DB]"}`}>
                    {tier.description}
                  </p>
                </div>

                {/* Divider */}
                <div className={`h-px w-full my-1 ${tier.popular ? "bg-[#27272A] dark:bg-[#E5E7EB]" : "bg-[#F3F4F6] dark:bg-[#27272A]"}`} />

                {/* Features */}
                <ul className="space-y-4 my-6 flex-1">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2.5 text-[13px] leading-snug">
                      <Check
                        size={15}
                        className="mt-0.5 flex-shrink-0 text-[#2563EB]"
                      />
                      <span className={tier.popular ? "text-[#E5E7EB] dark:text-[#374151]" : "text-[#374151] dark:text-[#D1D5DB]"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  className={`w-full py-3 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.98] ${tier.popular
                    ? "bg-[#2563EB] text-white hover:bg-[#3B82F6]"
                    : "bg-[#F3F4F6] dark:bg-[#27272A] text-[#111111] dark:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#3F3F46]"
                    }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
