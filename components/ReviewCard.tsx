"use client";

import { CheckCircle } from "lucide-react";
import type { MentorReview } from "@/lib/types";

interface ReviewCardProps {
  review: MentorReview;
  onEdit?: (review: MentorReview) => void;
  canEdit?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewCard({ review, onEdit, canEdit = false }: ReviewCardProps) {
  const isAnonymous = review.anonymous || !review.userName;
  const displayName = isAnonymous ? "Anonymous Mentee" : (review.userName || "Mentee");

  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-3.5 transition-all hover:border-[color:var(--fg)]/20"
      style={{
        background: "var(--fg)/[0.02]",
        borderColor: "var(--hairline)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-xs"
            style={{
              background: isAnonymous ? "var(--fg)/10" : "var(--fg)",
              color: isAnonymous ? "var(--muted)" : "var(--bg)",
            }}
          >
            {!isAnonymous && review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : isAnonymous ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ) : (
              displayName[0]?.toUpperCase()
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[color:var(--fg)]">
                {displayName}
              </span>
              {/* Verified Session badge */}
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  color: "#16a34a",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
                title="Verified Completed Session"
              >
                <CheckCircle className="w-3 h-3" />
                Verified Session
              </span>
            </div>
            <span className="text-xs text-[color:var(--muted)]">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-xs font-bold text-yellow-600">{review.rating}.0</span>
        </div>
      </div>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
              style={{
                background: "var(--fg)/[0.04]",
                borderColor: "var(--hairline)",
                color: "var(--fg)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Feedback Text */}
      {review.feedback && (
        <p className="text-sm leading-relaxed text-[color:var(--fg)]/80 whitespace-pre-line">
          {review.feedback}
        </p>
      )}

      {/* Edit action if permitted */}
      {canEdit && onEdit && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onEdit(review)}
            className="text-xs font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] transition-colors"
          >
            Edit review
          </button>
        </div>
      )}
    </div>
  );
}
