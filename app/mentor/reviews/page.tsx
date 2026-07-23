"use client";

import { useEffect, useState, useMemo } from "react";
import { Star, TrendingUp, ThumbsUp, AlertCircle, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ReviewCard } from "@/components/ReviewCard";
import type { MentorReview } from "@/lib/types";

export default function MentorReviewsAnalyticsPage() {
  const [reviews, setReviews] = useState<MentorReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current logged in mentor's reviews
    api.get("/mentor/me/stats")
      .then(async (statsRes) => {
        const mentorId = statsRes.data?.mentorId || statsRes.data?.id;
        if (mentorId) {
          const revRes = await api.get(`/reviews/mentor/${mentorId}?limit=50`);
          setReviews(revRes.data?.reviews ?? []);
        } else {
          // fallback
          const revRes = await api.get("/mentor/me/reviews");
          setReviews(revRes.data?.reviews ?? []);
        }
      })
      .catch(() => {
        api.get("/mentor/me/reviews")
          .then((res) => setReviews(res.data?.reviews ?? []))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute analytics
  const total = reviews.length;

  const avgRating = useMemo(() => {
    if (total === 0) return "0.0";
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / total).toFixed(1);
  }, [reviews, total]);

  const fiveStarPercent = useMemo(() => {
    if (total === 0) return 0;
    const count = reviews.filter((r) => r.rating === 5).length;
    return Math.round((count / total) * 100);
  }, [reviews, total]);

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    return dist;
  }, [reviews]);

  const { positiveTags, negativeTags } = useMemo(() => {
    const posCounts: Record<string, number> = {};
    const negCounts: Record<string, number> = {};

    reviews.forEach((r) => {
      if (r.tags && Array.isArray(r.tags)) {
        r.tags.forEach((tag) => {
          if (r.rating > 3) {
            posCounts[tag] = (posCounts[tag] || 0) + 1;
          } else {
            negCounts[tag] = (negCounts[tag] || 0) + 1;
          }
        });
      }
    });

    const posSorted = Object.entries(posCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const negSorted = Object.entries(negCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return { positiveTags: posSorted, negativeTags: negSorted };
  }, [reviews]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Mentor Analytics
        </p>
        <h1 className="font-display text-4xl leading-tight">
          Rating & Feedback
        </h1>
        <p className="text-sm text-(--muted)">
          Insights and reviews from your completed mentorship sessions.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Avg Rating Card */}
            <div className="rounded-2xl border p-5 flex flex-col gap-2 bg-(--fg)/[0.02] border-(--hairline)">
              <div className="flex items-center justify-between text-(--muted)">
                <span className="text-xs uppercase tracking-widest font-semibold">Average Rating</span>
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl">{avgRating}</span>
                <span className="text-xs text-(--muted)">out of 5.0</span>
              </div>
            </div>

            {/* Total Reviews Card */}
            <div className="rounded-2xl border p-5 flex flex-col gap-2 bg-(--fg)/[0.02] border-(--hairline)">
              <div className="flex items-center justify-between text-(--muted)">
                <span className="text-xs uppercase tracking-widest font-semibold">Total Reviews</span>
                <MessageSquare className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl">{total}</span>
                <span className="text-xs text-(--muted)">completed sessions</span>
              </div>
            </div>

            {/* 5-Star Ratio Card */}
            <div className="rounded-2xl border p-5 flex flex-col gap-2 bg-(--fg)/[0.02] border-(--hairline)">
              <div className="flex items-center justify-between text-(--muted)">
                <span className="text-xs uppercase tracking-widest font-semibold">5-Star Ratio</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-4xl">{fiveStarPercent}%</span>
                <span className="text-xs text-(--muted)">5-star reviews</span>
              </div>
            </div>
          </div>

          {/* Rating Breakdown & Tag Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Breakdown */}
            <div className="rounded-2xl border p-6 flex flex-col gap-4 bg-(--fg)/[0.02] border-(--hairline)">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-(--muted)">
                Rating Breakdown
              </h3>

              <div className="flex flex-col gap-3 pt-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = distribution[stars] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <span className="w-8 font-medium text-(--muted) flex items-center justify-end gap-1">
                        {stars} ★
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-(--fg)/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background:
                              stars >= 4
                                ? "#22c55e"
                                : stars === 3
                                ? "#eab308"
                                : "#ef4444",
                          }}
                        />
                      </div>
                      <span className="w-12 text-right font-medium text-(--muted)">
                        {pct}% ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tag Insights */}
            <div className="rounded-2xl border p-6 flex flex-col gap-5 bg-(--fg)/[0.02] border-(--hairline)">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-(--muted)">
                Feedback Tag Highlights
              </h3>

              {/* Positive Highlights */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Top Praise
                </div>
                {positiveTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {positiveTags.map(([tag, count]) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-700 border border-green-500/20 font-medium"
                      >
                        {tag} <span className="opacity-70 font-normal">({count})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-(--muted)">No positive tags collected yet.</span>
                )}
              </div>

              {/* Areas to Improve */}
              <div className="flex flex-col gap-2 pt-2 border-t border-(--hairline)">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Areas to Improve
                </div>
                {negativeTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {negativeTags.map(([tag, count]) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-medium"
                      >
                        {tag} <span className="opacity-70 font-normal">({count})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-(--muted)">No critical tags logged — great job!</span>
                )}
              </div>
            </div>
          </div>

          {/* Recent Reviews List */}
          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
              Recent Student Reviews
            </h2>

            {reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Star className="h-6 w-6" />}
                title="No reviews yet"
                description="Reviews will automatically appear here once students complete session ratings."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
