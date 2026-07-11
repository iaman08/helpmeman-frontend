"use client";

import { Star, ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";

const mentors = [
  {
    name: "Anwesh das",
    role: "Software Engineer (1Cr+ pkg)",
    company: "Rubrik",
    expertise: ["System Design", "DSA"],
    rating: 5,
    reviews: 48,
    fee: "₹499",
    img: "/mentor3.jpg",
  },
  {
    name: "Prakhar Shrivastava",
    role: "Co-founder, TrenchersAI ",
    company: "IIT Madras",
    expertise: ["Tech", "Ops"],
    rating: 5,
    reviews: 36,
    fee: "₹999",
    img: "/mentor5.jpeg",
  },
  {
    name: "Aryan Gupta",
    role: "SDE",
    company: "Cohesity",
    expertise: ["Startups", "Fundraising"],
    rating: 5,
    reviews: 24,
    fee: "₹599",
    img: "/mentor6.jpeg",
  },
  {
    name: "Vineet",
    role: "GSoC '25 & '26",
    company: "IIT Roorkee",
    expertise: ["Open Source", "GSoC"],
    rating: 5,
    reviews: 62,
    fee: "₹299",
    img: "/mentor1.png",
  },
  {
    name: "Sunny Sharma",
    role: "Tech Lead",
    company: "Salesforce",
    expertise: ["Backend", "Cloud"],
    rating: 4,
    reviews: 31,
    fee: "₹349",
    img: "/mentor4.jpg",
  },
  {
    name: "Omi Shourya",
    role: "Electrical Engineer",
    company: "Delhi Technical University",
    expertise: ["Electrical Engineering", "EE Core"],
    rating: 5,
    reviews: 55,
    fee: "₹299",
    img: "/mentor7.jpeg",
  },
];

export function FeaturedMentorsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="mentors" className="py-20 md:py-28 lg:py-36 px-6 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 md:mb-16"
        >
          <div>
            <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white leading-[1.1]">
              Featured Mentors
            </h2>
            <p className="mt-3 text-[16px] text-[#6B7280] dark:text-[#A1A1AA] max-w-md leading-relaxed">
              Handpicked professionals who are ready to guide you.
            </p>
          </div>
          <Link
            href="/?auth=signup"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#2563EB] hover:text-[#1d4ed8] transition-colors no-underline shrink-0"
          >
            View all mentors <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* Mentor grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {mentors.map((mentor, i) => (
            <motion.div
              key={mentor.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl overflow-hidden hover:border-[#D1D5DB] dark:hover:border-[#3F3F46] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-square sm:aspect-[4/3] bg-[#F3F4F6] dark:bg-[#27272A] overflow-hidden">
                <img
                  src={mentor.img}
                  alt={mentor.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Details */}
              <div className="p-3.5 sm:p-5">
                <div className="mb-1.5">
                  <span className="text-[9px] sm:text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 dark:text-[#60A5FA] px-2 sm:px-2.5 py-0.5 rounded-full select-none">
                    {mentor.company}
                  </span>
                </div>
                <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#111111] dark:text-white leading-snug">
                  {mentor.name}
                </h3>
                <p className="text-[11px] sm:text-[13px] text-[#6B7280] dark:text-[#A1A1AA] mt-0.5 truncate">
                  {mentor.role}
                </p>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {mentor.expertise.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] sm:text-[11px] font-medium text-[#6B7280] dark:text-[#A1A1AA] bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-0.5 rounded select-none"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mt-2.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={10}
                      className={
                        si < mentor.rating
                          ? "fill-[#F59E0B] text-[#F59E0B]"
                          : "fill-[#E5E7EB] dark:fill-[#27272A] text-[#E5E7EB] dark:text-[#27272A]"
                      }
                    />
                  ))}
                  <span className="text-[10px] sm:text-[12px] text-[#9CA3AF] ml-1">
                    ({mentor.reviews})
                  </span>
                </div>

                {/* Price + Book */}
                <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-[#F3F4F6] dark:border-[#27272A]">
                  <span className="text-[13px] sm:text-[15px] font-semibold text-[#111111] dark:text-white">
                    {mentor.fee}
                    <span className="text-[10px] sm:text-[12px] font-normal text-[#9CA3AF]">
                      /session
                    </span>
                  </span>
                  <Link
                    href="/?auth=signup"
                    className="text-[11px] sm:text-[13px] font-semibold text-[#2563EB] hover:text-[#1d4ed8] transition-colors no-underline"
                  >
                    Book →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
