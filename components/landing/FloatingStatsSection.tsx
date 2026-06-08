"use client";

import { motion } from "motion/react";

const STATS = [
  { number: "100+", label: "Mentors from Tier 1 Companies" },
  { number: "100+", label: "Global Companies Represented" },
  { number: "3+", label: "Sessions Completed" },
  { number: "4.9★", label: "Average Mentor Rating" },
];

const LOGOS = [
  { name: "Google", slug: "google" },
  { name: "Apple", slug: "apple" },
  { name: "Spotify", slug: "spotify" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Netflix", slug: "netflix" },
  { name: "Amazon", slug: "amazon" },
  { name: "Meta", slug: "meta" },
  { name: "Slack", slug: "slack" },
  { name: "Figma", slug: "figma" },
  { name: "Airbnb", slug: "airbnb" },
  { name: "Adobe", slug: "adobe" },
  { name: "Uber", slug: "uber" },
];

export function FloatingStatsSection() {
  return (
    <section className="logo-stats-section py-20 bg-white dark:bg-[#0A0A0A] border-y border-[#E5E7EB] dark:border-[#27272A] relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_1px_4px_rgba(0,0,0,0.02)] text-[12px] font-medium text-slate-600 dark:text-zinc-400 select-none">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          Where our mentors work
        </div>

        {/* Title */}
        <h3 className="text-center text-[15px] font-normal text-slate-500 dark:text-zinc-400 tracking-wide mb-12">
          Trusted by professionals at top global institutions
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 w-full mb-16">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="stat-item flex flex-col items-center justify-center text-center"
            >
              <span className="stat-number text-[#111111] dark:text-white font-extrabold tracking-tight">
                {stat.number}
              </span>
              <span className="stat-label mt-2 text-slate-500 dark:text-zinc-400 text-[14px]">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Smooth scrolling logos marquee */}
        <div
          className="w-full relative overflow-hidden py-4"
          style={{
            maskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
          }}
        >
          <motion.div
            className="flex whitespace-nowrap gap-16 w-max items-center"
            animate={{ x: [0, -1200] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={`${logo.slug}-${i}`}
                className="flex items-center gap-2.5 opacity-40 hover:opacity-85 transition-opacity duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${logo.slug}.svg`}
                  alt={logo.name}
                  width={24}
                  height={24}
                  className="brightness-0 dark:brightness-0 dark:invert"
                  loading="lazy"
                  draggable={false}
                />
                <span className="text-slate-800 dark:text-zinc-200 font-bold text-[14px] tracking-tight">
                  {logo.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}