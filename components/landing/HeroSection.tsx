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
          className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-slate-400 dark:text-zinc-500 max-w-4xl mx-auto select-none"
        >
          {/* Apple */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.07 0-1.37-.62-2.6-.62-1.22 0-1.56.62-2.6.62-1.03 0-2.13-.93-3.1-1.88-1.95-1.95-3.43-5.5-3.43-8.8 0-5.23 3.38-8 6.55-8 1.63 0 3.07.62 3.97.62.9 0 2.65-.7 4.5-.7 1.95 0 3.7.8 4.78 2.25-4.13 2.1-3.47 7.4.2 9 0 .1.03.2.03.3-.3 1-.72 2-1.3 3.08zM15.03 4.1c.88-1.08 1.48-2.6 1.32-4.1-1.28.05-2.84.85-3.76 1.93-.82.95-1.53 2.5-1.34 3.98 1.4.1 2.9-.73 3.78-1.8z" />
            </svg>
            <span>Apple</span>
          </div>

          {/* Google */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M0 0h11v11H0zM13 0h11v11H13zM0 13h11v11H0zM13 13h11v11H13z" />
            </svg>
            <span>Microsoft</span>
          </div>

          {/* Meta */}
          <span className="text-[14px] font-bold tracking-tight">Meta</span>

          {/* Y Combinator */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M4 0h16c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H4c-2.2 0-4-1.8-4-4V4c0-2.2 1.8-4 4-4zm4 6.5h2.5l1.5 2.8 1.5-2.8H16l-3 5.3v3.7h-2V11.8L8 6.5z" />
            </svg>
            <span>Y Combinator</span>
          </div>

          {/* Amazon */}
          <div className="flex items-center gap-1.5 text-[14px] font-semibold">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M15.9 14.6c-.6.6-1.5 1-2.5 1-1.8 0-3-1.1-3-3s1.2-3 3-3c1 0 1.9.4 2.5 1v-1c0-1.5-.8-2.2-2.5-2.2-1.3 0-2.5.5-3.2 1.1l-.8-1.5C10.5 4.3 12.3 3.5 14.5 3.5c3.2 0 4.5 1.7 4.5 4.5v5.5c0 1 .3 1.5.7 2h-2.5c-.2-.4-.3-.8-.3-1zm-.1-3c-.4-.5-1-.8-1.8-.8-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5 1.4-.4 1.8-1v-1.2z M6.5 18c3 1.8 6.5 2.5 10 2 .5 0 .8.4.5.8-2.2 1.8-5.5 2.5-8.5 2-2.5-.4-4.5-1.5-6-3.2-.3-.4 0-.8.5-.6z" />
            </svg>
            <span>Amazon</span>
          </div>

          {/* McKinsey */}
          <span className="text-[14px] font-bold tracking-tight">McKinsey</span>

          {/* Flipkart */}
          <span className="text-[14px] font-black italic tracking-wide">Flipkart</span>
        </motion.div>
      </div>
    </section>
  );
}
