"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star, ShieldCheck, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

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

  const renderReviewCard = (t: PublicReview, keySuffix: string = "") => (
    <div
      key={`${t.id}${keySuffix}`}
      className="bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-6 flex flex-col shadow-sm transition-all hover:border-[var(--fg)]/30"
    >
      {/* Rating & Verified Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              size={13}
              className={
                si < t.rating
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "fill-[#E5E7EB] dark:fill-[#27272A] text-[#E5E7EB] dark:text-[#27272A]"
              }
            />
          ))}
        </div>
        {t.verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" /> Verified User
          </span>
        )}
      </div>

      {/* Feedback Quote */}
      <p className="text-[14px] leading-[1.7] text-[#374151] dark:text-[#D1D5DB] flex-1">
        &ldquo;{t.feedback || "HelpMeMan is a game-changer for finding authentic 1-on-1 guidance."}&rdquo;
      </p>

      {/* Tags */}
      {t.tags && t.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {t.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Info */}
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#F3F4F6] dark:border-[#27272A]">
        {t.avatar ? (
          <img
            src={t.avatar}
            alt={t.name}
            className="w-10 h-10 rounded-full object-cover bg-[#F3F4F6] dark:bg-[#27272A]"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-bold text-xs flex items-center justify-center">
            {t.name ? t.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--fg)] truncate">
            {t.name}
          </p>
          <p className="text-[12px] text-[var(--muted)] truncate">{t.role}</p>
        </div>
      </div>
    </div>
  );

  // Marquee rows for 6+ reviews
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
                <Star key={i} size={13} className="fill-amber-500 text-amber-500" />
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
      {reviews.length >= 6 ? (
        /* Double-Row Marquee for 6+ reviews */
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="marquee-container"
        >
          <div className="marquee-row marquee-row--left">
            <div className="marquee-track">
              {row1Repeated.map((t, idx) => renderReviewCard(t, `-r1-${idx}`))}
            </div>
          </div>
          <div className="marquee-row marquee-row--right mt-4">
            <div className="marquee-track">
              {row2Repeated.map((t, idx) => renderReviewCard(t, `-r2-${idx}`))}
            </div>
          </div>
        </motion.div>
      ) : reviews.length > 0 ? (
        /* Clean Non-Repeating Grid Layout for 1 to 5 reviews */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-[1100px] mx-auto px-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {reviews.map((t) => renderReviewCard(t, "-grid"))}
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
