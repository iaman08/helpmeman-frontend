"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  mentorName: string;
  mentorAvatar?: string | null;
  sessionDate: string;
  /** Called after a successful submit so the parent can refresh */
  onSubmitted?: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STAR_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

const POSITIVE_TAGS = [
  "Very Helpful",
  "Friendly",
  "Professional",
  "Knowledgeable",
  "Explained Clearly",
  "Great Communication",
  "Solved My Problem",
  "On Time",
  "Patient",
  "Highly Recommended",
];

const NEGATIVE_TAGS = [
  "Late",
  "Unclear Explanation",
  "Didn't Solve Problem",
  "Communication Issues",
  "Technical Problems",
];

// ── Star component ────────────────────────────────────────────────────────────

function StarIcon({ filled, hovered }: { filled: boolean; hovered: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-full h-full transition-all duration-150 ${
        filled || hovered ? "scale-110 drop-shadow-md" : "scale-100"
      }`}
      style={{ filter: filled || hovered ? "drop-shadow(0 0 6px rgba(234,179,8,0.5))" : "none" }}
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled || hovered ? "#EAB308" : "none"}
        stroke={filled || hovered ? "#EAB308" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={filled || hovered ? "text-yellow-400" : "text-[color:var(--muted)]"}
      />
    </svg>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export function RatingModal({
  isOpen,
  onClose,
  bookingId,
  mentorName,
  mentorAvatar,
  sessionDate,
  onSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredStar(0);
      setFeedback("");
      setSelectedTags([]);
      setAnonymous(false);
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [isOpen]);

  // Trap scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // When rating drops to ≤3, remove any positive-only tags that were selected
  useEffect(() => {
    if (rating > 3) {
      // Remove negative tags if rating goes positive again
      setSelectedTags((prev) => prev.filter((t) => !NEGATIVE_TAGS.includes(t)));
    } else if (rating > 0 && rating <= 3) {
      // Remove positive tags if rating goes negative
      setSelectedTags((prev) => prev.filter((t) => !POSITIVE_TAGS.includes(t)));
    }
  }, [rating]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast("Please select a star rating before submitting.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        bookingId,
        rating,
        feedback: feedback.trim() || null,
        tags: selectedTags,
        anonymous,
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Failed to submit review. Please try again.";
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const displayStar = hoveredStar || rating;
  const availableTags = rating > 0 && rating <= 3 ? NEGATIVE_TAGS : POSITIVE_TAGS;

  return (
    <>
      {/* Styles */}
      <style>{`
        @keyframes rating-modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }
        @keyframes rating-success-in {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes rating-check-draw {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        .rating-modal-panel { animation: rating-modal-in 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .rating-success-anim { animation: rating-success-in 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .rating-check { stroke-dasharray: 60; animation: rating-check-draw 0.5s ease 0.35s both; }
        .rating-star-btn:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; border-radius: 4px; }
        .rating-tag-chip { transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s; }
        .rating-tag-chip:hover { transform: translateY(-1px); }
        .rating-tag-chip.selected { transform: translateY(-1px); }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Rate your session"
      >
        <div
          className="rating-modal-panel relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--hairline)",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[color:var(--fg)]/10 text-[color:var(--muted)]"
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* ── SUCCESS STATE ── */}
          {submitted ? (
            <div className="rating-success-anim flex flex-col items-center justify-center text-center px-8 py-14 gap-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.3)" }}
              >
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none">
                  <path
                    className="rating-check"
                    d="M10 24l10 10 18-20"
                    stroke="#22c55e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-[color:var(--fg)]">Thank you for your feedback!</h2>
                <p className="text-sm text-[color:var(--muted)] leading-relaxed max-w-xs mx-auto">
                  We appreciate your feedback. It helps mentors improve and helps other users make informed decisions.
                </p>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill={s <= rating ? "#EAB308" : "none"}
                      stroke="#EAB308"
                      strokeWidth="1.5"
                    />
                  </svg>
                ))}
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
                style={{ background: "var(--fg)", color: "var(--bg)" }}
              >
                Done
              </button>
            </div>
          ) : (
            /* ── RATING FORM ── */
            <div className="flex flex-col gap-0">
              {/* Header */}
              <div
                className="flex flex-col items-center text-center px-6 pt-8 pb-6 gap-3"
                style={{ borderBottom: "1px solid var(--hairline)" }}
              >
                {/* Mentor avatar */}
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold shadow-md"
                  style={{ background: "var(--fg)/8" }}
                >
                  {mentorAvatar ? (
                    <img src={mentorAvatar} alt={mentorName} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-xl font-bold"
                      style={{ background: "var(--fg)", color: "var(--bg)", opacity: 0.1 }}
                    >
                      {mentorName[0]?.toUpperCase() ?? "M"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[color:var(--muted)] mb-1">
                    How was your session with
                  </p>
                  <h2 className="text-lg font-bold text-[color:var(--fg)]">{mentorName}</h2>
                  <p className="text-xs text-[color:var(--muted)] mt-0.5">{sessionDate}</p>
                </div>
              </div>

              <div className="px-6 py-5 flex flex-col gap-5">
                {/* Stars */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2" role="group" aria-label="Rating stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="rating-star-btn w-11 h-11 cursor-pointer"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star > 1 ? "s" : ""} — ${STAR_LABELS[star]}`}
                        aria-pressed={rating >= star}
                      >
                        <StarIcon filled={rating >= star} hovered={hoveredStar >= star} />
                      </button>
                    ))}
                  </div>
                  <p
                    className="text-sm font-semibold h-5 transition-all duration-200"
                    style={{ color: displayStar ? "#EAB308" : "var(--muted)" }}
                  >
                    {displayStar ? STAR_LABELS[displayStar] : "Select a rating"}
                  </p>
                </div>

                {/* Quick Tags */}
                {rating > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted)]">
                      {rating <= 3 ? "What went wrong?" : "What stood out?"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`rating-tag-chip text-xs px-3 py-1.5 rounded-full border font-medium cursor-pointer ${
                              isSelected ? "selected" : ""
                            }`}
                            style={
                              isSelected
                                ? {
                                    background: "var(--fg)",
                                    color: "var(--bg)",
                                    borderColor: "var(--fg)",
                                  }
                                : {
                                    background: "transparent",
                                    color: "var(--muted)",
                                    borderColor: "var(--hairline)",
                                  }
                            }
                            aria-pressed={isSelected}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feedback textarea */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="review-feedback"
                    className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted)]"
                  >
                    Feedback <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="review-feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                      placeholder="Tell us what went well or what could be improved..."
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-sm resize-none transition-colors"
                      style={{
                        background: "var(--fg)/[0.04]",
                        border: "1px solid var(--hairline)",
                        color: "var(--fg)",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--fg)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px var(--fg)/10";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "var(--hairline)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <span
                      className="absolute bottom-2.5 right-3 text-[10px] select-none"
                      style={{ color: feedback.length > 480 ? "#ef4444" : "var(--muted)" }}
                    >
                      {feedback.length} / 500
                    </span>
                  </div>
                </div>

                {/* Anonymous checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="sr-only"
                      id="anon-checkbox"
                    />
                    <div
                      className="w-5 h-5 rounded-md border flex items-center justify-center transition-colors"
                      style={{
                        background: anonymous ? "var(--fg)" : "transparent",
                        borderColor: anonymous ? "var(--fg)" : "var(--hairline)",
                      }}
                      onClick={() => setAnonymous((p) => !p)}
                    >
                      {anonymous && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[color:var(--fg)]">
                      Send this feedback anonymously
                    </span>
                    <span className="text-xs text-[color:var(--muted)]">
                      Your rating will still count, but your identity won&apos;t be shared with the mentor.
                    </span>
                  </div>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      background: "var(--fg)/[0.06]",
                      color: "var(--muted)",
                    }}
                  >
                    Skip for Now
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    className="flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: rating > 0 ? "var(--fg)" : "var(--fg)/50",
                      color: "var(--bg)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25" />
                          <path d="M21 12a9 9 0 00-9-9" />
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
