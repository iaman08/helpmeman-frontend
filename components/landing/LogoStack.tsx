"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/* ─────────────────────────────────────────────────────────
   Mobbin-style Stacked Logo Cards
   Premium rotating card stack — synced with hero headline words
   ───────────────────────────────────────────────────────── */

const CARD_SIZE = 96;
const ROTATE_MS = 2400;

/* ─── Stack position configs: front (0) → back (3) ─── */
const STACK = [
  { y: 0, scale: 1, opacity: 1, zIndex: 40 },
  { y: -14, scale: 0.88, opacity: 0.6, zIndex: 30 },
  { y: -25, scale: 0.78, opacity: 0.35, zIndex: 20 },
  { y: -34, scale: 0.70, opacity: 0.18, zIndex: 10 },
];

/* ─── Card data interface ─── */
export interface LogoCard {
  name: string;
  word: string;
  bg: string;
  border?: string;
  icon: React.ReactNode;
}

/* ─── Original Logo card definitions with paired words ─── */
export const LOGOS: LogoCard[] = [
  /* ── 1. IIT Bombay ── */
  {
    name: "IIT Bombay",
    word: "IITian",
    bg: "#003366",
    icon: (
      <svg width="44" height="22" viewBox="0 0 60 26" fill="white">
        <text
          x="30"
          y="22"
          textAnchor="middle"
          fontSize="26"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
        >
          IIT
        </text>
      </svg>
    ),
  },

  /* ── 2. Google ── */
  {
    name: "Google",
    word: "Tech",
    bg: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.08)",
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
        <path
          d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"
          fill="#FFC107"
        />
        <path
          d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
          fill="#FF3D00"
        />
        <path
          d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
          fill="#4CAF50"
        />
        <path
          d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"
          fill="#1976D2"
        />
      </svg>
    ),
  },

  /* ── 3. Apollo Hospitals ── */
  {
    name: "Apollo Hospitals",
    word: "Doctor",
    bg: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.08)",
    icon: (
      <svg
        viewBox="0 0 180 180"
        width="62"
        height="62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M78 38C72 30 74 18 86 10C85 20 92 25 94 31C97 39 90 46 83 46C79 46 76 43 78 38Z"
          fill="#F59E0B"
        />
        <path
          d="M84 38C81 33 83 24 91 18C90 25 95 28 96 32C98 37 94 42 89 42C86 42 84 40 84 38Z"
          fill="#F97316"
        />
        <path d="M42 40H76V76L52 100H42V40Z" fill="#007DA5" />
        <path d="M55 47H63V53H69V61H63V67H55V61H49V53H55V47Z" fill="white" />
        <path d="M76 66L66 76L76 86V66Z" fill="#007DA5" />
        <circle cx="70" cy="72" r="1.5" fill="white" />
        <path d="M84 46H94L87 70H92L82 96H74L84 46Z" fill="#007DA5" />
        <text
          x="90"
          y="128"
          textAnchor="middle"
          fill="#007DA5"
          fontSize="28"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
        >
          Apollo
        </text>
        <text
          x="90"
          y="145"
          textAnchor="middle"
          fill="#64748B"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="2.5"
        >
          HOSPITALS
        </text>
        <text
          x="90"
          y="159"
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="7.5"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.8"
        >
          TOUCHING LIVES
        </text>
      </svg>
    ),
  },

  /* ── 4. Cultfit ── */
  {
    name: "Cultfit",
    word: "Fitness",
    bg: "#000000",
    icon: (
      <svg
        viewBox="0 0 160 160"
        width="58"
        height="58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="76.5" y="14" width="7" height="12" rx="3.5" fill="#E8005A" />
        <line
          x1="56"
          y1="35"
          x2="68"
          y2="43"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <line
          x1="104"
          y1="35"
          x2="92"
          y2="43"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <circle cx="80" cy="39" r="8" stroke="white" strokeWidth="6.5" fill="none" />
        <line
          x1="42"
          y1="57"
          x2="118"
          y2="57"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="47"
          y1="77"
          x2="58"
          y2="69"
          stroke="#00B4D8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="113"
          y1="77"
          x2="102"
          y2="69"
          stroke="#FFB703"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M56 93L80 71L104 93"
          stroke="white"
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="80"
          y1="87"
          x2="80"
          y2="98"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text
          x="80"
          y="132"
          textAnchor="middle"
          fill="white"
          fontSize="23"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
        >
          cult.fit
        </text>
      </svg>
    ),
  },

  /* ── 5. Microsoft ── */
  {
    name: "Microsoft",
    word: "Developer",
    bg: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.08)",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24">
        <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1" />
        <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1" />
        <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1" />
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1" />
      </svg>
    ),
  },

  /* ── 6. NLSIU ── */
  {
    name: "NLSIU",
    word: "Lawyer",
    bg: "#1E3A5F",
    icon: (
      <img
        src="/nlsiu.png"
        alt="NLSIU Bangalore logo"
        width={56}
        height={56}
        style={{ objectFit: "contain", borderRadius: 18 }}
      />
    ),
  },

  /* ── 7. Y Combinator ── */
  {
    name: "Y Combinator",
    word: "Founder",
    bg: "#F26522",
    icon: (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="white">
        <path d="M20 24.5L10.5 7h5l7 13.5L29.5 7h5L25 24.5V34h-5V24.5z" />
      </svg>
    ),
  },

  /* ── 8. Apple ── */
  {
    name: "Apple",
    word: "Tech",
    bg: "#000000",
    icon: (
      <svg
        width="52"
        height="52"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: "translateY(1px)" }}
      >
        <path
          fill="white"
          d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
        />
      </svg>
    ),
  },
];

