"use client";

import Link from "next/link";
import { FooterSection } from "@/components/landing/FooterSection";

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to HelpMeMan. Please read these Terms & Conditions ("Terms") carefully. By registering for, accessing, or using the HelpMeMan mentorship platform (collectively, the "Platform" or "Services"), you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Platform.
          </p>

          <section className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-white">1. Platform Overview</h2>
            <p>
              HelpMeMan is an intermediary technology platform operated to connect students, professionals, and career transitioners ("Mentees") with verified industry and academic mentors ("Mentors"). HelpMeMan provides booking infrastructure, secure payment processing, audio-visual scheduling, and communications tools to facilitate mentorship.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Eligibility & Accounts</h2>
            <p>
              To create an account and register on the Platform, you must be at least 18 years of age or have the consent of a parent or legal guardian. You agree to provide accurate, complete, and up-to-date information during the registration process and to maintain the confidentiality of your account credentials. You are solely responsible for all activities conducted through your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. User Code of Conduct</h2>
            <p>
              Mentees and Mentors agree to conduct all interactions in a professional, respectful, and ethical manner. Specifically:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Mentees shall not request, and Mentors shall not provide, assistance that constitutes academic dishonesty (e.g., writing exams, completing homework, or plagiarism).</li>
              <li>Users must not share personal contact details (such as phone numbers or personal emails) or conduct financial transactions off the Platform.</li>
              <li>Any harassment, hate speech, or inappropriate behavior will result in immediate suspension or termination of the account without refund.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Bookings & Payments</h2>
            <p>
              All sessions are booked and paid for in advance via our integrated payment gateway (Razorpay). Upon successful payment, a confirmation email and booking details will be provided. The rates per session are set by the individual Mentors and are subject to platform fees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">5. Intellectual Property</h2>
            <p>
              The design, source code, logos, trademarks, content, and materials available on HelpMeMan are the exclusive intellectual property of the Platform or its licensors. You are granted a limited, non-exclusive, non-transferable license to access the Platform for your personal, non-commercial use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">6. Limitation of Liability</h2>
            <p>
              HelpMeMan acts as an intermediary connection service. We do not guarantee the accuracy, completeness, or suitability of advice provided by Mentors. To the maximum extent permitted by law, HelpMeMan shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform or the advice received.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">7. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">8. Amendments</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will notify you of major updates by posting notices on the Platform or sending email updates. Continued use of the Platform after changes are published constitutes your acceptance of the revised Terms.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
