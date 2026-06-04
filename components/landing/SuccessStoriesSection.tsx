"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Briefcase, TrendingUp, Rocket, RefreshCw } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    number: "2,400+",
    label: "Placements",
    description: "Students placed at top companies through mentor guidance",
  },
  {
    icon: TrendingUp,
    number: "850+",
    label: "Internships",
    description: "Internship offers at FAANG, startups, and MNCs",
  },
  {
    icon: Rocket,
    number: "120+",
    label: "Startups Launched",
    description: "Founders who launched after mentorship sessions",
  },
  {
    icon: RefreshCw,
    number: "600+",
    label: "Career Transitions",
    description: "Professionals who successfully switched careers",
  },
];

export function SuccessStoriesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="success" className="py-20 md:py-28 lg:py-36 px-6 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white leading-[1.1]">
            Real outcomes, not promises
          </h2>
          <p className="mt-3 text-[16px] text-[#6B7280] dark:text-[#A1A1AA] max-w-lg mx-auto leading-relaxed">
            Every number represents a real person whose career changed after a
            single conversation.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#F9FAFB] dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-6 md:p-8 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 flex items-center justify-center mx-auto mb-4">
                <stat.icon size={18} className="text-[#2563EB]" />
              </div>
              <p className="text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.02em] text-[#111111] dark:text-white leading-none">
                {stat.number}
              </p>
              <p className="text-[14px] font-semibold text-[#111111] dark:text-white mt-2">
                {stat.label}
              </p>
              <p className="text-[13px] text-[#6B7280] dark:text-[#A1A1AA] mt-2 leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
