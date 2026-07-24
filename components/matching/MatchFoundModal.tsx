"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { ScoredMentor } from "./useSwipeEngine";

interface MatchFoundModalProps {
  mentor: ScoredMentor | null;
  onClose: () => void;
}

function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#f59e0b", "#22c55e", "#6366f1", "#ec4899", "#06b6d4", "#a855f7"];
  const color = colors[index % colors.length];
  const left = `${5 + (index * 6.5) % 90}%`;
  const delay = (index * 0.08) % 0.6;
  const duration = 1.2 + (index % 4) * 0.3;

  return (
    <motion.div
      className="absolute top-0 rounded-sm"
      style={{
        left,
        width: index % 3 === 0 ? 8 : 6,
        height: index % 3 === 0 ? 14 : 10,
        background: color,
        originX: 0.5,
        originY: 0,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: ["0%", "120vh"],
        rotate: [0, index % 2 === 0 ? 360 : -360],
        opacity: [1, 1, 0],
      }}
      transition={{ duration, delay, ease: "easeIn", repeat: Infinity, repeatDelay: 1.5 }}
    />
  );
}

export function MatchFoundModal({ mentor, onClose }: MatchFoundModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {mentor && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md"
          />

          {/* Confetti */}
          <div className="fixed inset-0 z-[61] pointer-events-none overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <ConfettiPiece key={i} index={i} />
            ))}
          </div>

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="fixed inset-0 z-[62] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--hairline)",
              }}
            >
              {/* Brand top strip */}
              <div
                className="h-1.5 w-full bg-(--accent)"
              />

              <div className="p-6">
                {/* Close */}
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full bg-(--fg)/5 hover:bg-(--fg)/10 transition-colors cursor-pointer text-(--fg)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Stars */}
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="text-5xl mb-3"
                  >
                    ⭐
                  </motion.div>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-2xl font-black font-display text-(--fg)"
                  >
                    Great Match Found!
                  </motion.h2>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-sm text-(--muted) mt-1.5"
                  >
                    You marked this as Priority Match
                  </motion.p>
                </div>

                {/* Mentor */}
                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 p-4 rounded-2xl mb-5 border border-(--hairline) bg-(--fg)/3"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={mentor.avatar || `https://i.pravatar.cc/150?u=${mentor.id}`}
                      alt={mentor.displayName}
                      className="h-14 w-14 rounded-full object-cover border border-(--hairline)"
                    />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-(--bg)"
                      style={{ background: mentor.isOnline ? "#22c55e" : "#9ca3af" }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-(--fg) text-sm truncate">{mentor.displayName}</p>
                    {mentor.currentRole && (
                      <p className="text-xs text-(--muted) truncate mt-0.5">{mentor.currentRole}</p>
                    )}
                    {mentor.institutionName && (
                      <p className="text-xs text-(--muted) truncate font-semibold">{mentor.institutionName}</p>
                    )}
                  </div>
                  <div className="ml-auto text-center flex-shrink-0">
                    <p className="text-(--fg) font-black text-lg leading-none">{mentor.matchScore}%</p>
                    <p className="text-[10px] text-(--muted) mt-0.5">Match</p>
                  </div>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col gap-3"
                >
                  <Link
                    href={`/book/${mentor.id}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-(--fg) text-(--bg) transition-all hover:opacity-90 active:scale-97"
                  >
                    <BookOpen className="h-4 w-4" />
                    Book a Session
                  </Link>
                  <Link
                    href={`/mentors/${mentor.id}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-(--fg)/5 border border-(--hairline) text-(--fg) transition-all hover:bg-(--fg)/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                    View Full Profile
                  </Link>
                </motion.div>

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-3 py-2 text-xs text-(--muted) hover:text-(--fg) transition-colors cursor-pointer"
                >
                  Keep discovering mentors
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
