"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface FloatingLogo {
  name: string;
  slug: string;
  size: number;
  mobileSize: number;
  topPct: number;
  leftPct: number;
  driftX: number;
  driftY: number;
}

const FLOATING_LOGOS: FloatingLogo[] = [
  // Top Row
  { name: "Google", slug: "google", size: 66, mobileSize: 44, topPct: 12, leftPct: 15, driftX: -30, driftY: -35 },
  { name: "Apple", slug: "apple", size: 62, mobileSize: 42, topPct: 8, leftPct: 34, driftX: -10, driftY: -45 },
  { name: "ChatGPT", slug: "chatgpt", size: 66, mobileSize: 44, topPct: 9, leftPct: 50, driftX: 0, driftY: -50 },
  { name: "Slack", slug: "slack", size: 62, mobileSize: 42, topPct: 10, leftPct: 70, driftX: 20, driftY: -40 },
  { name: "Spotify", slug: "spotify", size: 64, mobileSize: 42, topPct: 13, leftPct: 88, driftX: 40, driftY: -30 },

  // Middle Flanks
  { name: "Meta", slug: "meta", size: 66, mobileSize: 44, topPct: 45, leftPct: 10, driftX: -55, driftY: 0 },
  { name: "Amazon", slug: "amazon", size: 66, mobileSize: 44, topPct: 44, leftPct: 86, driftX: 55, driftY: 0 },

  // Bottom Row
  { name: "Figma", slug: "figma", size: 62, mobileSize: 42, topPct: 80, leftPct: 8, driftX: -40, driftY: 35 },
  { name: "Cultfit", slug: "cultfit", size: 64, mobileSize: 44, topPct: 83, leftPct: 28, driftX: -20, driftY: 45 },
  { name: "Uber", slug: "uber", size: 66, mobileSize: 44, topPct: 85, leftPct: 48, driftX: 0, driftY: 55 },
  { name: "Airbnb", slug: "airbnb", size: 66, mobileSize: 44, topPct: 83, leftPct: 68, driftX: 20, driftY: 45 },
  { name: "Adobe", slug: "adobe", size: 62, mobileSize: 42, topPct: 80, leftPct: 88, driftX: 40, driftY: 35 },
];

function FloatingCard({ logo, progress }: { logo: FloatingLogo; progress: any }) {
  const xOffset = useTransform(progress, [0, 1], [0, logo.driftX]);
  const yOffset = useTransform(progress, [0, 1], [0, logo.driftY]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.92, 1, 1.05]);

  return (
    <motion.div
      style={{
        position: "absolute",
        top: `${logo.topPct}%`,
        left: `${logo.leftPct}%`,
        x: xOffset,
        y: yOffset,
        scale,
        transform: "translate(-50%, -50%)",
      }}
      className="will-change-transform z-10 select-none pointer-events-none"
    >
      <div
        className="w-[46px] h-[46px] sm:w-[62px] sm:h-[62px] rounded-2xl sm:rounded-[20px] bg-white dark:bg-[#18181B] border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center transition-all"
      >
        <img
          src={`/logos/${logo.slug}.svg`}
          alt={logo.name}
          className="w-5 h-5 sm:w-7 sm:h-7 object-contain"
          loading="lazy"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}

export function FloatingStatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // ── Line 1 (Sessions) ──
  // Starts at ghost gray (0.35 opacity) and turns solid pure black/white as user scrolls in
  const line1Opacity = useTransform(scrollYProgress, [0, 0.25], [0.35, 1]);
  const line1Scale = useTransform(scrollYProgress, [0, 0.25], [0.96, 1]);

  // ── Line 2 (Minutes) ──
  // Smoothly slides in and rises to solid black/white between 0.22 and 0.52 progress
  const line2Opacity = useTransform(scrollYProgress, [0.22, 0.50], [0, 1]);
  const line2Y = useTransform(scrollYProgress, [0.22, 0.50], [35, 0]);
  const line2Scale = useTransform(scrollYProgress, [0.22, 0.50], [0.94, 1]);

  // ── Line 3 (Mentees) ──
  // Smoothly slides in and completes the 3-line stack between 0.50 and 0.78 progress
  const line3Opacity = useTransform(scrollYProgress, [0.50, 0.78], [0, 1]);
  const line3Y = useTransform(scrollYProgress, [0.50, 0.78], [35, 0]);
  const line3Scale = useTransform(scrollYProgress, [0.50, 0.78], [0.94, 1]);

  return (
    <div ref={containerRef} className="relative w-full h-[180vh] bg-white dark:bg-[#0A0A0A]">
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4">
        {/* Floating Ambient Brand Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {FLOATING_LOGOS.map((logo) => (
            <FloatingCard key={logo.name} logo={logo} progress={scrollYProgress} />
          ))}
        </div>

        {/* Central Scroll-Driven Numbers */}
        <div className="relative z-20 text-center flex flex-col items-center max-w-4xl mx-auto select-none pointer-events-none">
          {/* Top Label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[14px] sm:text-[17px] font-semibold text-[#111111] dark:text-white tracking-tight mb-2 sm:mb-4"
          >
            A growing community of
          </motion.p>

          {/* Line 1: No of Sessions */}
          <motion.div
            style={{
              opacity: line1Opacity,
              scale: line1Scale,
            }}
            className="will-change-transform"
          >
            <h2 className="text-[clamp(38px,7.6vw,92px)] font-bold sm:font-extrabold leading-[1.04] tracking-[-0.04em] text-[#111111] dark:text-white">
              1,428+ sessions
            </h2>
          </motion.div>

          {/* Line 2: Total Minutes */}
          <motion.div
            style={{
              opacity: line2Opacity,
              y: line2Y,
              scale: line2Scale,
            }}
            className="will-change-transform"
          >
            <h2 className="text-[clamp(38px,7.6vw,92px)] font-bold sm:font-extrabold leading-[1.04] tracking-[-0.04em] text-[#111111] dark:text-white mt-1 sm:mt-2">
              621,500+ minutes
            </h2>
          </motion.div>

          {/* Line 3: No of Mentees */}
          <motion.div
            style={{
              opacity: line3Opacity,
              y: line3Y,
              scale: line3Scale,
            }}
            className="will-change-transform"
          >
            <h2 className="text-[clamp(38px,7.6vw,92px)] font-bold sm:font-extrabold leading-[1.04] tracking-[-0.04em] text-[#111111] dark:text-white mt-1 sm:mt-2">
              323,900+ mentees
            </h2>
          </motion.div>
        </div>
      </div>
    </div>
  );
}