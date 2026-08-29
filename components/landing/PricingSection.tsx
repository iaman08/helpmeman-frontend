"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Check, X, Sparkles, ShieldCheck, Zap, Award } from "lucide-react";
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
    <section id="pricing" ref={ref} className="py-20 md:py-28 lg:py-36 bg-white dark:bg-[#0A0A0A] border-t border-[#F3F4F6] dark:border-[#1F1F23] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header & View Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
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
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                viewMode === "comparison"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white"
              }`}
            >
              HelpMeMan vs Competitors
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pricing")}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                viewMode === "pricing"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111111] dark:hover:text-white"
              }`}
            >
              Pricing Tiers
            </button>
          </div>
        </motion.div>

        {/* ── 1. COMPARISON MATRIX TABLE VIEW ──────────────────────────────────── */}
        {viewMode === "comparison" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full overflow-x-auto no-scrollbar rounded-3xl border border-[#E5E7EB] dark:border-[#27272A] bg-white dark:bg-[#18181B] shadow-2xl"
          >
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-[#27272A] bg-slate-50 dark:bg-[#111111]">
                  <th className="p-5 text-sm font-bold text-[#111111] dark:text-white w-1/3">
                    Feature & Capabilities
                  </th>
                  {/* HelpMeMan Highlight Header */}
                  <th className="p-5 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border-x border-blue-500/20 text-center w-1/4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest bg-blue-600 text-white">
                        #1 Recommended
                      </span>
                      <span className="text-base font-black text-[#111111] dark:text-white">HelpMeMan</span>
                    </div>
                  </th>
                  <th className="p-5 text-sm font-semibold text-[#6B7280] dark:text-[#A1A1AA] text-center">
                    Topmate
                  </th>
                  <th className="p-5 text-sm font-semibold text-[#6B7280] dark:text-[#A1A1AA] text-center">
                    Preplaced
                  </th>
                  <th className="p-5 text-sm font-semibold text-[#6B7280] dark:text-[#A1A1AA] text-center">
                    ADPList / Directories
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#27272A] text-xs md:text-sm">
                {comparisonFeatures.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-[#202024] transition-colors"
                  >
                    <td className="p-5 font-semibold text-[#111111] dark:text-white">
                      {item.feature}
                    </td>

                    {/* HelpMeMan Column */}
                    <td className="p-5 text-center font-bold bg-blue-500/5 dark:bg-blue-500/10 border-x border-blue-500/20 text-blue-600 dark:text-blue-400">
                      <div className="flex justify-center items-center">
                        {renderValue(item.helpmeman)}
                      </div>
                    </td>

                    {/* Topmate Column */}
                    <td className="p-5 text-center text-[#4B5563] dark:text-[#A1A1AA]">
                      <div className="flex justify-center items-center">
                        {renderValue(item.topmate)}
                      </div>
                    </td>

                    {/* Preplaced Column */}
                    <td className="p-5 text-center text-[#4B5563] dark:text-[#A1A1AA]">
                      <div className="flex justify-center items-center">
                        {renderValue(item.preplaced)}
                      </div>
                    </td>

                    {/* ADPList Column */}
                    <td className="p-5 text-center text-[#4B5563] dark:text-[#A1A1AA]">
                      <div className="flex justify-center items-center">
                        {renderValue(item.adplist)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                  tier.popular
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
                  className={`w-full py-3 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.98] ${
                    tier.popular
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
