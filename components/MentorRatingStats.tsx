"use client";

import type { MentorRatingStats } from "@/lib/types";

interface MentorRatingStatsProps {
  stats: MentorRatingStats;
  compact?: boolean;
}

export function MentorRatingStatsDisplay({ stats, compact = false }: MentorRatingStatsProps) {
  const avg = Number(stats.avgRating || 0).toFixed(1);
  const total = stats.totalReviews || 0;
  const dist = stats.distribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>{avg}</span>
        </div>
        <span className="text-xs text-[color:var(--muted)]">
          ({total} {total === 1 ? "review" : "reviews"})
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 border flex flex-col md:flex-row items-center gap-6 md:gap-10"
      style={{
        background: "var(--fg)/[0.02]",
        borderColor: "var(--hairline)",
      }}
    >
      {/* Average score block */}
      <div className="flex flex-col items-center justify-center text-center shrink-0 min-w-[140px]">
        <span className="text-5xl font-extrabold tracking-tight text-[color:var(--fg)]">
          {avg}
        </span>
        <div className="flex items-center gap-1 my-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = Math.round(Number(avg)) >= star;
            return (
              <svg
                key={star}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={filled ? "#EAB308" : "none"}
                stroke="#EAB308"
                strokeWidth="1.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            );
          })}
        </div>
        <span className="text-xs font-medium text-[color:var(--muted)]">
          Based on {total} {total === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Vertical divider */}
      <div className="hidden md:block w-[1px] h-32 bg-[color:var(--hairline)]" />

      {/* Rating distribution bars */}
      <div className="flex-1 w-full flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = Number(dist[rating] || dist[String(rating)] || 0);
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={rating} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-medium text-[color:var(--muted)] text-right flex items-center justify-end gap-1">
                {rating}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
              <div
                className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ background: "var(--fg)/0.08" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    background:
                      rating >= 4
                        ? "#22c55e"
                        : rating === 3
                        ? "#eab308"
                        : "#ef4444",
                  }}
                />
              </div>
              <span className="w-10 font-medium text-[color:var(--muted)] text-right">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
