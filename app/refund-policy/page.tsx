"use client";

import Link from "next/link";
import { FooterSection } from "@/components/landing/FooterSection";

export default function RefundPolicyPage() {
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
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Thank you for booking mentorship sessions on HelpMeMan. This Refund & Cancellation Policy governs bookings, rescheduling, cancellations, and refund eligibility for all sessions booked through our Platform.
          </p>

          <section className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-white">1. Cancellation by Mentee</h2>
            <p>
              We understand that schedules change. Mentee cancellations are subject to the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-sm">
              <li>
                <strong className="text-white">More than 24 hours notice:</strong> If you cancel or request a reschedule at least 24 hours before the scheduled start time of the session, you are eligible for a <strong className="text-[#2563EB]">100% refund</strong> of the booking amount, or a free reschedule.
              </li>
              <li>
                <strong className="text-white">Less than 24 hours notice:</strong> Cancellations or reschedule requests made within 24 hours of the scheduled start time are <strong className="text-red-500">non-refundable</strong>. The Mentor reserves their time exclusively for your session, making it difficult to fill the slot at short notice.
              </li>
              <li>
                <strong className="text-white">No-Shows:</strong> If you fail to join the scheduled session within 15 minutes of the start time, it will be marked as a "No-Show" and is non-refundable.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">2. Cancellation by Mentor</h2>
            <p>
              In the rare event that a Mentor needs to cancel a scheduled session:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-sm">
              <li>You will receive a notification immediately.</li>
              <li>You will be offered the option to either reschedule the session to a mutually convenient time or receive a <strong className="text-[#2563EB]">100% full refund</strong>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">3. Refund Processing & Timelines</h2>
            <p>
              All eligible refunds will be initiated automatically and credited back to the original payment source (credit card, debit card, UPI, or net banking) via our payment gateway partner, Razorpay.
            </p>
            <p>
              Please allow <strong className="text-white">5 to 7 business days</strong> for the refunded amount to reflect in your bank account, depending on your bank's processing cycles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">4. Dispute Resolution & Assistance</h2>
            <p>
              If you experience technical issues (such as internet connectivity failure on the mentor's side or platform errors) that prevent the successful completion of a session, please report the issue to us within 24 hours of the session.
            </p>
            <p>
              We will investigate the logs and facilitate an amicable resolution, which may include credit, rescheduling, or a full refund. Please contact support at <a href="mailto:hello@helpmeman.com" className="text-[#2563EB] hover:underline font-medium">hello@helpmeman.com</a>.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
