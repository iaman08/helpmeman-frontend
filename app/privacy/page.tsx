"use client";

import Link from "next/link";
import { FooterSection } from "@/components/landing/FooterSection";

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--hairline)]">
        <nav className="mx-auto flex max-w-[1000px] items-center justify-between px-6 sm:px-10 py-5">
          <Link href="/" className="font-bold text-xl tracking-tight text-[var(--fg)] flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="HelpMeMan Logo" className="w-6 h-6 object-contain" />
            <span>HelpMeMan</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            ← Back to home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-[800px] px-6 sm:px-10 pt-28 pb-16 w-full text-[var(--fg)]/90">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] font-semibold">
            Legal Agreements
          </p>
          <h1 className="font-bold text-3xl sm:text-4xl text-[var(--fg)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            At HelpMeMan, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, process, and share your personal data when you use our website, mobile platform, or other services.
          </p>

          <section className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-zinc-900">1. Information We Collect</h2>
            <p>
              We collect data to provide better services to all of our users. This includes:
            </p>
            <div className="space-y-4 mt-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">A. Account and Profile Credentials</h3>
                <p className="text-zinc-600 text-sm mt-0.5">
                  We collect your full name, email address, password hash, and optional phone number during registration. For Mentors, we also collect public display names, professional bios, employment/academic history, and credentials submitted for identity verification.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">B. Booking & Session Data</h3>
                <p className="text-zinc-600 text-sm mt-0.5">
                  We store date/time of bookings, payment statuses, reference identifiers from payment gateways, session durations, and notes provided by users.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">C. Chat & Communication Logs</h3>
                <p className="text-zinc-600 text-sm mt-0.5">
                  Full text transcripts of messaging logs between Mentees and Mentors, message timestamps, and read indicators.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">D. AI Assistant Interactions</h3>
                <p className="text-zinc-600 text-sm mt-0.5">
                  We record transcripts of chats with our Platform's AI helper and maintain dynamic summary vectors to maintain ongoing context.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">E. Notification & Device Preferences</h3>
                <p className="text-zinc-600 text-sm mt-0.5">
                  Email and push preferences, as well as device tokens (FCM) to trigger transaction notifications.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">2. Third-Party Integrations & System Permissions</h2>
            <p>
              To deliver our services, we integrate with several vetted third-party service providers. By using the platform, you authorize access under the specified scopes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 text-sm">
              <li>
                <strong className="text-zinc-850 text-zinc-900 font-semibold">Google Sign-In (OAuth 2.0):</strong> Facilitates account creation and secure logins via Google OAuth without storing your Google credentials.
              </li>
              <li>
                <strong className="text-zinc-850 text-zinc-900 font-semibold">Google Calendar & Meet:</strong> Automates scheduling and generates unique, secure conference links for video sessions.
              </li>
              <li>
                <strong className="text-zinc-850 text-zinc-900 font-semibold">Web Push Notifications:</strong> Sends real-time device push notifications for session bookings and updates using the standard browser Push API.
              </li>
              <li>
                <strong className="text-zinc-850 text-zinc-900 font-semibold">Razorpay Payment Gateway:</strong> Securely processes payments, validates receipts, and processes refunds.
              </li>
              <li>
                <strong className="text-zinc-850 text-zinc-900 font-semibold">Supabase Storage:</strong> Stores and delivers user avatars, mentor display pictures, and identity screening credentials.
              </li>
              <li>
                <strong className="text-zinc-850 text-zinc-900 font-semibold">Brevo SMTP Service:</strong> Dispatches platform transaction emails, signup verification codes, and alerts.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">3. How We Use Your Data</h2>
            <p>
              We process personal information for purposes including: providing and maintaining the services, facilitating payments, validating credentials, customizing AI help recommendations, complying with legal obligations, and updating you about account statuses or updates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">4. Data Security & Storage</h2>
            <p>
              We employ strict industry-standard security measures, including data encryption in transit and hashing passwords, to prevent unauthorized access or disclosure of your information. We retain personal data as long as necessary to fulfill the services or as required by governing legal compliance standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900">5. Your Rights &amp; Choices</h2>
            <p>
              You have the right to access, rectify, or request deletion of your personal data. You may withdraw consent for receiving marketing communications at any time directly through your account settings or by contacting <a href="mailto:grievance@helpmeman.com" className="text-zinc-900 hover:text-zinc-700 underline font-medium">grievance@helpmeman.com</a>.
            </p>
          </section>

          {/* ─── DPDP Act 2023 Statutory Compliance Section ─── */}
          <section id="dpdp" className="space-y-4 pt-6 border-t border-[var(--hairline)] scroll-mt-32">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Statutory Notice
              </span>
              <h2 className="text-xl font-bold text-zinc-900">
                6. Compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act)
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-zinc-700">
              For users located in India, the collection, processing, storage, and erasure of your digital personal data are strictly governed by the{" "}
              <strong>Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo; / &ldquo;DPDPA&rdquo;)</strong>.
              HelpMeMan Technologies Private Limited functions as a <strong>Data Fiduciary</strong>, and you are recognized under law as a <strong>Data Principal</strong>.
            </p>

            <div className="space-y-4 mt-3">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--hairline)]">
                <h3 className="text-sm font-bold text-zinc-900 mb-1">A. Specified Lawful Purposes of Processing (Section 4 &amp; 5)</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  We process personal data solely for specified purposes for which you have provided free, specific, informed, unconditional, and unambiguous consent, or for legitimate uses permitted under Section 7 of the Act. These purposes include identity authentication, scheduling and facilitating 1-on-1 video mentorship sessions, processing secure booking payments via certified gateways (Razorpay), providing AI-assisted study recommendations (Ruth AI), and complying with statutory tax obligations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--hairline)]">
                <h3 className="text-sm font-bold text-zinc-900 mb-1">B. Enforceable Rights of the Data Principal (Sections 11, 12, 13, 14)</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 leading-relaxed">
                  <li>
                    <strong>Right to Access Information (Section 11):</strong> You may obtain a complete summary of your personal data being processed and third-party identities with whom data was shared. You can generate and download an instant JSON data export at any time in your Settings panel.
                  </li>
                  <li>
                    <strong>Right to Correction &amp; Erasure (Section 12):</strong> You may correct inaccurate or misleading data directly in your profile. You may also execute an irreversible erasure of your personal data (&ldquo;Delete Account&rdquo;) through your Settings dashboard.
                  </li>
                  <li>
                    <strong>Right of Grievance Redressal (Section 13):</strong> You have the right to readily available grievance redressal in respect of any act or omission of HelpMeMan regarding your personal data.
                  </li>
                  <li>
                    <strong>Right to Nominate (Section 14):</strong> You have the right to nominate any individual who, in the event of your death or incapacity, shall exercise your Data Principal rights. To register a nomination, please email our Grievance Officer with the subject line &ldquo;DPDP Nomination&rdquo;.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--hairline)]">
                <h3 className="text-sm font-bold text-zinc-900 mb-1">C. Protection of Children&apos;s Personal Data (Section 9)</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  HelpMeMan takes the privacy of minors seriously. For users under 18 years of age (including high school students preparing for NEET/JEE entrance exams), verifiable consent of a parent or lawful guardian is required before processing personal data. In strict adherence to Section 9 of the DPDP Act, HelpMeMan does not engage in behavioral monitoring, user tracking, or targeted advertising directed at children, nor do we process data in any manner that causes detrimental effects on a child&apos;s well-being.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <h3 className="text-sm font-bold text-zinc-900 mb-1">D. Grievance Redressal Officer &amp; Statutory Resolution Timelines (Section 13)</h3>
                <p className="text-xs text-zinc-600 leading-relaxed mb-3">
                  If you have concerns, inquiries, or complaints regarding the processing of your personal data, please contact our designated Grievance Redressal Officer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-700 bg-white dark:bg-zinc-950 p-3 rounded-xl border border-[var(--hairline)]">
                  <div>
                    <span className="text-zinc-500 font-medium">Designated Officer:</span><br />
                    <strong className="font-semibold">Grievance Redressal &amp; Data Protection Cell</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium">Official Contact Email:</span><br />
                    <a href="mailto:grievance@helpmeman.com" className="text-indigo-600 font-semibold underline">grievance@helpmeman.com</a>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium">Statutory Acknowledgment:</span><br />
                    <strong className="font-semibold">Within 48 Hours</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-medium">Statutory Resolution Timeline:</span><br />
                    <strong className="font-semibold">Within 30 Calendar Days</strong>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-3 leading-normal">
                  <strong>Appellate Escalation:</strong> If your grievance is not acknowledged within 48 hours or resolved within 30 days to your satisfaction, you possess the statutory right under the DPDP Act to submit a complaint directly to the <strong>Data Protection Board of India (DPBI)</strong>.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
