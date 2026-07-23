"use client";

import { useState } from "react";
import Link from "next/link";
import { FooterSection } from "@/components/landing/FooterSection";
import {
  ChevronDown,
  BookOpen,
  Calendar,
  DollarSign,
  Shield,
  Users,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { PlatformReviewTrigger } from "@/components/PlatformReviewTrigger";

/* ─── FAQ Data ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "getting-started",
    icon: BookOpen,
    label: "Getting Started",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.12)",
    faqs: [
      {
        q: "What is HelpMeMan?",
        a: "HelpMeMan is an AI-powered 1:1 mentorship platform connecting ambitious learners with experienced mentors from leading colleges, companies, startups, and diverse professional backgrounds. Our mission is to make quality mentorship accessible while giving mentors complete flexibility over when and how they mentor.",
      },
      {
        q: "How do I sign up as a student / mentee?",
        a: "Click \"Sign Up\" on the homepage, create your account, and complete onboarding. You'll be asked to share your goals so we can match you with the right mentors. Once done, you can browse verified mentors and book a session instantly.",
      },
      {
        q: "How does the mentor onboarding process work?",
        a: (
          <ol className="list-none space-y-3 mt-1">
            {[
              ["Apply", "Visit the \"Become a Mentor\" section and have a natural conversation with Ruth AI. Share your journey, achievements, and the type of mentees you'd like to help."],
              ["Profile Review", "Our team carefully reviews every application within 2–3 business days."],
              ["Verification", "If shortlisted, our HR team schedules a quick verification call. Depending on your profile, we may request a Government ID, Student ID, Employee ID, or other credentials."],
              ["Go Live", "After successful verification, your mentor profile goes live on HelpMeMan within 24 hours."],
            ].map(([step, desc], i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold mt-0.5">{i + 1}</span>
                <span><strong className="text-zinc-950">{step} — </strong><span className="text-zinc-600">{desc}</span></span>
              </li>
            ))}
          </ol>
        ),
      },
      {
        q: "Is HelpMeMan free for students?",
        a: "Students pay only for booked sessions. There are no hidden subscription fees or sign-up charges. You can browse all mentor profiles, read reviews, and check availability completely for free before deciding to book.",
      },
    ],
  },
  {
    id: "sessions",
    icon: Calendar,
    label: "Sessions & Scheduling",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.12)",
    faqs: [
      {
        q: "How long does a typical mentorship session last?",
        a: "The typical mentorship session lasts 10–15 minutes. This focused format ensures high-quality, action-oriented conversations. Depending on the mentorship category or mentee's requirements, longer session formats may be introduced in the future.",
      },
      {
        q: "Can mentors choose their own availability?",
        a: "Yes — completely. HelpMeMan offers AI-powered scheduling through Ruth AI. Simply tell Ruth your daily routine in natural language. Ruth understands your availability, finds suitable time slots, and schedules sessions only when you're free. You can update your routine anytime and reschedule sessions whenever required. There are no fixed working hours or mandatory minimum session commitments.",
      },
      {
        q: "What happens if a mentor or student needs to cancel?",
        a: "Both parties can cancel or reschedule a session before the start time. We ask mentors to provide reasonable notice so students can rebook. Repeated last-minute cancellations by mentors may affect profile visibility. Detailed cancellation policies are available in our Refund & Cancellation Policy.",
      },
      {
        q: "How do I book a session with a mentor?",
        a: "After signing in, go to Browse Mentors, find someone who fits your goals, and click Book a Session. You'll see their available slots (managed via Ruth AI), pick a time that works for you, and confirm the booking. You'll receive a confirmation email with session details.",
      },
    ],
  },
  {
    id: "payments",
    icon: DollarSign,
    label: "Payments & Earnings",
    color: "#059669",
    bg: "rgba(5,150,105,0.12)",
    faqs: [
      {
        q: "How do mentors get paid?",
        a: "Mentors earn for every completed mentorship session. The detailed payout structure, platform commission, and settlement cycle are shared during onboarding. Payments are processed within a fixed settlement period after session completion.",
      },
      {
        q: "What payment methods are accepted for booking?",
        a: "We support all major payment methods including UPI, credit/debit cards, and net banking. All transactions are secured and processed through our payment gateway.",
      },
      {
        q: "What is the refund policy if a session doesn't happen?",
        a: "If a session is cancelled by the mentor or fails to take place due to technical issues on our platform, a full refund is processed to the original payment method within 5–7 business days. For student-initiated cancellations, please refer to our Refund Policy page for details.",
      },
      {
        q: "Is there a platform commission?",
        a: "Yes, HelpMeMan retains a platform commission on each session to maintain and improve the platform. The exact percentage is communicated transparently during the mentor onboarding process.",
      },
    ],
  },
  {
    id: "trust-safety",
    icon: Shield,
    label: "Trust & Safety",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.12)",
    faqs: [
      {
        q: "How are mentors verified?",
        a: "Every mentor undergoes identity and credential verification. Depending on their background, we may request a Government ID, Student ID, Employee ID, or other supporting credentials. Our HR team conducts a live verification call before any mentor profile goes live.",
      },
      {
        q: "What if I have a bad experience with a mentor?",
        a: "You can report a mentor directly from the chat window using the Report Mentor option. Our team reviews all reports within 24–48 hours. In serious cases, the mentor profile may be suspended pending investigation. Your safety and experience are our top priority.",
      },
      {
        q: "Is my personal information safe?",
        a: "Yes. We take data privacy seriously. Your personal information is encrypted and never sold to third parties. We collect only what's necessary to operate the platform. Please read our Privacy Policy for full details on how we handle your data.",
      },
      {
        q: "What community guidelines must mentors follow?",
        a: "Mentors must maintain professionalism during every interaction, avoid sharing misleading information, respect mentee privacy, and comply with HelpMeMan's mentor agreement. Violations may result in profile suspension or permanent removal from the platform.",
      },
    ],
  },
  {
    id: "mentors",
    icon: Users,
    label: "For Mentors",
    color: "#D97706",
    bg: "rgba(217,119,6,0.12)",
    faqs: [
      {
        q: "What are the mentor roles and responsibilities?",
        a: "Conduct meaningful 1:1 mentorship sessions, share practical guidance from your own experiences, keep your availability updated through Ruth AI, and maintain professionalism during every interaction. There are no scripts or templates — your authentic experience is the value.",
      },
      {
        q: "Is there a lock-in period for mentors?",
        a: "No. There is no lock-in period or exclusivity requirement. Mentors may pause or discontinue mentoring at any time. We only request that already-confirmed sessions be completed or appropriately rescheduled/cancelled before profile deactivation.",
      },
      {
        q: "Can I mentor while having a full-time job?",
        a: "Absolutely. HelpMeMan is designed for busy professionals. You set your own availability through Ruth AI, sessions are short (10–15 min), and there are no minimum session requirements. Many of our top mentors are full-time professionals who mentor just a few hours a week.",
      },
      {
        q: "Why should I join HelpMeMan as a mentor?",
        a: (
          <ul className="list-none space-y-2 mt-1">
            {[
              ["AI-powered Matchmaking", "Intelligent mentor–mentee matching based on goals and background."],
              ["Natural-Language Scheduling", "Simple routine setup and updates with Ruth AI."],
              ["Complete Flexibility", "Total control over when and how you mentor."],
              ["Impactful Interaction", "Focused, meaningful 1:1 mentorship sessions."],
              ["No Commitments", "No fixed working hours or long-term lock-in periods."],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-2">
                <span className="text-zinc-900 mt-0.5 shrink-0">✦</span>
                <span><strong className="text-zinc-950">{title}:</strong> <span className="text-zinc-600">{desc}</span></span>
              </li>
            ))}
          </ul>
        ),
      },
    ],
  },
  {
    id: "platform",
    icon: Sparkles,
    label: "Platform & Ruth AI",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.12)",
    faqs: [
      {
        q: "What is Ruth AI?",
        a: "Ruth is HelpMeMan's built-in AI assistant. She powers mentor applications (so you don't fill forms — just have a conversation), manages AI-driven scheduling based on your routine, and helps both mentors and students navigate the platform. Ruth is available 24/7 directly inside the dashboard.",
      },
      {
        q: "How does Ruth AI handle scheduling?",
        a: "Tell Ruth your daily routine in natural language — e.g., \"I'm free weekday evenings after 7 PM and Sunday mornings.\" Ruth parses your availability, blocks out your busy times, and automatically accepts booking requests only within your free windows. You can update your routine at any time.",
      },
      {
        q: "Which devices and browsers are supported?",
        a: "HelpMeMan works on all modern browsers (Chrome, Safari, Firefox, Edge) on desktop and mobile. For the best experience, we recommend using the latest version of Chrome or Safari. A dedicated mobile app is on our roadmap.",
      },
      {
        q: "How do I contact support?",
        a: "You can reach our support team by emailing support@helpmeman.com. We typically respond within 24 hours on business days. You can also chat with Ruth AI inside the platform for instant answers to common questions.",
      },
    ],
  },
];

/* ─── FAQ Accordion Item ─────────────────────────────────────────────── */
function FaqItem({ q, a, isOpen, onClick }: {
  q: string;
  a: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="border border-zinc-200 rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: isOpen ? "#f4f4f5" : "#fafafa" }}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer group"
      >
        <span className={`text-sm font-medium leading-snug transition-colors duration-200 ${isOpen ? "text-zinc-900" : "text-zinc-700 group-hover:text-zinc-900"}`}>
          {q}
        </span>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 transition-all duration-300"
          style={{
            background: isOpen ? "rgba(0,0,0,0.04)" : "transparent",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "1000px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-5 pb-5 text-sm text-zinc-600 leading-relaxed border-t border-zinc-200/50 pt-4">
          {a}
        </div>
      </div>
    </div>
  );
}

/* ─── Category Section ───────────────────────────────────────────────── */
function CategorySection({ category, defaultOpen }: {
  category: typeof CATEGORIES[0];
  defaultOpen?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen ? 0 : null);
  const Icon = category.icon;

  return (
    <div id={category.id} className="scroll-mt-24">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: category.bg }}
        >
          <Icon className="h-4 w-4" style={{ color: category.color }} />
        </div>
        <h2 className="text-base font-semibold text-zinc-900">{category.label}</h2>
        <span className="text-xs text-zinc-500 ml-auto">{category.faqs.length} questions</span>
      </div>

      <div className="flex flex-col gap-2">
        {category.faqs.map((faq, i) => (
          <FaqItem
            key={i}
            q={faq.q}
            a={faq.a}
            isOpen={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const scrollTo = (id: string) => {
    setActiveCategory(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200">
        <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-6 sm:px-10 py-4">
          <Link href="/" className="font-bold text-lg tracking-tight text-zinc-900 flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="HelpMeMan Logo" className="w-6 h-6 object-contain" />
            <span>HelpMeMan</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
              Sign in
            </Link>
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1"
            >
              ← Home
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 mx-auto max-w-[1100px] w-full px-6 sm:px-10 pt-28 pb-20">
        {/* ── Hero ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 mb-6">
            <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Support & Guidelines</span>
          </div>
          <h1 className="font-bold text-4xl sm:text-5xl text-zinc-900 tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-zinc-600 text-base max-w-xl mx-auto leading-relaxed">
            Everything you need to know about HelpMeMan — for mentors and students alike.
            Can't find your answer?{" "}
            <a href="mailto:support@helpmeman.com" className="text-zinc-900 hover:text-zinc-700 underline font-semibold">
              Email us →
            </a>
          </p>
        </div>

        {/* ── Category Quick Nav ── */}
        <div className="flex flex-wrap gap-2 justify-center mb-14">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollTo(cat.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isActive ? cat.color : "#e4e4e7",
                  background: isActive ? cat.bg : "#f4f4f5",
                  color: isActive ? cat.color : "#52525b",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── FAQ Sections ── */}
        <div className="flex flex-col gap-12">
          {CATEGORIES.map((cat, i) => (
            <CategorySection key={cat.id} category={cat} defaultOpen={i === 0} />
          ))}
        </div>

        {/* ── Still need help CTA ── */}
        <div
          className="mt-16 rounded-3xl border border-zinc-200 p-8 sm:p-12 text-center bg-zinc-50"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.02) 0%, transparent 70%)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-zinc-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Still need help?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3">
            We're here for you.
          </h2>
          <p className="text-zinc-600 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Our support team replies within 24 hours on business days. You can also ask Ruth AI — she's available 24/7 inside the platform.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:support@helpmeman.com"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white text-sm font-semibold px-6 py-3 hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Email Support <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 text-zinc-700 text-sm font-semibold px-6 py-3 hover:bg-zinc-50 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-pink-500" />
              Ask Ruth AI
            </Link>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("open-platform-review-modal"));
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 text-amber-800 bg-amber-50 text-sm font-semibold px-6 py-3 hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
            >
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              Give Feedback
            </button>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
