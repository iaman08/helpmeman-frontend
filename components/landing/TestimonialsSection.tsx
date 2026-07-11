"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Neha Deshmukh",
    role: "Placed at Microsoft",
    avatar: "https://i.pravatar.cc/80?img=5",
    quote:
      "HelpMeMan didn't just help me crack my placement — they helped me find my direction. My mentor from Google gave me a roadmap that actually worked.",
    rating: 5,
  },
  {
    name: "Rahul Joshi",
    role: "IIT Bombay → Goldman Sachs",
    avatar: "https://i.pravatar.cc/80?img=12",
    quote:
      "I was confused between quant and SDE. One session with a Goldman analyst gave me more clarity than months of Reddit threads.",
    rating: 5,
  },
  {
    name: "Fatima Sheikh",
    role: "Career Switch → Product",
    avatar: "https://i.pravatar.cc/80?img=25",
    quote:
      "I never imagined transitioning from operations to product management. My mentor walked me through every step — resume, portfolio, interview prep.",
    rating: 5,
  },
  {
    name: "Aryan Kapoor",
    role: "GSoC 2025 Selected",
    avatar: "https://i.pravatar.cc/80?img=33",
    quote:
      "The GSoC mentor on HelpMeMan helped me pick the right org and write a winning proposal. Got selected in my first attempt!",
    rating: 5,
  },
  {
    name: "Priyanka Nair",
    role: "NEET AIR 342",
    avatar: "https://i.pravatar.cc/80?img=44",
    quote:
      "Having an AIIMS senior guide my last 3 months of NEET prep was game-changing. Strategy matters more than hours of random studying.",
    rating: 5,
  },
  {
    name: "Jay Krishnan",
    role: "YC S24 Founder",
    avatar: "https://i.pravatar.cc/80?img=51",
    quote:
      "Before my YC interview, I did 3 mock sessions with a YC alum on HelpMeMan. They pushed back on my pitch until it was airtight.",
    rating: 5,
  },
  {
    name: "Meera Patel",
    role: "UPSC Prelims Cleared",
    avatar: "https://i.pravatar.cc/80?img=47",
    quote:
      "My mentor, an IAS officer, gave me a realistic study plan and helped me choose my optional subject. Best investment I made.",
    rating: 5,
  },
  {
    name: "Siddharth Agarwal",
    role: "Intern at Stripe",
    avatar: "https://i.pravatar.cc/80?img=60",
    quote:
      "From scattered confusion to a clear roadmap in 30 days. The mentor made the entire process smooth, sharp, and stress-free.",
    rating: 4,
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const row1 = testimonials.slice(0, 4);
  const row2 = testimonials.slice(4, 8);

  // Repeat items 4 times to ensure no gaps exist on very wide screens
  const row1Repeated = [...row1, ...row1, ...row1, ...row1];
  const row2Repeated = [...row2, ...row2, ...row2, ...row2];

  return (
    <section ref={ref} className="py-20 md:py-28 lg:py-36 bg-[#FAFAFA] dark:bg-[#0E0E10] border-t border-[var(--hairline)] transition-colors duration-300">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-14 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[var(--fg)] leading-[1.1]">
            What our mentees say
          </h2>
          <p className="mt-3 text-[16px] text-[var(--muted)] leading-relaxed">
            Real stories from students and professionals who found their path.
          </p>
        </motion.div>
      </div>

      {/* Double Row Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="marquee-container"
      >
        {/* Row 1: Scrolling Left */}
        <div className="marquee-row marquee-row--left">
          <div className="marquee-track">
            {row1Repeated.map((t, idx) => (
              <div
                key={`row1-${t.name}-${idx}`}
                className="marquee-card bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-6 flex flex-col shadow-sm"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
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

                {/* Quote */}
                <p className="text-[14px] leading-[1.7] text-[#374151] dark:text-[#D1D5DB] flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#F3F4F6] dark:border-[#27272A]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover bg-[#F3F4F6] dark:bg-[#27272A]"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--fg)]">
                      {t.name}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="marquee-row marquee-row--right">
          <div className="marquee-track">
            {row2Repeated.map((t, idx) => (
              <div
                key={`row2-${t.name}-${idx}`}
                className="marquee-card bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-6 flex flex-col shadow-sm"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
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

                {/* Quote */}
                <p className="text-[14px] leading-[1.7] text-[#374151] dark:text-[#D1D5DB] flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#F3F4F6] dark:border-[#27272A]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover bg-[#F3F4F6] dark:bg-[#27272A]"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--fg)]">
                      {t.name}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
