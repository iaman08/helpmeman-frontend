"use client";

import { useState, useRef, useMemo } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Stethoscope,
  Laptop,
  Scale,
  GraduationCap,
  Rocket,
  BarChart,
  Palette,
  HeartPulse,
  Video,
  Bot,
  FileText,
  UserCheck,
  Calendar,
  Compass,
  Keyboard,
  ArrowRight,
  Search,
  CheckCircle2,
  Filter,
} from "lucide-react";

export interface ServiceItem {
  id: string;
  title: string;
  category: "domain" | "platform";
  badge: string;
  icon: React.ElementType;
  iconColor: string;
  description: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
}

const SERVICES: ServiceItem[] = [
  // ── Platform Capabilities ──
  {
    id: "1on1-video",
    title: "1-on-1 Live Video Mentorship",
    category: "platform",
    badge: "Core Service",
    icon: Video,
    iconColor: "#2563EB",
    description:
      "Direct, face-to-face 1:1 strategy calls with verified toppers, senior engineers, doctors, and advocates tailored to your exact questions.",
    highlights: [
      "Custom session durations (15m, 30m, 45m)",
      "Screen-sharing & live code/resume walkthroughs",
      "Instant calendar sync & automated meet links",
    ],
    ctaText: "Book a 1:1 Session",
    ctaLink: "/mentors",
    popular: true,
  },
  {
    id: "ai-copilot",
    title: "24/7 AI Career Copilot & Assistant",
    category: "platform",
    badge: "AI Powered",
    icon: Bot,
    iconColor: "#7C3AED",
    description:
      "Get instant answers to prep questions, generate study schedules, match with ideal mentors, and receive automated post-session summaries.",
    highlights: [
      "Instant guidance anytime, anywhere",
      "Smart mentor recommendations based on goals",
      "Automatic session notes & action item extraction",
    ],
    ctaText: "Try AI Copilot",
    ctaLink: "/#about",
    popular: true,
  },
  {
    id: "resume-review",
    title: "Resume & Portfolio Roast",
    category: "platform",
    badge: "High Impact",
    icon: FileText,
    iconColor: "#059669",
    description:
      "Get your resume, ATS formatting, GitHub projects, and portfolio reviewed line-by-line by recruiters and top industry practitioners.",
    highlights: [
      "ATS score optimization & impact metrics",
      "LinkedIn & GitHub profile makeover",
      "Detailed actionable feedback report",
    ],
    ctaText: "Get Resume Reviewed",
    ctaLink: "/mentors?category=campus-placements",
  },
  {
    id: "mock-interviews",
    title: "Mock Technical & HR Interviews",
    category: "platform",
    badge: "Interview Ready",
    icon: UserCheck,
    iconColor: "#F59E0B",
    description:
      "Simulate real coding rounds, system design challenges, or behavioral HR interviews with mentors currently working at top tier companies.",
    highlights: [
      "Real-world interview environment & questions",
      "Detailed scoring rubric across key dimensions",
      "Constructive feedback & follow-up practice tips",
    ],
    ctaText: "Schedule Mock Interview",
    ctaLink: "/mentors?category=faang",
    popular: true,
  },
  {
    id: "natural-scheduling",
    title: "Natural-Language Scheduling",
    category: "platform",
    badge: "Seamless",
    icon: Calendar,
    iconColor: "#0EA5E9",
    description:
      "Simply text our AI assistant your free time slots in plain language. We automatically manage availability, timezone shifts, and reminders.",
    highlights: [
      "Zero back-and-forth email scheduling",
      "Automatic timezone conversion & SMS/email alerts",
      "Flexible rescheduling options",
    ],
    ctaText: "Learn How It Works",
    ctaLink: "/help",
  },
  {
    id: "custom-roadmaps",
    title: "Customized Action Roadmaps",
    category: "platform",
    badge: "Personalized",
    icon: Compass,
    iconColor: "#E11D48",
    description:
      "Receive personalized week-by-week roadmaps tailored to your target exam date, career transition, or skill acquisition goal.",
    highlights: [
      "Curated resource lists & milestone tracking",
      "Progress check-ins with your assigned mentor",
      "Adaptable steps based on your learning speed",
    ],
    ctaText: "Get Your Roadmap",
    ctaLink: "/mentors",
  },
  {
    id: "typing-test",
    title: "Typing Speed Test & AI Certification",
    category: "platform",
    badge: "Monkeytype Engine",
    icon: Keyboard,
    iconColor: "#2563EB",
    description:
      "Test your typing speed with smooth Monkeytype-style mechanics, real-time WPM accuracy metrics, and download an official AI Skill Certificate PDF.",
    highlights: [
      "15s, 30s, and 60s speed burst tests",
      "Standard, Tech Code, Medical & Legal word sets",
      "Download certified PDF report for resume & LinkedIn",
    ],
    ctaText: "Take Typing Test",
    ctaLink: "/typing-test",
    popular: true,
  },

  // ── Domain Guidance Categories ──
  {
    id: "jee-prep",
    title: "JEE Main & Advanced Strategy",
    category: "domain",
    badge: "IITian Mentors",
    icon: BookOpen,
    iconColor: "#1D4ED8",
    description:
      "Cracking Physics, Chemistry & Math with top AIR rankers from IIT Bombay, Delhi, Madras & Roorkee. Master problem-solving & exam strategy.",
    highlights: [
      "Subject-wise weightage & revision frameworks",
      "Mock test analysis & speed optimization",
      "Dropper year planning & stress management",
    ],
    ctaText: "Find JEE Mentors",
    ctaLink: "/mentors?category=jee-neet-prep",
    popular: true,
  },
  {
    id: "medical-neet",
    title: "NEET UG & Medical Prep",
    category: "domain",
    badge: "AIIMS Toppers",
    icon: Stethoscope,
    iconColor: "#10B981",
    description:
      "NCERT Biology retention techniques, Physics numerical strategies, and Medical college counseling directly from top AIIMS & medical rankers.",
    highlights: [
      "NCERT line-by-line memory techniques",
      "Physics numerical accuracy blue-prints",
      "State & All India quota counseling guidance",
    ],
    ctaText: "Find NEET Mentors",
    ctaLink: "/mentors?category=medical-neet",
    popular: true,
  },
  {
    id: "faang-tech",
    title: "FAANG & Big Tech Careers",
    category: "domain",
    badge: "Top SDEs",
    icon: Laptop,
    iconColor: "#4F46E5",
    description:
      "Land high-paying Software Engineering roles at Rubrik, Cohesity, Salesforce, Google, Meta & Amazon with 1:1 System Design & DSA coaching.",
    highlights: [
      "System Design & Microservices walkthroughs",
      "LeetCode patterns & competitive programming",
      "Employee referral opportunities for top performers",
    ],
    ctaText: "Find Tech Mentors",
    ctaLink: "/mentors?category=faang",
    popular: true,
  },
  {
    id: "health-nutrition",
    title: "Health & Clinical Nutrition",
    category: "domain",
    badge: "Doctors & Nutritionists",
    icon: HeartPulse,
    iconColor: "#F43F5E",
    description:
      "Personalized diet planning, student energy optimization, clinical nutrition, and healthy lifestyle coaching by qualified MBBS doctors.",
    highlights: [
      "Custom student & professional meal plans",
      "Sleep hygiene & focus enhancement routines",
      "Clinical wellness & stress management",
    ],
    ctaText: "Find Nutritionists",
    ctaLink: "/mentors?category=health-nutrition",
  },
  {
    id: "law-clat",
    title: "Law & Legal Guidance",
    category: "domain",
    badge: "High Court Advocates",
    icon: Scale,
    iconColor: "#D97706",
    description:
      "CLAT UG/PG exam preparation, NLU admission roadmaps, Moot Court mastery, and corporate litigation career guidance by NLSIU alumni.",
    highlights: [
      "CLAT legal reasoning & GK strategies",
      "Moot Court research & oral arguments",
      "Corporate law & court litigation careers",
    ],
    ctaText: "Find Law Mentors",
    ctaLink: "/mentors?category=law",
  },
  {
    id: "campus-placements",
    title: "Campus Placements & Off-Campus",
    category: "domain",
    badge: "Tier-1 Placement",
    icon: GraduationCap,
    iconColor: "#6D28D9",
    description:
      "Crack college placement drives, aptitude tests, technical rounds, and off-campus tech applications for engineering & degree students.",
    highlights: [
      "Aptitude & coding round preparation",
      "Company-specific interview pattern breakdowns",
      "Open Source & GSoC contribution guidance",
    ],
    ctaText: "Find Placement Mentors",
    ctaLink: "/mentors?category=campus-placements",
  },
  {
    id: "startup-founder",
    title: "Startup & Founder Advisory",
    category: "domain",
    badge: "YC & IIT Founders",
    icon: Rocket,
    iconColor: "#EA580C",
    description:
      "Build, launch, and scale your startup. Get feedback on MVP tech stack, product-market fit, pitch decks, and early-stage fundraising.",
    highlights: [
      "Pitch deck & narrative refinement",
      "Scalable tech architecture & cloud setup",
      "Early user acquisition & growth playbooks",
    ],
    ctaText: "Find Founder Mentors",
    ctaLink: "/mentors?category=startup",
  },
  {
    id: "mba-b-school",
    title: "MBA & B-School Prep",
    category: "domain",
    badge: "IIM Alumni",
    icon: BarChart,
    iconColor: "#16A34A",
    description:
      "CAT exam preparation, WAT/GD-PI interview prep, profile building, and specialization advice for top B-schools in India and abroad.",
    highlights: [
      "CAT VARC, DILR & QA strategy",
      "GD-PI mock interviews & SOP reviews",
      "Consulting & Product Management paths",
    ],
    ctaText: "Find MBA Mentors",
    ctaLink: "/mentors?category=mba",
  },
  {
    id: "design-uiux",
    title: "Design & UI/UX Coaching",
    category: "domain",
    badge: "Senior Designers",
    icon: Palette,
    iconColor: "#C026D3",
    description:
      "Build industry-ready UI/UX portfolios, master Figma design systems, conduct user research, and prepare for product design interview rounds.",
    highlights: [
      "Portfolio case study reviews & feedback",
      "Figma auto-layout & design system techniques",
      "Product design whiteboard interview practice",
    ],
    ctaText: "Find Design Mentors",
    ctaLink: "/mentors?category=design",
  },
];

