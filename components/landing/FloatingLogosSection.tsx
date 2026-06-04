"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const stats = [
  { number: "1,000+", label: "Mentors Tier 1" },
  { number: "100+", label: "Global Companies" },
  { number: "15,000+", label: "Sessions Completed" },
  { number: "4.9★", label: "Average Rating" },
];


const marqueeLogoCardsRow1 = [
  {
    name: "Shop",
    category: "E-Commerce",
    color: "#5C5FEE",
    logo: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )
  },
  {
    name: "Headspace",
    category: "Health & Fitness",
    color: "#F79E1B",
    logo: <div className="w-4 h-4 rounded-full bg-white opacity-95" />
  },
  {
    name: "Creme",
    category: "Travel & Lifestyle",
    color: "#000000",
    logo: <span className="text-white font-serif italic font-bold text-[15px] select-none">C</span>
  },
  {
    name: "Mailchimp",
    category: "Utility",
    color: "#FFE01B",
    logo: <span className="text-[17px] select-none">🐒</span>
  },
  {
    name: "Google",
    category: "Technology",
    color: "#4285F4",
    logo: (
      <svg className="w-4.5 h-4.5 text-white fill-current" viewBox="0 0 24 24">
        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.19-5.136 4.19a5.79 5.79 0 0 1-5.8-5.8a5.79 5.79 0 0 1 5.8-5.8c1.55 0 2.97.575 4.05 1.55l3.15-3.15C17.69 2.1 15.21 1 12.24 1c-6.17 0-11.2 5.03-11.2 11.2s5.03 11.2 11.2 11.2c6.17 0 11.2-5.03 11.2-11.2c0-.705-.083-1.395-.24-2.065H12.24z" />
      </svg>
    )
  },
  {
    name: "Slack",
    category: "Communication",
    color: "#4A154B",
    logo: (
      <svg className="w-4.5 h-4.5 text-white fill-current" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042z" />
      </svg>
    )
  }
];

const marqueeLogoCardsRow2 = [
  {
    name: "Headspace",
    category: "Health & Fitness",
    color: "#F79E1B",
    logo: <div className="w-4 h-4 rounded-full bg-white opacity-95" />
  },
  {
    name: "Shop",
    category: "E-Commerce",
    color: "#5C5FEE",
    logo: (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )
  },
  {
    name: "Airbnb",
    category: "Travel & Lifestyle",
    color: "#FF5A5F",
    logo: (
      <svg className="w-4.5 h-4.5 text-white fill-current" viewBox="0 0 24 24">
        <path d="M12 2.25c-.2 0-.39.07-.55.2L2.73 9.77a1.5 1.5 0 0 0-.6 1.2v9.28a1.5 1.5 0 0 0 1.5 1.5h16.74a1.5 1.5 0 0 0 1.5-1.5v-9.28a1.5 1.5 0 0 0-.6-1.2L12.55 2.45c-.16-.13-.35-.2-.55-.2zm0 13c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    )
  },
  {
    name: "Spotify",
    category: "Media & Entertainment",
    color: "#1DB954",
    logo: (
      <svg className="w-4.5 h-4.5 text-white fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm4.59 14.42c-.18.29-.56.39-.86.2-2.38-1.45-5.37-1.78-8.9-1-.34.07-.67-.14-.74-.47-.08-.34.14-.67.47-.74 3.86-.88 7.15-.5 9.83 1.14.29.18.39.56.2.86z" />
      </svg>
    )
  },
  {
    name: "Meta",
    category: "Technology",
    color: "#0668E1",
    logo: (
      <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.33 12.35c-.44.44-1.13.65-2.05.65h-1.55v-2h1.55c.93 0 1.61.21 2.05.65.44.43.66 1.01.66 1.74 0 .62-.22 1.15-.66 1.61z" />
      </svg>
    )
  },
  {
    name: "Figma",
    category: "Design Tool",
    color: "#F24E1E",
    logo: (
      <svg className="w-3.5 h-5 text-white fill-current" viewBox="0 0 12 18">
        <path d="M3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6Z" fill="currentColor" />
        <path d="M3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12Z" fill="currentColor" />
        <path d="M3 15C3 13.3431 4.34315 12 6 12C7.65685 12 9 13.3431 9 15C9 16.6569 7.65685 18 6 18C4.34315 18 3 16.6569 3 15Z" fill="currentColor" />
      </svg>
    )
  }
];

export function FloatingLogosSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-24 md:py-36 px-6 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[500px] flex flex-col items-center justify-center gap-14"
    >
      {/* 1. Ambient Background Grid/Glow for Professional Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />


      {/* 3. Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 relative z-20 max-w-5xl w-full text-center"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
            className="flex flex-col gap-1 items-center justify-center border-r last:border-none border-slate-200 dark:border-zinc-800/60 max-md:even:border-none"
          >
            <span className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {stat.number}
            </span>
            <span className="text-xs md:text-sm font-medium tracking-wide text-slate-500 dark:text-zinc-400 uppercase mt-1">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* 4. Infinite Marquee Loop (Double Row, Card-based) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-full relative z-20 mt-4 flex flex-col gap-5 overflow-hidden mask-marquee"
        style={{
          maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)'
        }}
      >
        {/* Row 1: Scrolling Left */}
        <motion.div
          className="flex whitespace-nowrap gap-5 w-max items-center py-1"
          animate={{ x: [0, -800] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {[...marqueeLogoCardsRow1, ...marqueeLogoCardsRow1, ...marqueeLogoCardsRow1].map((card, i) => (
            <div
              key={`row1-${card.name}-${i}`}
              className="inline-flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl py-2.5 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-w-[200px]"
            >
              <div
                className="w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold"
                style={{ backgroundColor: card.color }}
              >
                {card.logo}
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-bold text-[13px] text-slate-800 dark:text-zinc-100">{card.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-1">{card.category}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Row 2: Scrolling Right */}
        <motion.div
          className="flex whitespace-nowrap gap-5 w-max items-center py-1"
          animate={{ x: [-800, 0] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {[...marqueeLogoCardsRow2, ...marqueeLogoCardsRow2, ...marqueeLogoCardsRow2].map((card, i) => (
            <div
              key={`row2-${card.name}-${i}`}
              className="inline-flex items-center gap-3 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl py-2.5 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-w-[200px]"
            >
              <div
                className="w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold"
                style={{ backgroundColor: card.color }}
              >
                {card.logo}
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-bold text-[13px] text-slate-800 dark:text-zinc-100">{card.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-1">{card.category}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}