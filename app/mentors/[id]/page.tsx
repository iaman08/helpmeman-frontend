"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, Clock, MapPin, Briefcase, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { useMentor, useMentorReviews } from "@/lib/hooks";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect } from "react";
import { ShareProfileModal } from "@/components/ShareProfileModal";

function formatPrice(paise: number): string {
  return `₹${Math.round(paise / 100)}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-amber-500 fill-amber-500"
              : "text-(--fg)/15"
          }`}
        />
      ))}
    </div>
  );
}

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useMentor(id);
  const [reviewPage, setReviewPage] = useState(1);
  const { data: reviewData, isLoading: reviewsLoading } = useMentorReviews(
    id,
    reviewPage,
  );
  
  const [isShareOpen, setIsShareOpen] = useState(false);

  const mentor = data?.mentor;

  // Auto-open share modal if ?share=true query param is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("share") === "true") {
        setIsShareOpen(true);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-(--bg)/70">
          <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-10 py-5">
            <Link href="/" className="font-display text-2xl tracking-tight">
              HelpMeMan<span className="text-(--muted)">.</span>
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-28 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center gap-5">
                <Skeleton circle className="h-20 w-20" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <EmptyState
          title="Mentor not found"
          description="This mentor may no longer be available."
          action={
            <Link
              href="/mentors"
              className="rounded-full bg-(--accent) text-(--accent-fg) px-6 py-3 text-sm"
            >
              Browse mentors
            </Link>
          }
        />
      </div>
    );
  }

  const initials = mentor.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen">
      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-(--bg)/70">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-10 py-5">
          <Link href="/" className="font-display text-2xl tracking-tight">
            HelpMeMan<span className="text-(--muted)">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/mentors"
              className="text-sm text-(--fg)/80 hover:text-(--fg) transition-colors"
            >
              ← All Mentors
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ─── Left: Profile Details ─── */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Avatar + Name */}
            <div className="flex items-center gap-5">
              {mentor.avatar ? (
                <img
                  src={mentor.avatar}
                  alt={mentor.displayName}
                  className="h-20 w-20 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--fg)/8 text-xl font-medium shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <h1 className="font-display text-3xl leading-tight">
                  {mentor.displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <InstitutionBadge
                    institutionName={mentor.institutionName}
                    institutionType={mentor.institutionType}
                  />
                  {mentor.category && (
                    <span className="rounded-full bg-(--fg)/5 px-3 py-1 text-[11px] text-(--fg)/70">
                      {mentor.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-medium">
                  {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
                </span>
                <span className="text-(--muted)">
                  ({mentor.reviews?.length ?? 0} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 text-(--muted)">
                <Clock className="h-4 w-4" />
                {mentor.sessionDuration} min sessions
              </div>
              <div className="flex items-center gap-2 text-(--muted)">
                <Briefcase className="h-4 w-4" />
                {mentor.totalSessions} sessions done
              </div>
            </div>

            {/* Current role */}
            {(mentor.currentRole || mentor.company) && (
              <div className="flex items-center gap-2 text-sm text-(--muted)">
                <MapPin className="h-4 w-4" />
                {mentor.currentRole}
                {mentor.company ? ` at ${mentor.company}` : ""}
              </div>
            )}

            {/* Bio */}
            <div>
              <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-3">
                About
              </h2>
              <p className="text-base text-(--fg)/85 leading-relaxed whitespace-pre-line">
                {mentor.bio}
              </p>
            </div>

            {/* Expertise */}
            {mentor.expertise.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-3">
                  Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-(--fg)/5 px-3 py-1.5 text-sm text-(--fg)/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* LinkedIn */}
            {mentor.linkedinUrl && (
              <a
                href={mentor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-(--muted) hover:text-(--fg) transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                LinkedIn Profile
              </a>
            )}

            {/* ─── Reviews Section ─── */}
            <div className="mt-4">
              <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-5">
                Reviews
              </h2>

              {reviewsLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-2 py-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviewData && reviewData.reviews.length > 0 ? (
                <div className="flex flex-col divide-y divide-(--hairline)">
                  {reviewData.reviews.map((review) => (
                    <div key={review.id} className="py-5 first:pt-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--fg)/8 text-xs font-medium">
                            {review.user?.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-sm font-medium">
                            {review.user?.name ?? "Anonymous"}
                          </span>
                        </div>
                        <span className="text-xs text-(--muted)">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                      {review.comment && (
                        <p className="text-sm text-(--fg)/80 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-(--muted)">No reviews yet.</p>
              )}

              {/* Review Pagination */}
              {reviewData && reviewData.totalPages > 1 && (
                <div className="flex items-center gap-2 mt-4">
                  {Array.from(
                    { length: reviewData.totalPages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setReviewPage(p)}
                      className={`h-8 w-8 rounded-full text-xs cursor-pointer ${
                        reviewData.page === p
                          ? "bg-(--accent) text-(--accent-fg)"
                          : "bg-(--fg)/5 hover:bg-(--fg)/8"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: Booking Card ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl">
                  {formatPrice(mentor.pricePerSession)}
                </span>
                <span className="text-xs text-(--muted)">
                  / {mentor.sessionDuration} min
                </span>
              </div>

              <div
                aria-hidden
                className="h-px w-full"
                style={{ background: "var(--hairline)" }}
              />

              <ul className="flex flex-col gap-3 text-sm text-(--fg)/80">
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-(--fg)" />
                  1-on-1 video call
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-(--fg)" />
                  Google Meet link
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-(--fg)" />
                  Notes & follow-up
                </li>
              </ul>

              <Link
                href={`/book/${mentor.id}`}
                className="text-center rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3.5 text-sm hover:opacity-90 transition-opacity"
              >
                Book a session
              </Link>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full bg-(--fg)/5 px-7 py-3.5 text-sm hover:bg-(--fg)/8 transition-colors cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                Chat first
              </button>

              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex items-center justify-center gap-2 rounded-full border border-(--hairline) px-7 py-3.5 text-sm hover:bg-(--fg)/5 transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                Share profile
              </button>
            </div>
          </div>
        </div>
      </main>

      {mentor && (
        <ShareProfileModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          mentor={mentor}
        />
      )}
    </div>
  );
}
