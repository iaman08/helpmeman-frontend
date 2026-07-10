"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-36 lg:py-44 bg-white dark:bg-[#0A0A0A] border-t border-[#F3F4F6] dark:border-[#1F1F23] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-[clamp(32px,5vw,56px)] font-semibold tracking-[-0.03em] text-[#111111] dark:text-white leading-[1.05] mb-8">
            Your next breakthrough is one conversation away.
          </h2>
          <p className="text-[17px] text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed max-w-xl mx-auto mb-10">
            Skip months of trial and error. Connect directly with the top 1% who have already walked your path.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/?auth=signup"
              className="px-8 py-4 bg-[#2563EB] text-white rounded-xl text-[14px] font-medium transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.98] inline-flex items-center gap-2 group shadow-sm shadow-[#2563EB]/10 no-underline"
            >
              Find My Mentor
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/?auth=signup"
              className="px-8 py-4 border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-white hover:border-[#CCCCCC] dark:hover:border-[#3F3F46] rounded-xl text-[14px] font-medium transition-all duration-200 active:scale-[0.98] hover:bg-[#F9FAFB] dark:hover:bg-[#18181B] no-underline"
            >
              Browse Mentors
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
