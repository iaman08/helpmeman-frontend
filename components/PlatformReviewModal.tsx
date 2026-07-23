"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, X, Heart, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

export interface PlatformReviewData {
  id?: string;
  rating: number;
  feedback?: string | null;
  tags?: string[];
  anonymous?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PlatformReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingReview?: PlatformReviewData | null;
  onReviewSubmitted?: (review: PlatformReviewData) => void;
  onReviewDeleted?: () => void;
}

const EMOJIS = [
  { level: 1, symbol: "😡", label: "Terrible" },
  { level: 2, symbol: "🙁", label: "Poor" },
  { level: 3, symbol: "😐", label: "Okay" },
  { level: 4, symbol: "🙂", label: "Good" },
  { level: 5, symbol: "😍", label: "Great" },
];

const POSITIVE_CHIPS = [
  "Easy to Use",
  "Helpful Mentors",
  "Clean UI",
  "Fast Support",
  "Great Experience",
  "Saved Me Time",
  "Easy Booking",
  "Would Recommend",
];

const NEGATIVE_CHIPS = [
  "Bugs",
  "Slow",
  "Difficult Navigation",
  "Missing Features",
  "Poor Experience",
];

export function PlatformReviewModal({
  isOpen,
  onClose,
  existingReview = null,
  onReviewSubmitted,
}: PlatformReviewModalProps) {
  const { toast } = useToast();
  
  // Step 1: Emoji Feedback | Step 2: Rate HelpMeMan! (Stars & Detailed Review)
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dismissLoading, setDismissLoading] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  // Sync state when modal opens or existing review changes
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating || 5);
        setSelectedEmoji(existingReview.rating || 5);
        setFeedback(existingReview.feedback || "");
        setSelectedTags(existingReview.tags || []);
        setStep(2);
      } else {
        setStep(1);
        setSelectedEmoji(null);
        setRating(0);
        setFeedback("");
        setSelectedTags([]);
      }
      setSubmittedSuccess(false);
    }
  }, [isOpen, existingReview]);

  const effectiveRating = hoverRating || rating || selectedEmoji || 0;
  const currentChipList = effectiveRating > 0 && effectiveRating <= 3 ? NEGATIVE_CHIPS : POSITIVE_CHIPS;

  const handleSelectEmoji = (level: number) => {
    setSelectedEmoji(level);
    setRating(level);
  };

  // Step 1 Submit -> Advance to Step 2 (Rate HelpMeMan!)
  const handleStep1Submit = () => {
    if (!selectedEmoji) {
      toast("Please select an emoji rating first", "error");
      return;
    }
    setStep(2);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Step 2 Submit Review -> Save -> Show Success -> Automatically Hide
  const handleSubmitReview = async () => {
    const finalRating = rating || selectedEmoji || 0;
    if (finalRating === 0) {
      toast("Please select stars to complete your rating", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/platform-reviews", {
        rating: finalRating,
        feedback,
        tags: selectedTags,
        anonymous: false,
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("helpmeman_review_prompt_session", "true");
      }

      setSubmittedSuccess(true);
      toast(existingReview ? "Review updated!" : "Thank you for rating HelpMeMan!", "success");

      if (onReviewSubmitted && res.data?.review) {
        onReviewSubmitted(res.data.review);
      }

      // Automatically hide/close modal after displaying success screen
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error("Failed to submit review", err);
      toast(err?.response?.data?.error || "Failed to submit review. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (action: "maybe_later" | "no_thanks") => {
    setDismissLoading(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("helpmeman_review_prompt_session", "true");
    }
    try {
      await api.post("/platform-reviews/dismiss", { action });
      onClose();
    } catch (err) {
      console.error("Failed to dismiss prompt", err);
      onClose();
    } finally {
      setDismissLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.05 }}
          className="relative w-full max-w-md bg-[color:var(--bg)] text-[color:var(--fg)] border border-[color:var(--hairline)] rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={() => onClose()}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[color:var(--fg)]/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {submittedSuccess ? (
            /* ── STEP 3: Thank You Success Screen ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20"
                >
                  <Heart className="w-8 h-8 fill-emerald-500 text-emerald-500 animate-pulse" />
                </motion.div>
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="font-display text-2xl font-bold text-[color:var(--fg)]">
                  Thank You!
                </h3>
                <p className="text-xs text-[color:var(--muted)] max-w-xs leading-relaxed">
                  Your feedback helps us make HelpMeMan better for everyone.
                </p>
              </div>
            </motion.div>
          ) : step === 1 ? (
            /* ── STEP 1: Share Your Feedback (Emoji Selection) ── */
            <div className="flex flex-col gap-6">
              {/* Title & Subtitle */}
              <div className="flex flex-col gap-1 pr-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--fg)]">
                  Share your feedback
                </h2>
                <p className="text-xs sm:text-sm text-[color:var(--muted)]">
                  How was using HelpMeMan today?
                </p>
              </div>

              {/* 5 Emoji Circle Buttons */}
              <div className="flex items-center justify-between px-2 py-3 bg-[color:var(--fg)]/[0.02] border border-[color:var(--hairline)] rounded-2xl">
                {EMOJIS.map((emoji) => {
                  const isSelected = selectedEmoji === emoji.level;
                  return (
                    <button
                      key={emoji.level}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji.level)}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full text-2xl transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/15 border-2 border-indigo-600 shadow-md scale-110"
                          : "bg-[color:var(--fg)]/[0.04] border border-[color:var(--hairline)] hover:bg-[color:var(--fg)]/[0.08] hover:scale-105"
                      }`}
                      title={emoji.label}
                    >
                      <span className="select-none">{emoji.symbol}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step 1 Actions: Cancel vs Submit */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={dismissLoading}
                  onClick={() => handleDismiss("maybe_later")}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border border-[color:var(--hairline)] text-[color:var(--fg)] bg-transparent hover:bg-[color:var(--fg)]/5 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStep1Submit}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md cursor-pointer text-center"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            /* ── STEP 2: Rate HelpMeMan! (Stars & Optional Feedback) ── */
            <div className="flex flex-col gap-5">
              {/* Back & Header */}
              <div className="flex flex-col gap-1 pr-6">
                {!existingReview && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-[11px] text-[color:var(--muted)] hover:text-[color:var(--fg)] w-fit mb-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                )}
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[color:var(--fg)]">
                  Rate HelpMeMan!
                </h2>
                <p className="text-xs text-[color:var(--muted)] leading-relaxed">
                  Help us improve our tool to best suit your needs by rating us here!
                </p>
              </div>

              {/* 5 Interactive Stars */}
              <div className="flex items-center justify-center gap-2 py-4 bg-[color:var(--fg)]/[0.02] border border-[color:var(--hairline)] rounded-2xl">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hoverRating || rating || selectedEmoji || 0);
                  return (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(star);
                        setSelectedEmoji(star);
                      }}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors duration-200 ${
                          active
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : "fill-transparent text-[color:var(--muted)]/40 hover:text-[color:var(--muted)]"
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>

              {/* Quick Feedback Tags */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                  Quick tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentChipList.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[color:var(--fg)] text-[color:var(--bg)] border-[color:var(--fg)]"
                            : "bg-[color:var(--fg)]/[0.03] text-[color:var(--fg)] border-[color:var(--hairline)] hover:bg-[color:var(--fg)]/[0.07]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Textarea with Character Counter */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                    Feedback <span className="font-normal lowercase text-[color:var(--muted)]/70">(optional)</span>
                  </label>
                  <span className="text-[10px] text-[color:var(--muted)]">
                    {feedback.length} / 500
                  </span>
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                  placeholder="What do you like? What could we improve?"
                  rows={2}
                  className="w-full rounded-xl bg-[color:var(--fg)]/[0.03] border border-[color:var(--hairline)] p-2.5 text-xs text-[color:var(--fg)] placeholder:text-[color:var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--fg)]/20 transition-all resize-none"
                />
              </div>

              {/* Step 2 Actions */}
              <div className="flex flex-col gap-2 pt-1 border-t border-[color:var(--hairline)]">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold border border-[color:var(--hairline)] text-[color:var(--fg)] bg-transparent hover:bg-[color:var(--fg)]/5 transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmitReview}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