export function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [activeTab, setActiveTab] = useState<"all" | "domain" | "platform">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      // Tab filter
      if (activeTab !== "all" && service.category !== activeTab) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = service.title.toLowerCase().includes(query);
        const matchesDesc = service.description.toLowerCase().includes(query);
        const matchesBadge = service.badge.toLowerCase().includes(query);
        const matchesHighlights = service.highlights.some((h) =>
          h.toLowerCase().includes(query)
        );
        return matchesTitle || matchesDesc || matchesBadge || matchesHighlights;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  return (
    <section
      id="services"
      ref={ref}
      className="py-20 md:py-28 lg:py-32 bg-[var(--bg)] border-t border-[var(--hairline)] transition-colors duration-300 relative overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Complete Mentorship Ecosystem
          </div>
          <h2 className="text-[clamp(28px,4.5vw,52px)] font-bold tracking-[-0.03em] text-[var(--fg)] leading-[1.08]">
            Every Service You Need to Succeed
          </h2>
          <p className="mt-4 text-[16px] md:text-[18px] text-[var(--muted)] leading-relaxed max-w-2xl mx-auto">
            From 1:1 strategy calls with verified toppers and engineers to 24/7 AI copilot guidance, explore our complete range of specialized offerings.
          </p>
        </motion.div>

        {/* Filter Bar: Tabs + Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-[var(--hairline)]"
        >
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white dark:bg-[#27272A] text-[var(--fg)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              All Services ({SERVICES.length})
            </button>
            <button
              onClick={() => setActiveTab("domain")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "domain"
                  ? "bg-white dark:bg-[#27272A] text-[var(--fg)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              Domain Guidance ({SERVICES.filter((s) => s.category === "domain").length})
            </button>
            <button
              onClick={() => setActiveTab("platform")}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "platform"
                  ? "bg-white dark:bg-[#27272A] text-[var(--fg)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              Core Capabilities ({SERVICES.filter((s) => s.category === "platform").length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--fg)] bg-transparent border-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 dark:bg-[#18181B] rounded-2xl border border-dashed border-slate-300 dark:border-[#27272A]">
            <Filter className="w-8 h-8 mx-auto text-[var(--muted)] mb-3 opacity-60" />
            <h3 className="text-lg font-semibold text-[var(--fg)]">No matching services found</h3>
            <p className="text-sm text-[var(--muted)] mt-1">
              Try adjusting your search query or switching tabs.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200/80 dark:border-[#27272A] hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-500/5 transition-all duration-300"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      {/* Icon Badge */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                        style={{ backgroundColor: service.iconColor }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      {/* Badge Pill */}
                      <div className="flex items-center gap-1.5">
                        {service.popular && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
                            Popular
                          </span>
                        )}
                        <span className="px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] bg-slate-100 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-full">
                          {service.badge}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[var(--fg)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                      {service.description}
                    </p>

                    {/* Bullet Highlights */}
                    <ul className="mt-4 space-y-2 border-t border-slate-100 dark:border-[#1F1F23] pt-4">
                      {service.highlights.map((highlight, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-xs text-[var(--fg)] opacity-90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1F1F23]">
                    <Link
                      href={service.ctaLink}
                      className="inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-[#18181B] text-[var(--fg)] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-slate-200 dark:border-[#27272A] hover:border-transparent transition-all no-underline group/btn"
                    >
                      <span>{service.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 rounded-3xl p-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 shadow-sm relative overflow-hidden"
        >
          {/* Subtle decorative blob */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-200/40 dark:bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-indigo-200/40 dark:bg-indigo-700/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Not sure which service or mentor you need?
              </h3>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Chat with Ruth AI right now. Describe your goals in plain words, and let our AI match you with the exact right mentor and path in under 30 seconds.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/?auth=signup"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40 text-center no-underline"
              >
                Find My Mentor Now
              </Link>
              <Link
                href="/#about"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-all text-center no-underline"
              >
                Ask Ruth AI
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
