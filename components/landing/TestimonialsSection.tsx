"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ReviewCard } from "@/components/ReviewCard";

interface PublicReview {
  id: string;
  rating: number;
  feedback?: string | null;
  tags?: string[];
  createdAt: string;
  verified: boolean;
  featured: boolean;
  name: string;
  avatar?: string | null;
  role: string;
}

interface PublicStats {
  averageRating: number;
  totalReviews: number;
}

export function TestimonialsSection() {
  const { user } = useAuth();
  const router = useRouter();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [stats, setStats] = useState<PublicStats>({ averageRating: 5.0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/platform-reviews/public")
      .then((res: any) => {
        if (!isMounted) return;
        const fetchedReviews: PublicReview[] = res.data?.reviews || [];
        const fetchedStats: PublicStats = res.data?.stats || { averageRating: 5.0, totalReviews: 0 };

        // Deduplicate reviews by user name / id to ensure one review per user
        const uniqueMap = new Map<string, PublicReview>();
        fetchedReviews.forEach((r) => {
          const key = r.name || r.id;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, r);
          }
        });

        const uniqueReviews = Array.from(uniqueMap.values());
        setReviews(uniqueReviews);
        setStats(fetchedStats);
      })
      .catch((err: any) => {
        console.error("Failed to load platform reviews for landing page", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenReviewModal = () => {
    if (!user) {
      router.push("/signin");
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-platform-review-modal"));
    }
  };

  // Split reviews into two rows for the marquee
  const mid = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, mid);
  const row2 = reviews.slice(mid);

  const row1Repeated = [...row1, ...row1, ...row1];
  const row2Repeated = [...row2, ...row2, ...row2];

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 lg:py-36 bg-[#FAFAFA] dark:bg-[#0E0E10] border-t border-[var(--hairline)] transition-colors duration-300 relative overflow-hidden"
    >
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-14 text-center max-w-2xl mx-auto flex flex-col items-center gap-4"
        >
          {/* Aggregate Rating Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-xs">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  className="fill-amber-500 text-amber-500"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span>{stats.averageRating.toFixed(1)} / 5.0</span>
          </div>

          <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[var(--fg)] leading-[1.1]">
            Loved by mentees across HelpMeMan
          </h2>
          <p className="text-[16px] text-[var(--muted)] leading-relaxed">
            Real feedback submitted by students, developers, and professionals who use HelpMeMan.
          </p>
        </motion.div>
      </div>

      {/* Reviews Display */}
      {reviews.length > 0 ? (
        /* Double-Row Horizontal Marquee for Mobile & Desktop */
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="marquee-container"
        >
          <div className="marquee-row marquee-row--left">
            <div className="marquee-track">
              {row1Repeated.map((t, idx) => {
                const mappedReview: any = {
                  id: t.id,
                  rating: t.rating,
                  feedback: t.feedback,
                  tags: t.tags || [],
                  anonymous: !t.name,
                  createdAt: t.createdAt,
                  userName: t.name,
                  userAvatar: t.avatar,
                  userRole: t.role,
                };
                return (
                  <div key={`r1-${t.id}-${idx}`} className="marquee-card">
                    <ReviewCard review={mappedReview} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="marquee-row marquee-row--right mt-4">
            <div className="marquee-track">
              {row2Repeated.map((t, idx) => {
                const mappedReview: any = {
                  id: t.id,
                  rating: t.rating,
                  feedback: t.feedback,
                  tags: t.tags || [],
                  anonymous: !t.name,
                  createdAt: t.createdAt,
                  userName: t.name,
                  userAvatar: t.avatar,
                  userRole: t.role,
                };
                return (
                  <div key={`r2-${t.id}-${idx}`} className="marquee-card">
                    <ReviewCard review={mappedReview} />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-10 px-6 max-w-md mx-auto">
          <p className="text-sm text-[var(--muted)] mb-4">
            Be the first to leave a platform review for HelpMeMan!
          </p>
        </div>
      )}

      {/* Call to Action Button */}
      <div className="mt-12 flex justify-center px-6">
        <button
          onClick={handleOpenReviewModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 transition-all shadow-md cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Leave a Platform Review</span>
        </button>
      </div>
    </section>
  );
}
