"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { MentorReview } from "@/lib/types";

interface ReviewCardProps {
  review: MentorReview;
  onEdit?: (review: MentorReview) => void;
  canEdit?: boolean;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "Recent Session";
  }
}

export function ReviewCard({ review, onEdit, canEdit = false }: ReviewCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAnonymous = review.anonymous || !review.userName;
  const displayName = isAnonymous ? "Anonymous Mentee" : (review.userName || "Mentee");
  const displayRole = isAnonymous ? "Verified Mentee" : (review.userRole || "Student & Learner");

  const rawFeedback = review.feedback || review.comment || "";
  
  // Clean feedback text (strip leading quotes/stars/numbers/HTML entities)
  const feedbackText = useMemo(() => {
    if (!rawFeedback) return "";
    let cleaned = rawFeedback.trim();
    
    // Replace leading ratings/stars/quotes/escapes
    cleaned = cleaned.replace(/^([★⭐\s\d/*.-]+|&ldquo;|&rdquo;|"|“|”)+/g, "").trim();
    
    // Remove wrapping quotes if they exist
    if (cleaned.startsWith("“") || cleaned.startsWith('"') || cleaned.startsWith("'")) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.endsWith("”") || cleaned.endsWith('"') || cleaned.endsWith("'")) {
      cleaned = cleaned.substring(0, cleaned.length - 1);
    }
    return cleaned.trim();
  }, [rawFeedback]);

  const isLongText = feedbackText.length > 120 || feedbackText.split("\n").length > 3;

  return (
    <>
      <motion.div
        layout="position"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-4 sm:p-5 flex flex-col shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg h-[220px] sm:h-[280px]"
      >
        {/* 1. Rating Stars */}
        <div className="flex gap-0.5 mb-1.5 sm:mb-2 shrink-0">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              size={13}
              className={
                si < review.rating
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "fill-[#E5E7EB] dark:fill-[#27272A] text-[#E5E7EB] dark:text-[#27272A]"
              }
            />
          ))}
        </div>

        {/* 2. Verified Badge */}
        <div className="mb-2.5 sm:mb-3.5 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Verified Session
          </span>
        </div>

        {/* 3. Review Text */}
        <div className="flex-none flex flex-col justify-start overflow-hidden w-full">
          <p className="text-sm leading-relaxed text-[color:var(--fg)]/80 whitespace-pre-line custom-line-clamp">
            {feedbackText || "No feedback text was provided for this session."}
          </p>
          {isLongText && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors mt-2 text-left w-fit cursor-pointer animate-fade-in"
            >
              Read More
            </button>
          )}
        </div>

        {/* 4. Tags (optional) */}
        {review.tags && review.tags.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1.5 mt-2.5 mb-1.5 shrink-0">
            {review.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 5. Spacer */}
        <div className="flex-1" />

        {/* 6. User Footer */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3.5 sm:pt-4 border-t border-[#F3F4F6] dark:border-[#27272A] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {review.userAvatar && !isAnonymous ? (
              <img
                src={review.userAvatar}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover bg-[#F3F4F6] dark:bg-[#27272A]"
                loading="lazy"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{
                  background: isAnonymous ? "var(--fg)/10" : "var(--fg)",
                  color: isAnonymous ? "var(--muted)" : "var(--bg)",
                }}
              >
                {isAnonymous ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  displayName[0]?.toUpperCase()
                )}
              </div>
            )}
            <div className="min-w-0 flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-[var(--fg)] truncate">
                {displayName}
              </p>
              <p className="text-[12px] text-[var(--muted)] truncate">
                {displayRole}
              </p>
            </div>
          </div>

          {/* Edit Action if permitted */}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer shrink-0"
            >
              Edit
            </button>
          )}
        </div>
      </motion.div>

      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setIsModalOpen(false)}
              />
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative z-10 flex flex-col gap-5 text-left max-h-[85vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F3F4F6] dark:hover:bg-[#27272A] text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Rating Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={15}
                      className={
                        si < review.rating
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "fill-[#E5E7EB] dark:fill-[#27272A] text-[#E5E7EB] dark:text-[#27272A]"
                      }
                    />
                  ))}
                </div>

                {/* Verified Badge */}
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified Session
                  </span>
                </div>

                {/* Full Text */}
                <p className="text-sm md:text-base leading-relaxed text-[color:var(--fg)]/90 whitespace-pre-line overflow-y-auto max-h-[45vh] pr-2">
                  {feedbackText}
                </p>

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] text-[var(--muted)] border border-[#E5E7EB]/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* User Profile */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#F3F4F6] dark:border-[#27272A] mt-2">
                  {review.userAvatar && !isAnonymous ? (
                    <img
                      src={review.userAvatar}
                      alt={displayName}
                      className="w-11 h-11 rounded-full object-cover bg-[#F3F4F6] dark:bg-[#27272A]"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                        color: "#FFFFFF",
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[color:var(--fg)] truncate">
                      {displayName}
                    </span>
                    <span className="text-xs text-[color:var(--muted)] font-medium truncate">
                      {displayRole}
                    </span>
                  </div>
                  <span className="ml-auto text-[10px] text-[color:var(--muted)] font-semibold uppercase tracking-wider shrink-0">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
