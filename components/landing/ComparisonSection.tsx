"use client";

import { Check, X, ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";

export function ComparisonSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="comparison"
      ref={ref}
      className="py-12 md:py-16 lg:py-20 bg-white dark:bg-[#0A0A0A] border-t border-[#F3F4F6] dark:border-[#1F1F23] transition-colors duration-300"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-12"
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
        </motion.div>

        {/* Dual-Card "VS" Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

                {/* Comparison Rows */}
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

            {/* ── Central "VS" Circular Badge ──────────────────────────── */}
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

                {/* Comparison Rows */}
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
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] no-underline"
            >
              <span>Find Your Verified Mentor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/?auth=signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-100 dark:bg-[#1E1E24] hover:bg-slate-200 dark:hover:bg-[#272730] text-slate-800 dark:text-white font-semibold text-sm transition-all no-underline"
            >
              <span>Get Started for Free</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
