"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ─────────────────────────────────────────────────────────
   Mobbin-style Stacked Logo Cards
   Premium rotating card stack — depth-based animation
   ───────────────────────────────────────────────────────── */

const CARD_SIZE = 96;
const VISIBLE_COUNT = 4;
const ROTATE_MS = 2000;

/* ─── Stack position configs: front (0) → back (3) ─── */
const STACK = [
  { y: 0,   scale: 1,    opacity: 1,    zIndex: 40 },
  { y: -14, scale: 0.88, opacity: 0.6,  zIndex: 30 },
  { y: -25, scale: 0.78, opacity: 0.35, zIndex: 20 },
  { y: -34, scale: 0.70, opacity: 0.18, zIndex: 10 },
];

/* ─── Card data interface ─── */
interface LogoCard {
  name: string;
  bg: string;
  border?: string;
  icon: React.ReactNode;
}

/* ─── 17 Logo card definitions ─── */
const LOGOS: LogoCard[] = [
  /* ── Google ── */
  {
    name: "Google",
    bg: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.08)",
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
        <path d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z" fill="#FFC107"/>
        <path d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
        <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" fill="#4CAF50"/>
        <path d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" fill="#1976D2"/>
      </svg>
    ),
  },

  /* ── Apple ── */
  {
    name: "Apple",
    bg: "#000000",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
        <path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.07 0-1.37-.62-2.6-.62-1.22 0-1.56.62-2.6.62-1.03 0-2.13-.93-3.1-1.88C3.72 18.33 2.24 14.78 2.24 11.48c0-5.23 3.38-8 6.55-8 1.63 0 3.07.62 3.97.62.9 0 2.65-.7 4.5-.7 1.95 0 3.7.8 4.78 2.25-4.13 2.1-3.47 7.4.2 9 0 .1.03.2.03.3-.3 1-.72 2-1.3 3.08zM15.03 4.1c.88-1.08 1.48-2.6 1.32-4.1-1.28.05-2.84.85-3.76 1.93-.82.95-1.53 2.5-1.34 3.98 1.4.1 2.9-.73 3.78-1.8z"/>
      </svg>
    ),
  },

  /* ── Microsoft ── */
  {
    name: "Microsoft",
    bg: "#FFFFFF",
    border: "1px solid rgba(0,0,0,0.08)",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24">
        <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1"/>
        <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1"/>
        <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1"/>
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1"/>
      </svg>
    ),
  },

  /* ── Stripe ── */
  {
    name: "Stripe",
    bg: "#635BFF",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
      </svg>
    ),
  },

  /* ── Amazon ── */
  {
    name: "Amazon",
    bg: "#232F3E",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <path d="M24 13c-6.6 0-11 4.4-11 10s4.4 10 11 10" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <line x1="35" y1="13" x2="35" y2="33" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        <path d="M13 36c4 2.5 9 4 15 3.5 5-.5 9-2.5 12.5-5.5" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M37 32l4 3" stroke="#FF9900" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },

  /* ── OpenAI ── */
  {
    name: "OpenAI",
    bg: "#000000",
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
        <path d="M22.28 9.37a5.93 5.93 0 0 0-.51-4.88 6.01 6.01 0 0 0-6.48-2.89A5.93 5.93 0 0 0 10.8.17a6.01 6.01 0 0 0-5.73 4.17 5.93 5.93 0 0 0-3.97 2.88 6.01 6.01 0 0 0 .74 7.04 5.93 5.93 0 0 0 .51 4.88 6.01 6.01 0 0 0 6.48 2.89A5.93 5.93 0 0 0 13.2 23.83a6.01 6.01 0 0 0 5.73-4.17 5.93 5.93 0 0 0 3.97-2.88 6.01 6.01 0 0 0-.74-7.04l.12-.37zM13.2 22.18a4.49 4.49 0 0 1-2.88-1.05l.14-.08 4.78-2.76a.78.78 0 0 0 .39-.67v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.51 4.51 0 0 1-4.49 4.5zm-9.66-4.13a4.48 4.48 0 0 1-.54-3.02l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.83-3.37v2.33a.07.07 0 0 1-.03.06l-4.83 2.79a4.51 4.51 0 0 1-6.13-1.64zM2.36 7.87A4.49 4.49 0 0 1 4.72 5.9v5.69a.77.77 0 0 0 .39.67l5.83 3.37-2.02 1.17a.07.07 0 0 1-.07 0L4.02 13.99a4.51 4.51 0 0 1-1.66-6.12zm16.6 3.86l-5.83-3.37 2.02-1.17a.07.07 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.69 8.12V12.4a.77.77 0 0 0-.39-.67zm2.01-3.04l-.14-.09-4.78-2.76a.77.77 0 0 0-.78 0l-5.83 3.37V6.88a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.67 4.66zM8.88 14.09l-2.02-1.17a.07.07 0 0 1-.04-.05V7.3A4.5 4.5 0 0 1 14.2 3.8l-.14.08-4.78 2.76a.78.78 0 0 0-.39.67v6.78zm1.1-2.37l2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5v-3z"/>
      </svg>
    ),
  },

  /* ── Meta ── */
  {
    name: "Meta",
    bg: "#0081FB",
    icon: (
      <svg width="38" height="28" viewBox="0 0 100 40" fill="white">
        <path d="M27 2c-6.6 0-11.7 5.7-16.5 13.5C6.7 7.3 3.5 2 0 2v36h.1c3.2 0 6.5-5.7 10.4-13.5C14.6 32.7 20.3 38 27 38c8.3 0 15-8 15-18S35.3 2 27 2zm0 28c-4.4 0-8-4.5-8-10s3.6-10 8-10 8 4.5 8 10-3.6 10-8 10z"/>
        <path d="M73 2c-6.7 0-12.4 5.3-16.5 13.5C52.6 7.3 49.3 2 46.1 2H46v36c3.5 0 6.7-5.3 10.5-13.5C60.3 32.7 66.3 38 73 38c8.3 0 15-8 15-18S81.3 2 73 2zm0 28c-4.4 0-8-4.5-8-10s3.6-10 8-10 8 4.5 8 10-3.6 10-8 10z"/>
      </svg>
    ),
  },

  /* ── Y Combinator ── */
  {
    name: "Y Combinator",
    bg: "#F26522",
    icon: (
      <svg width="34" height="34" viewBox="0 0 40 40" fill="white">
        <path d="M20 24.5L10.5 7h5l7 13.5L29.5 7h5L25 24.5V34h-5V24.5z"/>
      </svg>
    ),
  },

  /* ── Airbnb ── */
  {
    name: "Airbnb",
    bg: "#FF385C",
    icon: (
      <svg width="34" height="36" viewBox="0 0 32 34" fill="white">
        <path d="M16 2c-1 0-1.8.4-2.5 1.2C11 6 8.8 9.5 7 13.5 4.5 18.8 3 23.5 3 27c0 7.2 5.8 7 13 7s13 .2 13-7c0-3.5-1.5-8.2-4-13.5-1.8-4-4-7.5-6.5-10.3C17.8 2.4 17 2 16 2zm0 28c-3.3 0-6-1.2-6-5 0-2.5 1.2-6.5 3.5-12C14.7 10.5 15.5 8.5 16 7.5c.5 1 1.3 3 2.5 5.5 2.3 5.5 3.5 9.5 3.5 12 0 3.8-2.7 5-6 5z"/>
      </svg>
    ),
  },

  /* ── Uber ── */
  {
    name: "Uber",
    bg: "#000000",
    icon: (
      <svg width="42" height="18" viewBox="0 0 80 28" fill="white">
        <text x="40" y="22" textAnchor="middle" fontSize="26" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-1">UBER</text>
      </svg>
    ),
  },

  /* ── Swiggy ── */
  {
    name: "Swiggy",
    bg: "#FC8019",
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="white">
        <path d="M20 4C14 4 9 7 9 13c0 4 2.5 7 6 8.5l-1 10.5c-.2 1.5.8 2.5 2 2.5h8c1.2 0 2.2-1 2-2.5l-1-10.5c3.5-1.5 6-4.5 6-8.5 0-6-5-9-11-9zm-3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>
    ),
  },

  /* ── Zomato ── */
  {
    name: "Zomato",
    bg: "#E23744",
    icon: (
      <svg width="42" height="18" viewBox="0 0 90 24" fill="white">
        <text x="45" y="20" textAnchor="middle" fontSize="24" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">zomato</text>
      </svg>
    ),
  },

  /* ── Stanford ── */
  {
    name: "Stanford",
    bg: "#8C1515",
    icon: (
      <svg width="34" height="36" viewBox="0 0 40 44" fill="white">
        <text x="20" y="34" textAnchor="middle" fontSize="40" fontWeight="800" fontFamily="'Times New Roman', Georgia, serif">S</text>
      </svg>
    ),
  },

  /* ── IIT Bombay ── */
  {
    name: "IIT Bombay",
    bg: "#003366",
    icon: (
      <svg width="44" height="22" viewBox="0 0 60 26" fill="white">
        <text x="30" y="22" textAnchor="middle" fontSize="26" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.5">IIT</text>
      </svg>
    ),
  },

  /* ── AIIMS Delhi ── */
  {
    name: "AIIMS Delhi",
    bg: "#1A365D",
    icon: (
      <svg width="44" height="20" viewBox="0 0 72 24" fill="white">
        <text x="36" y="20" textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="1">AIIMS</text>
      </svg>
    ),
  },

  /* ── NLSIU Bangalore ── */
  {
    name: "NLSIU",
    bg: "#1E3A5F",
    icon: (
      <svg width="44" height="20" viewBox="0 0 68 24" fill="white">
        <text x="34" y="20" textAnchor="middle" fontSize="21" fontWeight="700" fontFamily="'Times New Roman', Georgia, serif" letterSpacing="1.5">NLSIU</text>
      </svg>
    ),
  },

  /* ── Superteam ── */
  {
    name: "Superteam",
    bg: "#6366F1",
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="white">
        <path d="M20 2l2.5 7.7h8.1l-6.5 4.7 2.5 7.7L20 17.4l-6.5 4.7 2.5-7.7-6.5-4.7h8.1L20 2z"/>
        <circle cx="20" cy="28" r="6" fill="none" stroke="white" strokeWidth="2.5"/>
        <path d="M17 34l3 4 3-4" fill="white"/>
      </svg>
    ),
  },
];

/* ─── The LogoStack Component ─── */
export function LogoStack() {
  const [queue, setQueue] = useState<number[]>(() =>
    LOGOS.map((_, i) => i)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setQueue((prev) => {
        const next = [...prev];
        const first = next.shift()!;
        next.push(first);
        return next;
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const visible = queue.slice(0, VISIBLE_COUNT);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center pb-10"
      aria-label="Logos of companies and institutions our mentors come from"
    >
      {/* Subtle label */}
      <p
        className="text-center select-none pointer-events-none"
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          color: "#9CA3AF",
          marginBottom: "24px",
        }}
      >
        Mentors from leading companies &amp; institutions
      </p>

      {/* Stack container */}
      <div
        className="relative"
        style={{
          width: CARD_SIZE,
          height: CARD_SIZE + 40,
        }}
      >
        <AnimatePresence initial={false}>
          {visible.map((logoIndex, stackPos) => {
            const logo = LOGOS[logoIndex];
            const pos = STACK[stackPos];

            return (
              <motion.div
                key={logo.name}
                className="absolute left-0 flex items-center justify-center overflow-hidden"
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
                  zIndex: pos.zIndex,
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
                  zIndex: {
                    duration: 0,
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
