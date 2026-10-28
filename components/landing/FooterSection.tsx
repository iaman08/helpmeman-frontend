"use client";

import Link from "next/link";

import { openTawkChat } from "@/components/TawkToScript";
import { openDpdpNotice } from "@/components/CookieConsentBanner";

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-footer py-10 md:py-14 dark:bg-white dark:text-neutral-900 border-t border-transparent dark:border-neutral-200 transition-colors">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-8">
          {/* Logo & Tagline column */}
          <div className="md:col-span-6 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="HelpMeMan Logo" className="w-8 h-8 object-contain rounded-md border border-white/20 dark:border-neutral-300" />
              <span className="font-semibold text-[20px] tracking-tight text-white dark:text-neutral-900">
                HelpMeMan
              </span>
            </div>
            <p className="text-[15px] text-[#8E8E93] dark:text-neutral-600 leading-relaxed max-w-sm">
              Connecting students and professionals with verified mentors from
              IITs, AIIMS, FAANG, and YC startups.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://x.com/helpmemanHQ"
                target="_blank"
                rel="noreferrer"
                aria-label="HelpMeMan on X (formerly Twitter)"
                title="Follow HelpMeMan on X"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] dark:bg-neutral-100 border border-[#2A2A2E] dark:border-neutral-200 flex items-center justify-center hover:bg-[#252528] dark:hover:bg-neutral-200 hover:border-[#3A3A3E] dark:hover:border-neutral-300 transition-all group cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-[#8E8E93] dark:text-neutral-700 group-hover:text-white dark:group-hover:text-black transition-colors">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/helpmemanhq?igsi=bTk5bmFtZjJlNnhp"
                target="_blank"
                rel="noreferrer"
                aria-label="HelpMeMan on Instagram"
                title="Follow HelpMeMan on Instagram"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] dark:bg-neutral-100 border border-[#2A2A2E] dark:border-neutral-200 flex items-center justify-center hover:bg-[#E4405F]/15 dark:hover:bg-[#E4405F]/10 hover:border-[#E4405F]/40 transition-all group cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#E4405F] group-hover:text-[#FF4D79] transition-colors">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/helpmeman"
                target="_blank"
                rel="noreferrer"
                aria-label="HelpMeMan on LinkedIn"
                title="Follow HelpMeMan on LinkedIn"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] dark:bg-neutral-100 border border-[#2A2A2E] dark:border-neutral-200 flex items-center justify-center hover:bg-[#0A66C2]/15 dark:hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/40 transition-all group cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A66C2] group-hover:text-[#0082FB] transition-colors">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right link columns */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-[13px] font-semibold text-white dark:text-neutral-900 uppercase tracking-[0.06em]">
              Explore
            </h4>
            <div className="flex flex-col gap-2.5 text-[15px] text-[#8E8E93] dark:text-neutral-600">
              <Link href="/services" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                All Services
              </Link>
              <Link href="/?auth=signup" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Browse Mentors
              </Link>
              <a href="#success" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Success Stories
              </a>
              <a href="#pricing" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Pricing
              </a>
              <a href="#about" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Ask AI
              </a>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-[13px] font-semibold text-white dark:text-neutral-900 uppercase tracking-[0.06em]">
              Support & Community
            </h4>
            <div className="flex flex-col gap-2.5 text-[15px] text-[#8E8E93] dark:text-neutral-600">
              <button
                type="button"
                onClick={() => openTawkChat()}
                className="text-left bg-transparent border-none p-0 cursor-pointer text-[#8E8E93] dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 transition-colors text-[15px]"
              >
                Live Chat Support
              </button>
              <Link href="/help" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Help and Guidelines
              </Link>
              <Link href="/privacy#dpdp" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                DPDP Act Compliance
              </Link>
              <Link href="/apply-mentor" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Apply as Mentor
              </Link>
              <Link href="/?auth=signup" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Join HelpMeMan
              </Link>
              <a href="mailto:hello@helpmeman.com" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-[#1F1F23] dark:border-neutral-200">
          <p className="text-[13px] text-[#8E8E93] dark:text-neutral-500 order-2 sm:order-1">
            &copy; {currentYear} HelpMeMan. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[#8E8E93] dark:text-neutral-600 order-1 sm:order-2 justify-center sm:justify-end">
            <Link href="/terms" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
              Privacy Policy
            </Link>
            <button
              type="button"
              onClick={() => openDpdpNotice()}
              className="hover:text-white dark:hover:text-neutral-900 transition-colors cursor-pointer text-[13px] text-[#8E8E93] dark:text-neutral-600 bg-transparent border-none p-0 inline-block"
            >
              DPDP Act
            </button>
            <Link href="/refund-policy" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
              Refund Policy
            </Link>
            <Link href="/mentor-terms" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
              Mentor Terms
            </Link>
            <Link href="/code-of-conduct" className="hover:text-white dark:hover:text-neutral-900 transition-colors">
              Mentor Code of Conduct
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
