"use client";

import { useEffect, useState } from "react";
import { Star, Heart, MessageSquarePlus, Edit3 } from "lucide-react";
import api from "@/lib/api";
import type { PlatformReviewData } from "@/components/PlatformReviewModal";

export function MenteePlatformReviewCard() {
  const [review, setReview] = useState<PlatformReviewData | null>(null);
  const [reviewed, setReviewed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReviewState = () => {
    setLoading(true);
    api
      .get("/platform-reviews/my")
      .then((res) => {
        setReviewed(Boolean(res.data?.platformReviewSubmitted));
        setReview(res.data?.review || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviewState();
  }, []);

  const handleOpenModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-platform-review-modal"));
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-5 border border-[color:var(--hairline)] bg-[color:var(--fg)]/[0.02] animate-pulse h-20" />
    );
  }

  // Hide card completely if user has already submitted a review
  if (reviewed) return null;

  return (
    <div className="rounded-2xl p-5 border border-[color:var(--hairline)] bg-[color:var(--fg)]/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
          <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold text-sm text-[color:var(--fg)] flex items-center gap-2">
            <span>Love using HelpMeMan?</span>
          </h3>
          <p className="text-xs text-[color:var(--muted)]">
            Share your experience and help improve the platform for everyone.
          </p>
        </div>
      </div>
      <button
        onClick={handleOpenModal}
        className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-[color:var(--fg)] text-[color:var(--bg)] hover:opacity-90 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <MessageSquarePlus className="w-3.5 h-3.5" />
        <span>Leave a Review</span>
      </button>
    </div>
  );
}
