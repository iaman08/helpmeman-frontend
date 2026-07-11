"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";


/* ──────────────────────────────────────────────────
   Marquee logo cards — correct icons via
   Simple Icons CDN (cdn.simpleicons.org/slug/color).
   ────────────────────────────────────────────────── */
const marqueeLogoCardsRow1 = [
  { name: "Google", color: "#ffffffff", slug: "google", size: 62 },
  { name: "Apple", color: "#ffffffff", slug: "apple", size: 58 },
  { name: "Spotify", color: "#ffffffff", slug: "spotify", size: 60 },
  { name: "Microsoft", color: "#ffffffff", slug: "microsoft", size: 58 },
  { name: "Netflix", color: "#ffffffff", slug: "netflix", size: 62 },
  { name: "Amazon", color: "#ffffffff", slug: "amazon", size: 60 },
];

const marqueeLogoCardsRow2 = [
  { name: "Meta", color: "#ffffffff", slug: "meta", size: 58 },
  { name: "Slack", color: "#ffffffff", slug: "slack", size: 56 },
  { name: "Figma", color: "#ffffffff", slug: "figma", size: 58 },
  { name: "Airbnb", color: "#ffffffff", slug: "airbnb", size: 62 },
  { name: "Adobe", color: "#ffffffff", slug: "adobe", size: 58 },
  { name: "Uber", color: "#ffffffff", slug: "uber", size: 60 },
];

export function FloatingLogosSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-24 md:py-36 px-6 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[500px] flex flex-col items-center justify-center gap-14"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />


      {/* Infinite Marquee Loop (Double Row, Card-based) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
        className="w-full relative z-20 mt-4 flex flex-col gap-5 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
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
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.color }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${card.slug}.svg`}
                  alt={card.name}
                  width={18}
                  height={18}
                  className="object-contain"
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-bold text-[13px] text-slate-800 dark:text-zinc-100">{card.name}</span>
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
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.color }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${card.slug}.svg`}
                  alt={card.name}
                  width={18}
                  height={18}
                  className="object-contain"
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="font-bold text-[13px] text-slate-800 dark:text-zinc-100">{card.name}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}