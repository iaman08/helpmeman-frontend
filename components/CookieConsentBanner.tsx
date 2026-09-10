"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = localStorage.getItem("helpmeman.dpdp_cookie_consent");
    if (!existing) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      "helpmeman.dpdp_cookie_consent",
      JSON.stringify({ type: "ALL", date: new Date().toISOString() })
    );
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(
      "helpmeman.dpdp_cookie_consent",
      JSON.stringify({ type: "ESSENTIAL", date: new Date().toISOString() })
    );
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <aside
      aria-label="Cookie and DPDP Privacy Notice"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl border border-[var(--hairline)] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
      style={{
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            DPDP Act 2023 Notice
          </span>
        </div>
        <button
          onClick={handleEssentialOnly}
          aria-label="Dismiss cookie notice"
          className="p-1 rounded-lg hover:bg-[var(--fg)]/10 transition-colors text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        HelpMeMan uses essential cookies and processes digital personal data in accordance with India&apos;s{" "}
        <strong className="text-[var(--fg)] font-semibold">Digital Personal Data Protection Act, 2023</strong>.
        You may accept optional personalization cookies or choose essential only.
      </p>

      <div className="mt-4 pt-3 border-t border-[var(--hairline)] flex flex-wrap items-center justify-between gap-2.5">
        <Link
          href="/privacy#dpdp"
          className="text-[11px] underline text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
        >
          Read DPDP Rights
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-[var(--hairline)] hover:bg-[var(--fg)]/5 transition-colors cursor-pointer text-[var(--fg)]"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shadow transition-opacity hover:opacity-90"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
