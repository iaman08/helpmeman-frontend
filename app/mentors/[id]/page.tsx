"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, Clock, MapPin, Briefcase, ExternalLink, MessageCircle, Share2, Globe, Languages, Zap, Award } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
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
            {/* Top Region Styled like Screenshot */}
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 pb-6 border-b border-(--hairline)">
              {mentor.avatar ? (
                <img
                  src={mentor.avatar}
                  alt={mentor.displayName}
                  className="h-28 w-28 rounded-2xl object-cover shrink-0 border border-(--hairline) shadow-md"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-(--fg)/8 text-2xl font-semibold shrink-0 border border-(--hairline)">
                  {initials}
                </div>
              )}
              
              <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                {mentor.rating >= 4.8 && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-semibold border border-emerald-500/20 w-fit">
                    <Award className="h-3.5 w-3.5" />
                    Top Mentor
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl sm:text-4xl leading-tight font-bold tracking-tight">
                    {mentor.displayName}
                  </h1>
                  {mentor.isOnline ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-0.5 text-xs font-bold border border-green-500/20 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-(--muted)/10 text-(--muted) px-2.5 py-0.5 text-xs font-bold border border-(--hairline) shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-(--muted)" />
                      Offline
                    </span>
                  )}
                </div>
                
                {mentor.currentRole && (
                  <p className="text-lg font-medium text-emerald-700 dark:text-emerald-400">
                    {mentor.currentRole} {mentor.company ? `@ ${mentor.company}` : ""}
                  </p>
                )}

                {/* Quick actions block */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsShareOpen(true)}
                    className="flex items-center gap-1.5 rounded-full border border-(--hairline) px-4 py-1.5 text-xs font-bold hover:bg-(--fg)/5 transition-colors cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Save
                  </button>
                  
                  <Link
                    href={`/dashboard/chat?mentorId=${mentor.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-(--fg)/5 border border-(--hairline) px-4 py-1.5 text-xs font-bold hover:bg-(--fg)/10 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Message
                  </Link>

                  {mentor.linkedinUrl && (
                    <a
                      href={mentor.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/20 hover:bg-[#0a66c2]/20 text-[#0a66c2] transition-colors"
                      title="LinkedIn profile"
                    >
                      <FaLinkedin className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm mt-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold">
                    {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
                  </span>
                  <a href="#reviews" className="text-(--muted) hover:underline text-xs">
                    ({mentor.reviews?.length ?? 0} reviews)
                  </a>
                </div>
              </div>
            </div>

            {/* Tagline snippet and key details (Location, Speaks, Active status, Response time) */}
            <div className="flex flex-col gap-6">
              <p className="text-lg text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed font-display italic">
                {(() => {
                  const parts = [];
                  if (mentor.rating >= 4.8) parts.push("Top Mentor");
                  if (mentor.experienceYears) parts.push(`${mentor.experienceYears}+ Years in Code`);
                  if (mentor.expertise && mentor.expertise.length > 0) parts.push(...mentor.expertise.slice(0, 5));
                  return parts.join(" | ");
                })()}
              </p>

              {/* Metadata Details Card (Fiverr Style) */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 border border-(--hairline)/50 rounded-2xl p-6 bg-(--fg)/[0.01] shadow-sm">
                <div>
                  <div className="text-xs text-(--muted) uppercase tracking-wider font-semibold">From</div>
                  <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.location || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-(--muted) uppercase tracking-wider font-semibold">Member since</div>
                  <div className="text-sm font-bold mt-1 text-(--fg)">
                    {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recent"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-(--muted) uppercase tracking-wider font-semibold">Avg. response time</div>
                  <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.averageResponseTime || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-xs text-(--muted) uppercase tracking-wider font-semibold">Last active</div>
                  <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.activeStatus || "Not specified"}</div>
                </div>
                <div className="col-span-2 border-t border-(--hairline)/30 pt-4 mt-1">
                  <div className="text-xs text-(--muted) uppercase tracking-wider font-semibold">Languages</div>
                  <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.languages || "English"}</div>
                </div>
              </div>
            </div>

            {/* Quick stats fallback (Duration / Sessions) */}
            <div className="flex flex-wrap gap-6 text-sm py-2 border-b border-(--hairline)">
              <div className="flex items-center gap-2 text-(--muted)">
                <Clock className="h-4 w-4" />
                {mentor.sessionDuration} min sessions
              </div>
              <div className="flex items-center gap-2 text-(--muted)">
                <Briefcase className="h-4 w-4" />
                {mentor.totalSessions} sessions completed
              </div>
            </div>

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
            <div id="reviews" className="mt-4 scroll-mt-24">
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
