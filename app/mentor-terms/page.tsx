"use client";

import Link from "next/link";
import { FooterSection } from "@/components/landing/FooterSection";

export default function MentorTermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0A0A0B]/80 border-b border-zinc-800/80">
        <nav className="mx-auto flex max-w-[1000px] items-center justify-between px-6 sm:px-10 py-5">
          <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="HelpMeMan Logo" className="w-6 h-6 object-contain brightness-0 invert" />
            <span>HelpMeMan</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-[800px] px-6 sm:px-10 pt-28 pb-16 w-full text-zinc-300">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#2563EB]">
            Legal Agreements
          </p>
          <h1 className="font-bold text-3xl sm:text-4xl text-white tracking-tight">
            Mentor Terms & Code of Conduct
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            HelpMeMan connects ambitious mentees with elite experts and leaders from top organizations (IITs, AIIMS, FAANG, YC startups, and more). If you apply to join or are approved as a Mentor on HelpMeMan, these Mentor Terms & Code of Conduct apply to you.
          </p>

          <section className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-white">1. Screening & Verification</h2>
            <p>
              To maintain the integrity of our Platform, all Mentors must undergo a credential verification and screening process:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-sm">
              <li>You agree to provide accurate information regarding your current and past employment, academic history, role, company, and graduation year.</li>
              <li>You must verify your institution email address and upload valid documents (degree certificate, employee badge, or work proof).</li>
              <li>HelpMeMan reserves the right to reject any application or revoke mentor status at any time, for any reason, during or after screening.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Professional Code of Conduct</h2>
            <p>
              As a Mentor, you are an ambassador of the HelpMeMan community. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-sm">
              <li><strong className="text-white">Punctuality:</strong> Attend all scheduled sessions on time. If you need to reschedule, notify the mentee and make changes through the platform at least 24 hours in advance.</li>
              <li><strong className="text-white">Professionalism:</strong> Conduct all video calls in a quiet, professional environment. Deliver high-value, constructive guidance, code reviews, resume critiques, or preparation advice.</li>
              <li><strong className="text-white">Academic Integrity:</strong> Never assist with academic cheating, exam-taking, homework completion, or plagiarism. Help mentees *learn*, do not do their work for them.</li>
              <li><strong className="text-white">Harassment & Respect:</strong> Maintain professional boundaries. Do not engage in unsolicited personal communications, discrimination, or harassment.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Platform Disintermediation</h2>
            <p>
              To keep the platform safe and secure, all scheduling, messaging, and payments must happen on the Platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-sm">
              <li>Do not request or accept direct payment from mentees outside HelpMeMan (e.g., via personal UPI, PayPal, or wire transfer).</li>
              <li>Do not request or share personal contact information (such as personal phone numbers, Telegram, or personal email addresses) for mentorship communication off the platform.</li>
              <li>Violating the disintermediation rules will result in immediate suspension, termination, and forfeiture of accrued earnings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Fees, Earnings, & Payouts</h2>
            <p>
              You set your pricing per session within platform guidelines.
            </p>
            <p>
              HelpMeMan deducts a platform service fee from each booking to cover payment gateways, infrastructure, scheduling, and AI features. Net earnings are calculated and updated in your Mentor Dashboard upon the successful completion of a session. Payouts are made directly to your registered bank account on a regular schedule (e.g., weekly/bi-weekly).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Termination & Suspensions</h2>
            <p>
              HelpMeMan reserves the right to suspend or terminate a mentor's account for violation of these Terms, high cancellation rates, low session ratings, code of conduct violations, or if fraud is suspected. Accrued earnings may be withheld in the event of platform rules violations.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
