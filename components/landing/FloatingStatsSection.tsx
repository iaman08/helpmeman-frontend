"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

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
  { name: "Google", slug: "google", size: 66, mobileSize: 44, topPct: 12, leftPct: 15, driftX: -35, driftY: -40 },
  { name: "Apple", slug: "apple", size: 62, mobileSize: 42, topPct: 8, leftPct: 34, driftX: -15, driftY: -50 },
  { name: "ChatGPT", slug: "chatgpt", size: 66, mobileSize: 44, topPct: 9, leftPct: 50, driftX: 0, driftY: -55 },
  { name: "Slack", slug: "slack", size: 62, mobileSize: 42, topPct: 10, leftPct: 70, driftX: 25, driftY: -45 },
  { name: "Spotify", slug: "spotify", size: 64, mobileSize: 42, topPct: 13, leftPct: 88, driftX: 45, driftY: -35 },

  // Middle Flanks
  { name: "Meta", slug: "meta", size: 66, mobileSize: 44, topPct: 45, leftPct: 10, driftX: -60, driftY: 0 },
  { name: "Amazon", slug: "amazon", size: 66, mobileSize: 44, topPct: 44, leftPct: 86, driftX: 60, driftY: 0 },

  // Bottom Row
  { name: "Figma", slug: "figma", size: 62, mobileSize: 42, topPct: 80, leftPct: 8, driftX: -45, driftY: 40 },
  { name: "Cultfit", slug: "cultfit", size: 64, mobileSize: 44, topPct: 83, leftPct: 28, driftX: -25, driftY: 50 },
  { name: "Uber", slug: "uber", size: 66, mobileSize: 44, topPct: 85, leftPct: 48, driftX: 0, driftY: 60 },
  { name: "Airbnb", slug: "airbnb", size: 66, mobileSize: 44, topPct: 83, leftPct: 68, driftX: 25, driftY: 50 },
  { name: "Adobe", slug: "adobe", size: 62, mobileSize: 42, topPct: 80, leftPct: 88, driftX: 45, driftY: 40 },
];

export function FloatingStatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollDistance = rect.height - windowHeight;
      
      if (totalScrollDistance <= 0) return;

      // Calculate progress between 0 and 1 while the element is pinned
      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollDistance, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stage flags based on scroll progress
  const isStage1Active = scrollProgress >= 0.05; // Line 1 turns bold black
  const isStage2Active = scrollProgress >= 0.28; // Line 2 reveals
  const isStage3Active = scrollProgress >= 0.58; // Line 3 reveals

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220vh] bg-white dark:bg-[#0A0A0A] border-t border-[var(--hairline)]"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 select-none">
        {/* Floating Ambient Brand Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {FLOATING_LOGOS.map((logo) => {
            const currentX = logo.driftX * scrollProgress;
            const currentY = logo.driftY * scrollProgress;
            return (
              <div
                key={logo.name}
                style={{
                  position: "absolute",
                  top: `${logo.topPct}%`,
                  left: `${logo.leftPct}%`,
                  transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
                  transition: "transform 0.15s ease-out",
                }}
                className="will-change-transform z-10"
              >
                <div
                  className="w-[46px] h-[46px] sm:w-[64px] sm:h-[64px] rounded-2xl sm:rounded-[20px] bg-white dark:bg-[#18181B] border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center transition-all hover:scale-105"
                >
                  <img
                    src={`/logos/${logo.slug}.svg`}
                    alt={logo.name}
                    className="w-5 h-5 sm:w-7 sm:h-7 object-contain"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Scroll-Driven Numbers */}
        <div className="relative z-20 text-center flex flex-col items-center max-w-4xl mx-auto pointer-events-none">
          {/* Top Label */}
          <p className="text-[14px] sm:text-[17px] font-semibold text-[#111111] dark:text-white tracking-tight mb-2 sm:mb-4">
            A growing community of
          </p>

          {/* Line 1: No of Sessions */}
          <div
            className={`transition-all duration-500 ease-out transform ${
              isStage1Active
                ? "text-[#111111] dark:text-white opacity-100 scale-100"
                : "text-neutral-300 dark:text-neutral-700 opacity-60 scale-98"
            }`}
          >
            <h2 className="text-[clamp(36px,7.5vw,90px)] font-extrabold leading-[1.04] tracking-[-0.04em]">
              1,428+ sessions
            </h2>
          </div>

          {/* Line 2: Total Minutes */}
          <div
            className={`transition-all duration-500 ease-out transform ${
              isStage2Active
                ? "opacity-100 translate-y-0 scale-100 max-h-[140px] mt-1 sm:mt-2.5"
                : "opacity-0 translate-y-10 scale-95 max-h-0 overflow-hidden pointer-events-none"
            }`}
          >
            <h2 className="text-[clamp(36px,7.5vw,90px)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#111111] dark:text-white">
              621,500+ minutes
            </h2>
          </div>

          {/* Line 3: No of Mentees */}
          <div
            className={`transition-all duration-500 ease-out transform ${
              isStage3Active
                ? "opacity-100 translate-y-0 scale-100 max-h-[140px] mt-1 sm:mt-2.5"
                : "opacity-0 translate-y-10 scale-95 max-h-0 overflow-hidden pointer-events-none"
            }`}
          >
            <h2 className="text-[clamp(36px,7.5vw,90px)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#111111] dark:text-white">
              323,900+ mentees
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}