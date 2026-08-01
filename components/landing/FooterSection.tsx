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
                href="https://x.com/helpmeman"
                target="_blank"
                rel="noreferrer"
                aria-label="HelpMeMan on X (formerly Twitter)"
                title="Follow HelpMeMan on X"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center hover:bg-[#252528] hover:border-[#3A3A3E] transition-all group cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-[#8E8E93] group-hover:text-white transition-colors">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/helpmeman"
                target="_blank"
                rel="noreferrer"
                aria-label="HelpMeMan on Instagram"
                title="Follow HelpMeMan on Instagram"
                className="w-9 h-9 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center hover:bg-[#252528] hover:border-[#3A3A3E] transition-all group cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8E8E93] group-hover:text-white transition-colors">
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
                className="w-9 h-9 rounded-full bg-[#1A1A1E] border border-[#2A2A2E] flex items-center justify-center hover:bg-[#252528] hover:border-[#3A3A3E] transition-all group cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8E8E93] group-hover:text-white transition-colors">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
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
              <Link href="/team" className="hover:text-white transition-colors">
                Our Team
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
              <Link href="/apply-mentor" className="hover:text-white transition-colors">
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
