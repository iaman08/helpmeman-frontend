"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { LogoStack } from "./LogoStack";
import { HeroFloatingLogos } from "./HeroFloatingLogos";

const TYPED_WORDS = [
  "Fitness",
  "IITian",
  "Doctor",
  "Nutritionist",
  "Lawyer",
  "Gym Trainer",
  "Developer",
  "Founder",
];

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullWord = TYPED_WORDS[wordIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, 40);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) => currentFullWord.slice(0, prev.length + 1));
      }, 80);
    }

    if (!isDeleting && currentText === currentFullWord) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % TYPED_WORDS.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex]);

  const scrollToAI = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-36 px-6 overflow-hidden min-h-[640px] md:min-h-[720px] flex flex-col justify-center">
      {/* ── Interactive Physics Floating Logos Background ── */}
      <HeroFloatingLogos />

      {/* ── Main Hero Content ── */}
      <div className="max-w-[1200px] mx-auto text-center relative z-20">
        {/* Mobbin-style Stacked Logo Cards — directly above hero headline */}
        <LogoStack />

        {/* Headline with Typing Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[clamp(38px,7vw,76px)] font-semibold leading-[1.06] tracking-[-0.035em] text-[var(--fg)] max-w-[880px] mx-auto"
        >
          Find{" "}
          <span className="inline-block relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 font-bold">
              {currentText || "\u00A0"}
            </span>
            <span className="inline-block w-[3px] h-[0.8em] ml-0.5 bg-blue-600 dark:bg-blue-400 animate-pulse align-middle rounded-full" />
          </span>{" "}
          mentors <br className="hidden sm:block" />
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
            <svg className="w-4 h-4 fill-current" viewBox="0 0 814 1000" xmlSpace="preserve">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
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
            <svg className="w-4 h-4" viewBox="0 0 256 171" preserveAspectRatio="xMidYMid">
              <defs>
                <linearGradient id="meta_hero__a" x1="13.878%" x2="89.144%" y1="55.934%" y2="58.694%">
                  <stop offset="0%" stopColor="#0064E1"/>
                  <stop offset="40%" stopColor="#0064E1"/>
                  <stop offset="83%" stopColor="#0073EE"/>
                  <stop offset="100%" stopColor="#0082FB"/>
                </linearGradient>
                <linearGradient id="meta_hero__b" x1="54.315%" x2="54.315%" y1="82.782%" y2="39.307%">
                  <stop offset="0%" stopColor="#0082FB"/>
                  <stop offset="100%" stopColor="#0064E0"/>
                </linearGradient>
              </defs>
              <path fill="#0081FB" d="M27.651 112.136c0 9.775 2.146 17.28 4.95 21.82 3.677 5.947 9.16 8.466 14.751 8.466 7.211 0 13.808-1.79 26.52-19.372 10.185-14.092 22.186-33.874 30.26-46.275l13.675-21.01c9.499-14.591 20.493-30.811 33.1-41.806C161.196 4.985 172.298 0 183.47 0c18.758 0 36.625 10.87 50.3 31.257C248.735 53.584 256 81.707 256 110.729c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363v-27.616c15.695 0 19.612-14.422 19.612-30.927 0-23.52-5.484-49.623-17.564-68.273-8.574-13.23-19.684-21.313-31.907-21.313-13.22 0-23.859 9.97-35.815 27.75-6.356 9.445-12.882 20.956-20.208 33.944l-8.066 14.289c-16.203 28.728-20.307 35.271-28.408 46.07-14.2 18.91-26.324 26.076-42.287 26.076-18.935 0-30.91-8.2-38.325-20.556C2.973 139.413 0 126.202 0 111.148l27.651.988Z"/>
              <path fill="url(#meta_hero__a)" d="M21.802 33.206C34.48 13.666 52.774 0 73.757 0 85.91 0 97.99 3.597 110.605 13.897c13.798 11.261 28.505 29.805 46.853 60.368l6.58 10.967c15.881 26.459 24.917 40.07 30.205 46.49 6.802 8.243 11.565 10.7 17.752 10.7 15.695 0 19.612-14.422 19.612-30.927l24.393-.766c0 17.253-3.4 29.93-9.187 39.946-5.591 9.686-16.488 19.363-34.818 19.363-11.395 0-21.49-2.475-32.654-13.007-8.582-8.083-18.615-22.443-26.334-35.352l-22.96-38.352C118.528 64.08 107.96 49.73 101.845 43.23c-6.578-6.988-15.036-15.428-28.532-15.428-10.923 0-20.2 7.666-27.963 19.39L21.802 33.206Z"/>
              <path fill="url(#meta_hero__b)" d="M73.312 27.802c-10.923 0-20.2 7.666-27.963 19.39-10.976 16.568-17.698 41.245-17.698 64.944 0 9.775 2.146 17.28 4.95 21.82L9.027 149.482C2.973 139.413 0 126.202 0 111.148 0 83.772 7.514 55.24 21.802 33.206 34.48 13.666 52.774 0 73.757 0l-.445 27.802Z"/>
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
