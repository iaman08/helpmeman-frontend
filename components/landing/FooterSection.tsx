"use client";

import Link from "next/link";

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="landing-footer py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-16">
          {/* Logo & Tagline column */}
          <div className="md:col-span-6 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="HelpMeMan Logo" className="w-8 h-8 object-contain brightness-0 invert" />
              <span className="font-bold text-[20px] tracking-tight text-white">
                HelpMeMan
              </span>
            </div>
            <p className="text-[14px] text-[#8E8E93] leading-relaxed max-w-sm">
              Connecting students and professionals with verified mentors from
              IITs, AIIMS, FAANG, and YC startups.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center hover:bg-[#252528] hover:border-[#3A3A3E] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center hover:bg-[#252528] hover:border-[#3A3A3E] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center hover:bg-[#252528] hover:border-[#3A3A3E] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right link columns */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-[13px] font-bold text-white uppercase tracking-[0.1em]">
              Explore
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px] text-[#8E8E93]">
              <Link href="/?auth=signup" className="hover:text-white transition-colors">
                Browse Mentors
              </Link>
              <a href="#success" className="hover:text-white transition-colors">
                Success Stories
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                Ask AI
              </a>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-[13px] font-bold text-white uppercase tracking-[0.1em]">
              Support & Community
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px] text-[#8E8E93]">
              <Link href="/help" className="hover:text-white transition-colors">
                Help and Guidelines
              </Link>
              <Link href="/?auth=signup" className="hover:text-white transition-colors">
                Apply as Mentor
              </Link>
              <Link href="/?auth=signup" className="hover:text-white transition-colors">
                Join HelpMeMan
              </Link>
              <a href="mailto:hello@helpmeman.com" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-[#1F1F23]">
          <p className="text-[12px] text-[#8E8E93] order-2 sm:order-1">
            &copy; {currentYear} HelpMeMan. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#8E8E93] order-1 sm:order-2 justify-center sm:justify-end">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund & Cancellation Policy
            </Link>
            <Link href="/mentor-terms" className="hover:text-white transition-colors">
              Mentor Terms & Code of Conduct
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