interface LogoStackProps {
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
  onHoverChange?: (hovered: boolean) => void;
}

/* ─── The LogoStack Component ─── */
export function LogoStack({
  activeIndex,
  onSelectIndex,
  onHoverChange,
}: LogoStackProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = activeIndex !== undefined;
  const currentIndex = isControlled ? activeIndex : internalIndex;
  const reduceMotion = useReducedMotion();

  // Uncontrolled fallback timer
  useEffect(() => {
    if (isControlled || reduceMotion) return;
    const timer = setInterval(() => {
      setInternalIndex((prev) => (prev + 1) % LOGOS.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [isControlled, reduceMotion]);

  const total = LOGOS.length;
  const safeCurrentIndex = ((currentIndex % total) + total) % total;

  // 4 visible items ordered: [front (pos 0), 2nd (pos 1), 3rd (pos 2), 4th (pos 3)]
  const visibleIndices = [0, 1, 2, 3].map(
    (offset) => (safeCurrentIndex + offset) % total
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center pb-5"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      aria-label="Logos of companies and institutions our mentors come from"
    >
      {/* Stack container */}
      <div
        className="relative cursor-pointer select-none rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500"
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE + 40,
        }}
        role="button"
        tabIndex={0}
        aria-label={`Show the next mentor background. Currently ${LOGOS[safeCurrentIndex]?.name ?? "a university or company"}.`}
        onClick={() => {
          const nextIdx = (safeCurrentIndex + 1) % total;
          if (onSelectIndex) {
            onSelectIndex(nextIdx);
          } else {
            setInternalIndex(nextIdx);
          }
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          const nextIdx = (safeCurrentIndex + 1) % total;
          if (onSelectIndex) {
            onSelectIndex(nextIdx);
          } else {
            setInternalIndex(nextIdx);
          }
        }}
        title="Click to advance"
      >
        <AnimatePresence initial={false}>
          {visibleIndices.map((itemIndex, stackPos) => {
            const logo = LOGOS[itemIndex];
            const pos = STACK[stackPos];

            return (
              <motion.div
                key={logo.name}
                className="absolute left-0 flex items-center justify-center overflow-visible"
                style={{
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  bottom: 0,
                  backgroundColor: logo.bg,
                  borderRadius: 26,
                  border: logo.border || "1px solid rgba(255,255,255,0.12)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  transformOrigin: "center bottom",
                  zIndex: pos.zIndex,
                }}
                initial={{
                  y: -38,
                  scale: 0.6,
                  opacity: 0,
                }}
                animate={{
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  filter:
                    stackPos >= 2
                      ? `blur(${stackPos === 2 ? 0.5 : 1}px)`
                      : "blur(0px)",
                }}
                exit={{
                  y: 8,
                  scale: 0.95,
                  opacity: 0,
                }}
                transition={{
                  y: {
                    type: "spring",
                    stiffness: 180,
                    damping: 22,
                    mass: 0.8,
                  },
                  scale: {
                    type: "spring",
                    stiffness: 180,
                    damping: 22,
                    mass: 0.8,
                  },
                  opacity: {
                    duration: 0.45,
                    ease: "easeInOut",
                  },
                  filter: {
                    duration: 0.4,
                    ease: "easeInOut",
                  },
                }}
              >
                {logo.icon}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}