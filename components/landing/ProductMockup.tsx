"use client";

import { Star } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const mockMentors = [
  {
    name: "Arjun Mehta",
    role: "L7 Engineer · System Design",
    company: "Google",
    rating: 5,
    reviews: 48,
    fee: "₹499",
    duration: "30 min",
    img: "/mentor3.jpg",
    badge: "GOOGLE",
  },
  {
    name: "Priya Kapoor",
    role: "Staff Engineer · Frontend",
    company: "Meta",
    rating: 5,
    reviews: 36,
    fee: "₹399",
    duration: "30 min",
    img: "https://i.pinimg.com/736x/0d/a5/e7/0da5e7b3a24ea9ef05db4eaa253e9cf3.jpg",
    badge: "META",
  },
  {
    name: "Vikram Anand",
    role: "Founder · Fundraising",
    company: "YC S21",
    rating: 5,
    reviews: 24,
    fee: "₹599",
    duration: "30 min",
    img: "https://i.pinimg.com/736x/fc/86/7d/fc867df822d70b9d78171c7e790f99c7.jpg",
    badge: "YC",
  },
];

const filters = ["All", "Engineering", "Design", "Product", "Startup", "Medical"];

export function ProductMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="px-6 pb-16 md:pb-24 lg:pb-32">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-[960px] mx-auto"
      >
        <div className="mockup-browser">
          {/* Browser chrome */}
          <div className="mockup-toolbar">
            <div className="flex gap-[6px]">
              <div className="mockup-dot" />
              <div className="mockup-dot" />
              <div className="mockup-dot" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 text-[12px] text-[#9CA3AF] text-center max-w-[260px] mx-auto select-none">
                helpmeman.com/mentors
              </div>
            </div>
          </div>

          {/* Product interface */}
          <div className="p-4 md:p-6 bg-white">
            {/* Search bar */}
            <div className="border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-center gap-3 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="text-[13px] text-[#9CA3AF] select-none">
                Search mentors by name, skill, or career goal...
              </span>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
              {filters.map((f, i) => (
                <span
                  key={f}
                  className={`px-3.5 py-1.5 text-[12px] font-medium rounded-full border whitespace-nowrap select-none ${
                    i === 0
                      ? "bg-[#111111] text-white border-[#111111]"
                      : "bg-white text-[#6B7280] border-[#E5E7EB]"
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Mentor card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {mockMentors.map((mentor) => (
                <div
                  key={mentor.name}
                  className="border border-[#E5E7EB] rounded-xl overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-[#F3F4F6] overflow-hidden">
                    <img
                      src={mentor.img}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 md:p-3.5">
                    <div className="mb-1.5">
                      <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded select-none">
                        {mentor.badge}
                      </span>
                    </div>
                    <p className="text-[13px] md:text-[14px] font-semibold text-[#111111] leading-tight">
                      {mentor.name}
                    </p>
                    <p className="text-[11px] md:text-[12px] text-[#6B7280] mt-0.5">
                      {mentor.role}
                    </p>
                    <div className="flex items-center gap-0.5 mt-2">
                      {Array.from({ length: mentor.rating }).map((_, i) => (
                        <Star key={i} size={10} className="fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                      <span className="text-[10px] text-[#9CA3AF] ml-1">({mentor.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F3F4F6]">
                      <span className="text-[12px] md:text-[13px] font-semibold text-[#111111]">
                        {mentor.fee}
                        <span className="text-[10px] font-normal text-[#9CA3AF]">/{mentor.duration}</span>
                      </span>
                      <span className="text-[10px] md:text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md select-none">
                        Book
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
