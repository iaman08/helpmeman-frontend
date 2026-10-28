"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProfileCard } from "@/components/ProfileCard";
import type { Mentor } from "@/lib/types";

const rawMentors = [
  {
    id: "featured-1",
    userId: "featured-user-1",
    displayName: "Anwesh das",
    currentRole: "Software Engineer",
    company: "Rubrik",
    institutionName: "Rubrik",
    institutionType: "COMPANY",
    expertise: ["System Design", "DSA", "Distributed Systems"],
    rating: 5,
    totalSessions: 48,
    pricePerSession: 49900,
    sessionDuration: 45,
    avatar: "/mentor3.jpg",
    location: "Bengaluru, Karnataka, India",
    languages: ["English", "Hindi"],
    bio: "Software Engineer at Rubrik. Helping engineers master system design and crack product tech rounds.",
    approvalStatus: "APPROVED",
    isActive: true,
    categoryId: "tech",
  },
  {
    id: "featured-2",
    userId: "featured-user-2",
    displayName: "Prakhar Shrivastava",
    currentRole: "Co-founder, TrenchersAI",
    company: "IIT Madras",
    institutionName: "IIT Madras",
    institutionType: "COLLEGE",
    expertise: ["Tech", "Ops", "Product Strategy"],
    rating: 5,
    totalSessions: 36,
    pricePerSession: 99900,
    sessionDuration: 60,
    avatar: "/mentor5.jpeg",
    location: "Chennai, Tamil Nadu, India",
    languages: ["English", "Hindi"],
    bio: "IIT Madras Alum & Founder. Guiding students through early-stage ventures and operations.",
    approvalStatus: "APPROVED",
    isActive: true,
    categoryId: "startup",
  },
  {
    id: "featured-3",
    userId: "featured-user-3",
    displayName: "Aryan Gupta",
    currentRole: "Software Development Engineer",
    company: "Cohesity",
    institutionName: "Cohesity",
    institutionType: "COMPANY",
    expertise: ["Startups", "Fundraising", "Backend"],
    rating: 5,
    totalSessions: 24,
    pricePerSession: 59900,
    sessionDuration: 45,
    avatar: "/mentor6.jpeg",
    location: "Bengaluru, Karnataka, India",
    languages: ["English", "Hindi"],
    bio: "SDE at Cohesity. Mentor for early-stage startup engineering, backend architectures, and fundraising.",
    approvalStatus: "APPROVED",
    isActive: true,
    categoryId: "tech",
  },
  {
    id: "featured-4",
    userId: "featured-user-4",
    displayName: "Vineet",
    currentRole: "GSoC Mentor & Open Source Lead",
    company: "IIT Roorkee",
    institutionName: "IIT Roorkee",
    institutionType: "COLLEGE",
    expertise: ["Open Source", "GSoC", "Fullstack"],
    rating: 5,
    totalSessions: 62,
    pricePerSession: 29900,
    sessionDuration: 45,
    avatar: "/mentor1.png",
    location: "Roorkee, Uttarakhand, India",
    languages: ["English", "Hindi"],
    bio: "GSoC '25 & '26 Contributor from IIT Roorkee. Assisting aspiring open-source developers.",
    approvalStatus: "APPROVED",
    isActive: true,
    categoryId: "general",
  },
  {
    id: "featured-5",
    userId: "featured-user-5",
    displayName: "Sunny Sharma",
    currentRole: "Tech Lead",
    company: "Salesforce",
    institutionName: "Salesforce",
    institutionType: "COMPANY",
    expertise: ["Backend Architecture", "Cloud", "Java"],
    rating: 5,
    totalSessions: 31,
    pricePerSession: 34900,
    sessionDuration: 45,
    avatar: "/mentor4.jpg",
    location: "Hyderabad, Telangana, India",
    languages: ["English", "Hindi"],
    bio: "Tech Lead at Salesforce with 8+ years experience architecting mission-critical cloud solutions.",
    approvalStatus: "APPROVED",
    isActive: true,
    categoryId: "tech",
  },
  {
    id: "featured-6",
    userId: "featured-user-6",
    displayName: "Omi Shourya",
    currentRole: "Electrical Engineer & Hardware Lead",
    company: "Delhi Technological University",
    institutionName: "Delhi Technological University",
    institutionType: "COLLEGE",
    expertise: ["Electrical Engineering", "EE Core", "GATE Prep"],
    rating: 5,
    totalSessions: 55,
    pricePerSession: 29900,
    sessionDuration: 45,
    avatar: "/mentor7.jpeg",
    location: "New Delhi, Delhi, India",
    languages: ["English", "Hindi"],
    bio: "DTU graduate specializing in EE Core placements, competitive exams, and technical career roadmaps.",
    approvalStatus: "APPROVED",
    isActive: true,
    categoryId: "placements",
  },
];

const featuredMentors: Mentor[] = rawMentors.map((m) => ({
  ...m,
  institutionEmail: `${m.userId}@helpmeman.com`,
  isOnline: true,
  createdAt: "2025-01-01T00:00:00Z",
})) as Mentor[];

export function FeaturedMentorsSection() {

  return (
    <section id="mentors" className="scroll-mt-24 py-10 md:py-16 lg:py-20 px-6 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
      <div className="max-w-[1240px] mx-auto">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <h2 className="public-section-title text-[#111111] dark:text-white">
              Featured Mentors
            </h2>
            <p className="public-section-description mt-3 text-[#6B7280] dark:text-[#A1A1AA] max-w-md">
              Handpicked top-rated professionals and alumni ready to guide you.
            </p>
          </div>
          <Link
            href="/mentors"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors no-underline shrink-0 group"
          >
            <span>View all 1,000+ mentors</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {/* Mentor grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="h-full flex flex-col"
            >
              <ProfileCard mentor={mentor} mode="mentor" className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
