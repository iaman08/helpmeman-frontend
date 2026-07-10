"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const MESSAGES = [
  "Signing you in...",
  "Onboarding to Dashboard...",
  "Securing your workspace connection...",
  "Retrieving custom settings and profiles...",
  "Verifying your Google credentials...",
  "Preparing the Elite mentor lounge...",
  "Almost there, finalizing onboarding details...",
];

export default function GoogleAuthLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Pause updates when tab is hidden to save CPU/GPU cycles and prevent background lag
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        intervalId = setInterval(() => {
          setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 2500);
      } else {
        clearInterval(intervalId);
      }
    };

    // Initialize
    if (document.visibilityState === "visible") {
      intervalId = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
      }, 2500);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-[2px] transition-opacity duration-300">
      {/* Central Professional Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121214] border border-gray-200/60 dark:border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] max-w-[340px] sm:max-w-sm w-[90%] sm:w-full mx-4 text-center transform-gpu"
      >
        {/* Pulsing and Rotating Spinner */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-6 transform-gpu">
          {/* Glowing Outer Ring */}
          <div className="absolute inset-0 rounded-full border-[3px] sm:border-4 border-dashed border-[#4285F4]/30 animate-[spin_12s_linear_infinite] will-change-transform transform-gpu" />
          {/* Pulsing Gradient Circle */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#4285F4] via-[#EA4335] to-[#FBBC05] opacity-20 animate-pulse transform-gpu" />
          {/* Inner Rotating Ring */}
          <div className="absolute inset-1 rounded-full border-t-[3px] border-r-[3px] sm:border-t-4 sm:border-r-4 border-transparent border-t-[#4285F4] border-r-[#FBBC05] animate-[spin_1.2s_linear_infinite] will-change-transform transform-gpu" />
          {/* Logo center point */}
          <div className="absolute inset-4 sm:inset-5 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm transform-gpu">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse transform-gpu" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
        </div>

        {/* Enhanced Messages Container - fixed height to prevent layout shifts & jank on mobile wrap */}
        <div className="min-h-[44px] sm:min-h-[48px] flex items-center justify-center w-full px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-[13px] sm:text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 leading-tight"
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-[11px] sm:text-[12px] text-zinc-400 dark:text-zinc-500 mt-3 select-none animate-pulse">
          Please wait a moment...
        </p>
      </motion.div>
    </div>
  );
}
