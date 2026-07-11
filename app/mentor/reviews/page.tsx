"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import type { Review } from "@/lib/types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function MentorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/mentor/me/reviews")
      .then((res) => setReviews(res.data.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Reviews</p>
        <h1 className="font-display text-4xl leading-tight">What students say.</h1>
      </div>

      {/* ─── Summary ─── */}
      <div className="flex items-center gap-6 rounded-2xl bg-(--fg)/[0.02] p-5">
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-4xl">{avg}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${
                  s <= Math.round(Number(avg) || 0) ? "text-amber-500 fill-amber-500" : "text-(--fg)/15"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-sm text-(--muted)">
          {loading ? <Skeleton className="h-4 w-24" /> : `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* ─── Review List ─── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : reviews.length > 0 ? (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-(--fg)/[0.02] p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--fg)/8 text-xs font-medium">
                    {r.user?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-medium">{r.user?.name ?? "Student"}</span>
                </div>
                <span className="text-xs text-(--muted)">{formatDate(r.createdAt)}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${s <= r.rating ? "text-amber-500 fill-amber-500" : "text-(--fg)/15"}`}
                  />
                ))}
              </div>
              {r.comment && (
                <p className="text-sm text-(--fg)/80 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Star className="h-6 w-6" />}
          title="No reviews yet"
          description="Reviews from students will appear here after sessions."
        />
      )}
    </div>
  );
}
