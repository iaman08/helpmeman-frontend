"use client";

import Link from "next/link";
import { useState } from "react";

type Tier = {
  price: string;
  audience: string;
  blurb: string;
  call: string;
  chat: string;
  cta: string;
  tag: string;
  isPopular?: boolean;
};

const tiers: Tier[] = [
  {
    price: "₹129",
    audience: "11th – 12th guidance",
    blurb: "Stream choice, JEE/NEET strategy, board-vs-entrance balance.",
    call: "1 mentor call",
    chat: "30-day chat access",
    cta: "Book at ₹129",
    tag: "Starter",
  },
  {
    price: "₹199",
    audience: "1st / 2nd / 3rd year",
    blurb: "Branch reality-check, internships, skills, side projects.",
    call: "1 mentor call",
    chat: "30-day chat access",
    cta: "Book at ₹199",
    tag: "Most Chosen",
  },
  {
    price: "₹249",
    audience: "Internship / Job guidance",
    blurb: "Resume, interviews, offer evaluation, first 90-day plans.",
    call: "1 mentor call",
    chat: "30-day chat access",
    cta: "Book at ₹249",
    tag: "Career",
  },
  {
    price: "₹499",
    audience: "Top MNC Mentors",
    blurb: "Senior engineers & PMs from FAANG, quant firms & unicorns.",
    call: "1 premium mentor call",
    chat: "7-day priority chat",
    cta: "Book at ₹499",
    tag: "Premium",
    isPopular: true,
  },
];

export function Pricing() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full px-5 sm:px-10 lg:px-24 py-14 sm:py-20">
      {/* Headline */}
      <div className="max-w-3xl mb-10 sm:mb-14">
        <h2 className="font-display text-[clamp(1.6rem,4.5vw,3.6rem)] leading-[1.05]">
          Real mentorship, at the price of
          <span className="italic"> a meal out.</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-(--muted) max-w-md">
          One transparent price. No subscriptions. Pay once, talk to someone who’s been there.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {tiers.map((tier, i) => {
          const isHovered = hoveredIndex === i;
          const isPopular = tier.isPopular;

          return (
            <div
              key={tier.price}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                group relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 border transition-all duration-300 cursor-pointer
                ${isHovered
                  ? "bg-white text-black border-white shadow-2xl scale-[1.04] z-10"
                  : "bg-transparent border-white/10 hover:border-white/30 text-white"
                }
                ${isPopular && !isHovered ? "border-amber-500/50" : ""}
              `}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 right-6 bg-amber-500 text-black text-[10px] font-bold px-4 py-1 rounded-full tracking-widest uppercase">
                  MOST POPULAR
                </div>
              )}

              <div className="space-y-6">
                {/* Tag */}
                <div className={`uppercase text-xs tracking-[0.5em] font-bold ${isHovered ? "text-black/60" : "text-neutral-400"}`}>
                  {tier.tag}
                </div>

                {/* Price */}
                <div className={`text-6xl sm:text-7xl font-bold tracking-tighter transition-colors ${isHovered ? "text-black" : ""}`}>
                  {tier.price}
                </div>

                {/* Audience */}
                <p className={`font-medium text-sm ${isHovered ? "text-black/70" : "text-neutral-400"}`}>
                  {tier.audience}
                </p>

                {/* Blurb */}
                <p className={`text-sm leading-relaxed ${isHovered ? "text-black/70" : "text-neutral-400"}`}>
                  {tier.blurb}
                </p>

                {/* Features */}
                <ul className="space-y-3 text-sm">
                  <li className={`flex items-center gap-3 ${isHovered ? "text-black/70" : "text-neutral-400"}`}>
                    <span className="text-green-500">✓</span> {tier.call}
                  </li>
                  <li className={`flex items-center gap-3 ${isHovered ? "text-black/70" : "text-neutral-400"}`}>
                    <span className="text-green-500">✓</span> {tier.chat}
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                href="/signup"
                onClick={(e) => e.stopPropagation()}
                className={`mt-8 block w-full text-center py-4 rounded-2xl font-bold text-sm tracking-wider transition-all
                  ${isHovered
                    ? "bg-black text-white hover:bg-neutral-800"
                    : "border border-white/30 hover:bg-white hover:text-black"
                  }`}
              >
                {tier.cta} →
              </Link>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-center mt-10 text-xs text-(--muted)">
        All plans are one-time payment • Refundable if mentor cancels
      </div>
    </div>
  );
}