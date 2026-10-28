"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import styles from "./MarketingSections.module.css";
import { PriceDisplay } from "@/components/PriceDisplay";

const pricingTiers = [
  {
    name: "Starter",
    priceInPaise: 12900,
    duration: "Per Session",
    description: "Ideal for 11th & 12th standard students looking for academic direction.",
    features: [
      "1-on-1 verified mentor call",
      "30-minute session duration",
      "30-day offline chat follow-up",
      "Basic study templates & resources",
    ],
    popular: false,
  },
  {
    name: "Undergrad",
    priceInPaise: 19900,
    duration: "Per Session",
    description: "Best for college students seeking internship and specialization guidance.",
    features: [
      "1-on-1 verified mentor call",
      "45-minute session duration",
      "30-day offline chat follow-up",
      "Resume review & roadmap builder",
    ],
    popular: true,
  },
  {
    name: "Career",
    priceInPaise: 24900,
    duration: "Per Session",
    description: "Designed for job seekers and early career transitions.",
    features: [
      "1-on-1 verified mentor call",
      "60-minute session duration",
      "30-day offline chat follow-up",
      "Mock interview & referral guidance",
    ],
    popular: false,
  },
  {
    name: "Premium Elite",
    priceInPaise: 49900,
    duration: "Per Session",
    description: "Exclusive access to top founders, FAANG leaders, and senior directors.",
    features: [
      "1-on-1 elite industry mentor call",
      "60-minute session duration",
      "7-day priority chat follow-up",
      "Direct referral pool access",
    ],
    popular: false,
  },
];


export function PricingSection() {
  return (
    <section id="pricing" className={styles.pricingSection} aria-labelledby="pricing-heading">
      <div className={styles.sectionInner}>
        <div className={styles.pricingHeader}>
          <h2 id="pricing-heading">Investment in your future</h2>
          <p>Choose the mentorship format that fits your immediate goals and budget. No hidden fees or recurring subscriptions.</p>
        </div>
        <div className={styles.pricingGrid}>
          {pricingTiers.map((tier) => (
            <article key={tier.name} className={styles.priceCard} data-popular={tier.popular}>
              <div className={styles.tierNameRow}><h3>{tier.name}</h3>{tier.popular && <span>Most chosen</span>}</div>
              <div className={styles.tierPrice}><strong><PriceDisplay amountInPaise={tier.priceInPaise} /></strong><span>/ {tier.duration.toLowerCase()}</span></div>
              <p className={styles.tierDescription}>{tier.description}</p>
              <ul className={styles.tierFeatures}>
                {tier.features.map((feature) => <li key={feature}><Check size={15} aria-hidden="true" /><span>{feature}</span></li>)}
              </ul>
              <Link href="/mentors" className={styles.tierAction}>Explore mentors <ArrowRight size={15} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
