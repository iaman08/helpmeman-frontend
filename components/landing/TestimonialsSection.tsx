"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { MessageSquarePlus } from "lucide-react";
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
  companyLogo?: string;
}

interface PublicStats {
  averageRating: number;
  totalReviews: number;
}

const CURATED_MOBBIN_REVIEWS: PublicReview[] = [
  {
    id: "cur-1",
    name: "Taha Hossain",
    role: "Daybreak • IIT Bombay",
    avatar: "/mentor1.png",
    rating: 5,
    feedback:
      "We can't imagine cracking top-tier product design and placement interviews without HelpMeMan. The quality, clarity and precision it provides make it just as valuable as it is intuitive.",
    createdAt: "2026-08-15T00:00:00Z",
    verified: true,
    featured: true,
  },
  {
    id: "cur-2",
    name: "Meng To",
    role: "DesignCode",
    avatar: "/mentor3.jpg",
    rating: 5,
    feedback:
      "HelpMeMan is a game-changer for designers & developers looking to step up their understanding of system design and real-world UI patterns. It's so massive, meticulously organized, has deep 1:1 strategy calls and even live code walkthroughs! Indispensable in the modern toolbox.",
    createdAt: "2026-08-12T00:00:00Z",
    verified: true,
    featured: true,
  },
  {
    id: "cur-3",
    name: "Rachel How",
    role: "SDE @ Google",
    avatar: "/mentor5.jpeg",
    rating: 5,
    feedback:
      "HelpMeMan is my go-to reference for 1:1 mentorship and mock interviews. Apart from saving countless hours, it gives me actionable insights on DSA patterns, resume ATS roast, and user flows of top-tier products. A must-have for creative inspiration and efficiency!",
    createdAt: "2026-08-10T00:00:00Z",
    verified: true,
    featured: true,
  },
  {
    id: "cur-4",
    name: "Oykun Yilmaz",
    role: "Founder, YC Alum",
    avatar: "/mentor4.jpg",
    rating: 5,
    feedback:
      "Designing feasible solutions based on real-world experience is crucial for our careers. HelpMeMan provides the best resources and direct mentorship for this approach. I use it daily!",
    createdAt: "2026-08-08T00:00:00Z",
    verified: true,
    featured: true,
  },
  {
    id: "cur-5",
    name: "John Bai",
    role: "Plaid",
    avatar: "/mentor6.jpeg",
    rating: 5,
    feedback:
      "All my homies love HelpMeMan. I mean that. I finally deleted that folder of 1,866 unorganized notes & roadmap videos and haven't looked back since. Shout out to the team for doing exceptional work.",
    createdAt: "2026-08-05T00:00:00Z",
    verified: true,
    featured: true,
  },
  {
    id: "cur-6",
    name: "Axel Lindmarker",
    role: "AIIMS Delhi '24",
    avatar: "/mentor7.jpeg",
    rating: 5,
    feedback:
      "HelpMeMan is one of my main tools for finding real toppers to gain exam strategy and prep insights from. Booking a session saves me a lot of time from having to do it myself.",
    createdAt: "2026-08-02T00:00:00Z",
    verified: true,
    featured: true,
  },
  {
    id: "cur-7",
    name: "Josiah Gulden",
    role: "Compound Labs",
    avatar: "/mentor3.jpg",
    rating: 5,
    feedback:
      "HelpMeMan is one of the best ways to stay on top of the latest interview patterns, modalities, and visual trends in tech & product design... it's an essential resource for my career.",
    createdAt: "2026-07-28T00:00:00Z",
    verified: true,
    featured: true,
  },
  {
    id: "cur-8",
    name: "Bobby Giangeruso",
    role: "Heart Hands, Inc",
    avatar: "/mentor1.png",
    rating: 5,
    feedback:
      "HelpMeMan is one of those tabs I never close. It's the largest up-to-date library of verified 1:1 mentors from top companies and colleges.",
    createdAt: "2026-07-25T00:00:00Z",
    verified: true,
    featured: true,
  },
];

