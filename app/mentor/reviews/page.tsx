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
    let isMounted = true;
    // Fetch current logged in mentor's reviews
    api.get("/mentor/me/stats")
      .then(async (statsRes) => {
        if (!isMounted) return;
        const mentorId = statsRes.data?.mentorId || statsRes.data?.id;
        if (mentorId) {
          const revRes = await api.get(`/reviews/mentor/${mentorId}?limit=50`);
          if (isMounted) {
            setReviews(revRes.data?.reviews ?? []);
          }
        } else {
          // fallback
          const revRes = await api.get("/mentor/me/reviews");
          if (isMounted) {
            setReviews(revRes.data?.reviews ?? []);
          }
        }
      })
      .catch(() => {
        if (!isMounted) return;
        api.get("/mentor/me/reviews")
          .then((res) => {
            if (isMounted) {
              setReviews(res.data?.reviews ?? []);
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Deduplicate reviews by id to prevent duplicate rendering
  const uniqueReviews = useMemo(() => {
    const seen = new Set<string>();
    return reviews.filter((r) => {
      if (!r.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [reviews]);

  // Compute analytics
  const total = uniqueReviews.length;

  const avgRating = useMemo(() => {
    if (total === 0) return "0.0";
    const sum = uniqueReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / total).toFixed(1);
  }, [uniqueReviews, total]);

  const fiveStarPercent = useMemo(() => {
    if (total === 0) return 0;
    const count = uniqueReviews.filter((r) => r.rating === 5).length;
    return Math.round((count / total) * 100);
  }, [uniqueReviews, total]);

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    uniqueReviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    return dist;
  }, [uniqueReviews]);

  const { positiveTags, negativeTags } = useMemo(() => {
    const posCounts: Record<string, number> = {};
    const negCounts: Record<string, number> = {};

    uniqueReviews.forEach((r) => {
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
  }, [uniqueReviews]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-[var()]">
          Mentor Analytics
        </p>
        <h1 className="font-display text-4xl leading-tight">
          Rating & Feedback
        </h1>
        <p className="text-sm text-[var()]">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Avg Rating Card */}
            <div className="rounded-2xl border p-6 flex flex-col gap-2 bg-linear-to-br from-amber-500/5 to-transparent dark:from-amber-500/10 border-amber-500/10 shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all duration-300">
              <div className="flex items-center justify-between text-[var()]">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[var()]/85">Average Rating</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-4.5xl font-black text-[var()]">{avgRating}</span>
                <span className="text-xs text-[var()] font-semibold">out of 5.0</span>
              </div>
            </div>

            {/* Total Reviews Card */}
            <div className="rounded-2xl border p-6 flex flex-col gap-2 bg-linear-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 border-blue-500/10 shadow-xs hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between text-[var()]">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[var()]/85">Total Reviews</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-4.5xl font-black text-[var()]">{total}</span>
                <span className="text-xs text-[var()] font-semibold">completed sessions</span>
              </div>
            </div>

            {/* 5-Star Ratio Card */}
            <div className="rounded-2xl border p-6 flex flex-col gap-2 bg-linear-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10 border-emerald-500/10 shadow-xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between text-[var()]">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[var()]/85">5-Star Ratio</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-4.5xl font-black text-[var()]">{fiveStarPercent}%</span>
                <span className="text-xs text-[var()] font-semibold">5-star ratings</span>
              </div>
            </div>
          </div>

          {/* Rating Breakdown & Tag Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Breakdown */}
            <div className="rounded-2xl border p-6 flex flex-col gap-5 bg-white dark:bg-[#18181B] border-[var()] shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[var()]">
                Rating Distribution
              </h3>

              <div className="flex flex-col gap-3.5 pt-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = distribution[stars] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-4 text-xs">
                      <span className="w-10 font-bold text-[var()] flex items-center justify-end gap-1 shrink-0">
                        {stars} ★
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-[var()]/5 dark:bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background:
                              stars >= 4
                                ? "#10b981" // Emerald
                                : stars === 3
                                ? "#f59e0b" // Amber
                                : "#ef4444", // Red
                          }}
                        />
                      </div>
                      <span className="w-16 text-right font-semibold text-[var()]/80 shrink-0">
                        {pct}% <span className="text-[var()] text-[10px] font-normal">({count})</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tag Insights */}
            <div className="rounded-2xl border p-6 flex flex-col gap-6 bg-white dark:bg-[#18181B] border-[var()] shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[var()]">
                Feedback Highlights
              </h3>

              {/* Positive Highlights */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <div className="p-1 rounded-md bg-emerald-500/10">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  Top Praise
                </div>
                {positiveTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {positiveTags.map(([tag, count]) => (
                      <span
                        key={tag}
                        className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10 font-bold transition-all hover:scale-105"
                      >
                        #{tag} <span className="opacity-60 font-medium ml-1">({count})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[var()] font-medium italic">No positive tags collected yet.</span>
                )}
              </div>

              {/* Areas to Improve */}
              <div className="flex flex-col gap-3 pt-4 border-t border-[var()]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <div className="p-1 rounded-md bg-amber-500/10">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                  Suggestions for Growth
                </div>
                {negativeTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {negativeTags.map(([tag, count]) => (
                      <span
                        key={tag}
                        className="text-xs px-3.5 py-1.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/10 font-bold transition-all hover:scale-105"
                      >
                        #{tag} <span className="opacity-60 font-medium ml-1">({count})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[var()] font-medium italic">No areas to improve logged — keep up the excellent work!</span>
                )}
              </div>
            </div>
          </div>

          {/* Recent Reviews List */}
          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-xs uppercase tracking-[0.22em] text-[var()]">
              Recent Student Reviews
            </h2>

            {uniqueReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {uniqueReviews.map((rev) => (
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
