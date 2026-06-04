"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Check } from "lucide-react";

const pricingTiers = [
  {
    name: "Starter",
    price: "₹129",
    duration: "Per Session",
    description: "Ideal for 11th & 12th standard students looking for academic direction.",
    features: [
      "1-on-1 verified mentor call",
      "30-minute session duration",
      "30-day offline chat follow-up",
      "Basic study templates & resources",
    ],
    cta: "Book Starter Session",
    popular: false,
  },
  {
    name: "Undergrad",
    price: "₹199",
    duration: "Per Session",
    description: "Best for college students seeking internship and specialization guidance.",
    features: [
      "1-on-1 verified mentor call",
      "45-minute session duration",
      "30-day offline chat follow-up",
      "Resume review & roadmap builder",
    ],
    cta: "Book Undergrad Session",
    popular: true,
  },
  {
    name: "Career",
    price: "₹249",
    duration: "Per Session",
    description: "Designed for job seekers and early career transitions.",
    features: [
      "1-on-1 verified mentor call",
      "60-minute session duration",
      "30-day offline chat follow-up",
      "Mock interview & referral guidance",
    ],
    cta: "Book Career Session",
    popular: false,
  },
  {
    name: "Premium Elite",
    price: "₹499",
    duration: "Per Session",
    description: "Exclusive access to top founders, FAANG leaders, and senior directors.",
    features: [
      "1-on-1 elite industry mentor call",
      "60-minute session duration",
      "7-day priority chat follow-up",
      "Direct referral pool access",
    ],
    cta: "Book Premium Session",
    popular: false,
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" ref={ref} className="py-20 md:py-28 lg:py-36 bg-white dark:bg-[#0A0A0A] border-t border-[#F3F4F6] dark:border-[#1F1F23] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] text-[#111111] dark:text-white leading-[1.1]">
            Simple pricing, no subscriptions
          </h2>
          <p className="mt-4 text-[16px] text-[#6B7280] dark:text-[#A1A1AA] leading-relaxed">
            Pay only for the mentorship sessions you need. Transparent, stage-based pricing with no recurring monthly commitments.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                tier.popular
                  ? "bg-[#111111] dark:bg-[#18181B] text-white shadow-xl scale-[1.02] md:scale-[1.03] lg:scale-[1.04] border border-transparent dark:border-[#27272A]"
                  : "bg-white dark:bg-[#18181B] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-white hover:border-[#CCCCCC] dark:hover:border-[#3F3F46] hover:shadow-md"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] uppercase font-bold tracking-[0.15em] px-3 py-1 rounded-full">
                  Most Chosen
                </div>
              )}

              {/* Title & Price */}
              <div className="mb-6">
                <h3 className={`text-[15px] font-medium tracking-tight uppercase ${tier.popular ? "text-[#9CA3AF]" : "text-[#6B7280] dark:text-[#A1A1AA]"}`}>
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[40px] font-semibold tracking-[-0.02em] leading-none">
                    {tier.price}
                  </span>
                  <span className={`text-[13px] ${tier.popular ? "text-[#9CA3AF]" : "text-[#6B7280] dark:text-[#A1A1AA]"}`}>
                    / {tier.duration}
                  </span>
                </div>
                <p className={`mt-4 text-[13px] leading-[1.6] ${tier.popular ? "text-[#D1D5DB]" : "text-[#4B5563] dark:text-[#D1D5DB]"}`}>
                  {tier.description}
                </p>
              </div>

              {/* Divider */}
              <div className={`h-px w-full my-1 ${tier.popular ? "bg-[#27272A]" : "bg-[#F3F4F6] dark:bg-[#27272A]"}`} />

              {/* Features */}
              <ul className="space-y-4 my-6 flex-1">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2.5 text-[13px] leading-snug">
                    <Check
                      size={15}
                      className="mt-0.5 flex-shrink-0 text-[#2563EB]"
                    />
                    <span className={tier.popular ? "text-[#E5E7EB]" : "text-[#374151] dark:text-[#D1D5DB]"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                className={`w-full py-3 px-4 rounded-xl text-[13px] font-medium transition-all duration-200 active:scale-[0.98] ${
                  tier.popular
                    ? "bg-[#2563EB] text-white hover:bg-[#3B82F6]"
                    : "bg-[#F3F4F6] dark:bg-[#27272A] text-[#111111] dark:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#3F3F46]"
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
