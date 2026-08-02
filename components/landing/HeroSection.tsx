"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { LogoStack } from "./LogoStack";

export function HeroSection() {
  const scrollToAI = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-36 px-6 overflow-hidden">
      {/* ── Main Hero Content ── */}
      <div className="max-w-[1200px] mx-auto text-center relative z-20">
        {/* Mobbin-style Stacked Logo Cards — directly above hero headline */}
        <LogoStack />

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[clamp(38px,7vw,76px)] font-semibold leading-[1.06] tracking-[-0.035em] text-[var(--fg)] max-w-[820px] mx-auto"
        >
          Find personal mentors{" "}
          <br className="hidden sm:block" />
          in seconds.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-6 md:mt-8 text-[16px] md:text-[19px] leading-[1.65] text-[var(--muted)] max-w-[600px] mx-auto"
        >
          Connect with handpicked IITians, Doctors, Lawyers, Founders, and
          Industry Professionals who have already achieved what you&apos;re
          trying to achieve.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/?auth=signup"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2563EB] text-white text-[15px] font-semibold rounded-xl hover:bg-[#1d4ed8] active:scale-[0.98] transition-all no-underline"
          >
            Find My Mentor
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <button
            onClick={scrollToAI}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-[var(--fg)] text-[15px] font-semibold rounded-xl border border-[var(--hairline)] hover:bg-[#F9FAFB] dark:hover:bg-[#18181B] active:scale-[0.98] transition-all cursor-pointer bg-transparent"
          >
            <Sparkles size={15} />
            Ask AI
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 md:mt-24 text-[13px] font-medium text-[var(--muted)] tracking-wide opacity-75"
        >
          Trusted by students from IIT, NIT, BITS, AIIMS and top universities.
        </motion.p>

        {/* Company Logos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 max-w-4xl mx-auto select-none"
        >
          {/* Apple */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900 dark:text-white">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.07 0-1.37-.62-2.6-.62-1.22 0-1.56.62-2.6.62-1.03 0-2.13-.93-3.1-1.88-1.95-1.95-3.43-5.5-3.43-8.8 0-5.23 3.38-8 6.55-8 1.63 0 3.07.62 3.97.62.9 0 2.65-.7 4.5-.7 1.95 0 3.7.8 4.78 2.25-4.13 2.1-3.47 7.4.2 9 0 .1.03.2.03.3-.3 1-.72 2-1.3 3.08zM15.03 4.1c.88-1.08 1.48-2.6 1.32-4.1-1.28.05-2.84.85-3.76 1.93-.82.95-1.53 2.5-1.34 3.98 1.4.1 2.9-.73 3.78-1.8z" />
            </svg>
            <span>Apple</span>
          </div>

          {/* Google */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900 dark:text-zinc-100">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-800 dark:text-zinc-200">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <rect x="0" y="0" width="11" height="11" fill="#F25022" />
              <rect x="13" y="0" width="11" height="11" fill="#7FBA00" />
              <rect x="0" y="13" width="11" height="11" fill="#00A4EF" />
              <rect x="13" y="13" width="11" height="11" fill="#FFB900" />
            </svg>
            <span>Microsoft</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#0081FB]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6.897 4c1.915 0 3.516.932 5.43 3.376l.282-.373c.19-.246.383-.484.58-.71l.313-.35C14.588 4.788 15.792 4 17.225 4c1.273 0 2.469.557 3.491 1.516l.218.213c1.73 1.765 2.917 4.71 3.053 8.026l.011.392.002.25c0 1.501-.28 2.759-.818 3.7l-.14.23-.108.153c-.301.42-.664.758-1.086 1.009l-.265.142-.087.04a3.493 3.493 0 01-.302.118 4.117 4.117 0 01-1.33.208c-.524 0-.996-.067-1.438-.215-.614-.204-1.163-.56-1.726-1.116l-.227-.235c-.753-.812-1.534-1.976-2.493-3.586l-1.43-2.41-.544-.895-1.766 3.13-.343.592C7.597 19.156 6.227 20 4.356 20c-1.21 0-2.205-.42-2.936-1.182l-.168-.184c-.484-.573-.837-1.311-1.043-2.189l-.067-.32a8.69 8.69 0 01-.136-1.288L0 14.468c.002-.745.06-1.49.174-2.23l.1-.573c.298-1.53.828-2.958 1.536-4.157l.209-.34c1.177-1.83 2.789-3.053 4.615-3.16L6.897 4z"/>
            </svg>
            <span className="tracking-tight">Meta</span>
          </div>

          {/* Y Combinator */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#F26522]">
            <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-[#F26522] text-[10px] font-extrabold text-white leading-none">
              Y
            </span>
            <span>Y Combinator</span>
          </div>

          {/* Amazon */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900 dark:text-zinc-100">
            <svg className="w-4 h-4 fill-[#FF9900]" viewBox="0 0 24 24">
              <path d="M15.9 14.6c-.6.6-1.5 1-2.5 1-1.8 0-3-1.1-3-3s1.2-3 3-3c1 0 1.9.4 2.5 1v-1c0-1.5-.8-2.2-2.5-2.2-1.3 0-2.5.5-3.2 1.1l-.8-1.5C10.5 4.3 12.3 3.5 14.5 3.5c3.2 0 4.5 1.7 4.5 4.5v5.5c0 1 .3 1.5.7 2h-2.5c-.2-.4-.3-.8-.3-1zm-.1-3c-.4-.5-1-.8-1.8-.8-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5 1.4-.4 1.8-1v-1.2z M6.5 18c3 1.8 6.5 2.5 10 2 .5 0 .8.4.5.8-2.2 1.8-5.5 2.5-8.5 2-2.5-.4-4.5-1.5-6-3.2-.3-.4 0-.8.5-.6z" />
            </svg>
            <span>Amazon</span>
          </div>

          {/* McKinsey */}
          <div className="flex items-center gap-1 text-[14px] font-bold text-[#051C2C] dark:text-[#5B9BD5]">
            <span className="font-serif tracking-tight">McKinsey</span>
          </div>

          {/* Flipkart */}
          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="font-black italic tracking-wide text-[#2874F0]">Flipkart</span>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-[#FFE11B] text-[9px] font-black text-[#2874F0] not-italic shadow-xs">f</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