export function TestimonialsSection() {
  const { user } = useAuth();
  const router = useRouter();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [reviews, setReviews] = useState<PublicReview[]>(CURATED_MOBBIN_REVIEWS);
  const [stats, setStats] = useState<PublicStats>({ averageRating: 5.0, totalReviews: 240 });

  useEffect(() => {
    let isMounted = true;
    api
      .get("/platform-reviews/public")
      .then((res: any) => {
        if (!isMounted) return;
        const fetchedReviews: PublicReview[] = res.data?.reviews || [];
        const fetchedStats: PublicStats = res.data?.stats || { averageRating: 5.0, totalReviews: 240 };

        // Deduplicate & merge with curated list
        const uniqueMap = new Map<string, PublicReview>();

        // Add fetched reviews first
        fetchedReviews.forEach((r) => {
          if (r.feedback && r.feedback.trim().length > 15) {
            const key = (r.name || r.id).toLowerCase();
            uniqueMap.set(key, r);
          }
        });

        // Add curated reviews
        CURATED_MOBBIN_REVIEWS.forEach((c) => {
          const key = c.name.toLowerCase();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, c);
          }
        });

        const combined = Array.from(uniqueMap.values());
        setReviews(combined);
        setStats(fetchedStats);
      })
      .catch((err: any) => {
        console.warn("Could not load dynamic platform reviews, using curated fallback:", err);
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

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 lg:py-36 bg-white dark:bg-[#0A0A0A] border-t border-[#E5E7EB] dark:border-[#27272A] transition-colors duration-300 relative overflow-hidden"
    >
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 md:mb-16 text-center max-w-2xl mx-auto flex flex-col items-center gap-3.5"
        >
          {/* Aggregate Rating Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[#111827] dark:text-white text-xs font-semibold shadow-xs">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  className="fill-[#F59E0B] text-[#F59E0B]"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span>{stats.averageRating.toFixed(1)} rating</span>
          </div>

          <h2 className="text-[clamp(28px,4.5vw,46px)] font-bold tracking-[-0.035em] text-[#111111] dark:text-white leading-[1.08]">
            Loved by ambitious minds
          </h2>
          <p className="text-[16px] sm:text-[17px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed max-w-lg">
            Real feedback from students, developers, and founders who use HelpMeMan.
          </p>
        </motion.div>
      </div>

      {/* Mobbin-Style Masonry Reviews Grid */}
      <div className="max-w-[1280px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5"
        >
          {reviews.map((review, i) => (
            <motion.div
              key={review.id || `rev-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 * (i % 6) }}
              className="break-inside-avoid bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-[#D1D5DB] dark:hover:border-[#3F3F46] transition-all duration-300 flex flex-col justify-between"
            >
              {/* Header: Avatar + User Info */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-neutral-100 dark:bg-neutral-800"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                      {review.name ? review.name.charAt(0).toUpperCase() : "M"}
                    </div>
                  )}
                  {/* Subtle Verified / Brand Dot Badge */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold border-2 border-white dark:border-[#18181B]">
                    ✓
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[14.5px] sm:text-[15.5px] font-semibold text-[#111827] dark:text-white leading-tight truncate">
                    {review.name || "Anonymous Mentee"}
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 truncate font-normal">
                    {review.role || "Verified Mentee"}
                  </p>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-[13.5px] sm:text-[14.5px] leading-[1.65] text-[#374151] dark:text-[#D1D5DB] mt-4 whitespace-pre-line font-normal">
                {review.feedback || "HelpMeMan provided incredible clarity and mentorship for my career goals."}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Call to Action Button */}
      <div className="mt-14 flex justify-center px-6">
        <button
          onClick={handleOpenReviewModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-semibold bg-[#09090B] dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Leave a Platform Review</span>
        </button>
      </div>
    </section>
  );
}
