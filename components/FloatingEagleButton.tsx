"use client";

import { motion } from "motion/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { EagleFlyFormModal } from "./EagleFlyFormModal";

// ── Launch date (same as EagleFlyFormModal) ─────────────────────────────────
const LAUNCH_DATE = new Date("2026-09-13T00:00:00+05:30");

function getBadgeTime() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return { days, hours, minutes };
}

export function FloatingEagleButton() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [originPos, setOriginPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [badgeTime, setBadgeTime] = useState(getBadgeTime);
  const isLaunched = badgeTime === null;

  useEffect(() => {
    if (isLaunched) return;
    const id = setInterval(() => {
      const bt = getBadgeTime();
      setBadgeTime(bt);
      if (bt === null) clearInterval(id);
    }, 60000); // update every minute for the badge
    return () => clearInterval(id);
  }, [isLaunched]);

  const handleClick = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setOriginPos({
        x: rect.left + rect.width / 2 - 28, // center the 56px eagle image
        y: rect.top + rect.height / 2 - 28,
      });
    }
    setModalOpen(true);
  }, []);

  // Only show the eagle icon on the landing page
  if (pathname !== "/") {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-[116px] sm:bottom-[128px] right-5 sm:right-6 z-[990] flex items-center flex-col select-none pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative group flex items-center justify-center"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Tooltip Pill */}
          {hovered && !modalOpen && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="absolute right-[calc(100%+14px)] top-1/2 -translate-y-1/2 hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-slate-900/95 dark:bg-[#1E1F2A]/95 text-white text-xs font-semibold backdrop-blur-md border border-blue-500/40 shadow-xl whitespace-nowrap pointer-events-none"
            >
              <span>{isLaunched ? "Report Bug · Trenchers AI" : "Bug Reporting Opens Sep 13"}</span>
            </motion.div>
          )}

          {/* Pre-launch countdown badge above button */}
          {!isLaunched && badgeTime && !modalOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-blue-600 text-[11px] font-extrabold text-white shadow-[0_4px_16px_rgba(37,99,235,0.55)] pointer-events-none tabular-nums border border-blue-300/40 tracking-wide flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {badgeTime.days > 0 && `${badgeTime.days}d `}
                {String(badgeTime.hours).padStart(2, "0")}h {String(badgeTime.minutes).padStart(2, "0")}m
              </span>
            </motion.div>
          )}

          {/* Circular Eagle Button */}
          <button
            ref={buttonRef}
            onClick={handleClick}
            aria-label="Report Bug or Visit Trenchers AI"
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black border-2 border-blue-500 hover:border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.35),0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] flex items-center justify-center p-2.5 hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer overflow-hidden"
          >
            {/* Subtle Ambient Glow on Hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/25 to-indigo-500/25 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Eagle Logo */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src="/eagle-logo.png"
                alt="Eagle Emblem"
                className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Eagle Fly Animation + Form Modal */}
      <EagleFlyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        originX={originPos.x}
        originY={originPos.y}
      />
    </>
  );
}
