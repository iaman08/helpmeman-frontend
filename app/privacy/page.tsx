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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200">
        <nav className="mx-auto flex max-w-[1000px] items-center justify-between px-6 sm:px-10 py-5">
          <Link href="/" className="font-bold text-xl tracking-tight text-zinc-900 flex items-center gap-2 select-none">
            <img src="/logo.svg" alt="HelpMeMan Logo" className="w-6 h-6 object-contain" />
            <span>HelpMeMan</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            ← Back to home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-[800px] px-6 sm:px-10 pt-28 pb-16 w-full text-zinc-700">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500 font-semibold">
            Legal Agreements
          </p>
          <h1 className="font-bold text-3xl sm:text-4xl text-zinc-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
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
            <h2 className="text-lg font-semibold text-zinc-900">5. Your Rights & Choice</h2>
            <p>
              You have the right to access, rectify, or request deletion of your personal data. You may withdraw consent for receiving marketing communications at any time. To request data deletion or raise a privacy query, contact us at <a href="mailto:hello@helpmeman.com" className="text-zinc-900 hover:text-zinc-700 underline font-medium">hello@helpmeman.com</a>.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
