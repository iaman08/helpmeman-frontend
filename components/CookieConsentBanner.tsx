"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export function openDpdpNotice() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-dpdp-notice"));
  }
}

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [consentType, setConsentType] = useState<"ALL" | "ESSENTIAL" | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const existing = localStorage.getItem("helpmeman.dpdp_cookie_consent");
      if (existing) {
        const parsed = JSON.parse(existing);
        setConsentType(parsed.type || "ESSENTIAL");
      }
    } catch {
      // Ignore parse errors
    }

    const handleOpen = () => setVisible(true);
    window.addEventListener("open-dpdp-notice", handleOpen);
    return () => window.removeEventListener("open-dpdp-notice", handleOpen);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      "helpmeman.dpdp_cookie_consent",
      JSON.stringify({ type: "ALL", date: new Date().toISOString() })
    );
    setConsentType("ALL");
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(
      "helpmeman.dpdp_cookie_consent",
      JSON.stringify({ type: "ESSENTIAL", date: new Date().toISOString() })
    );
    setConsentType("ESSENTIAL");
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="DPDP Act 2023 Statutory Notice and Cookie Preferences"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setVisible(false);
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--hairline)] space-y-5 animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--bg)",
          color: "var(--fg)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  DPDP Act 2023 Notice
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Statutory
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Digital Personal Data Protection Act, 2023 Compliance
              </p>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Close DPDP Act notice"
            className="p-2 rounded-xl hover:bg-[var(--fg)]/10 transition-colors text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-[var(--muted)]">
          HelpMeMan processes digital personal data in strict compliance with India&apos;s{" "}
          <strong className="text-[var(--fg)] font-semibold">Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
          We only process data for specified lawful purposes: identity authentication, mentorship session scheduling, and secure transactions.
        </p>

        <div className="p-4 rounded-2xl bg-[var(--fg)]/3 border border-[var(--hairline)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--muted)] font-medium">Your Current Preference:</span>
            <span className="font-semibold text-[var(--fg)] px-2.5 py-0.5 rounded-lg bg-[var(--fg)]/5 border border-[var(--hairline)]">
              {consentType === "ALL" ? "All Cookies & Personalization Accepted" : "Essential Only (Privacy-Preserving)"}
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted)] leading-normal">
            Essential cookies are required for platform security and authentication. Optional cookies help personalize your mentorship recommendations.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--hairline)]">
          <Link
            href="/privacy#dpdp"
            onClick={() => setVisible(false)}
            className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline transition-colors order-2 sm:order-1"
          >
            Read Complete DPDP Rights &rarr;
          </Link>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--hairline)] hover:bg-[var(--fg)]/5 transition-colors cursor-pointer text-[var(--fg)] ${
                consentType === "ESSENTIAL" ? "ring-2 ring-amber-500/40" : ""
              }`}
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow transition-opacity hover:opacity-90"
              style={{ background: "var(--fg)", color: "var(--bg)" }}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
