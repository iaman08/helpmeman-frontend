"use client";

import { useEffect, Suspense } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { FaLinkedin } from "react-icons/fa";
import { Sparkles } from "lucide-react";

function CallbackHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = window.location.search;
    const apiBase = getApiBaseUrl();
    // Forward query params to backend LinkedIn callback handler
    window.location.href = `${apiBase}/linkedin/callback${search}`;
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg)] text-[var(--fg)]">
      <div className="flex flex-col items-center gap-5 max-w-sm text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A66C2] text-white shadow-lg animate-pulse">
          <FaLinkedin className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-xl font-display font-semibold tracking-tight">
            Connecting your LinkedIn profile
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
            Ruth AI is receiving your verified credentials...
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-500 font-medium">
          <Sparkles className="h-4 w-4 animate-spin" /> Preparing mentor profile review
        </div>
      </div>
    </div>
  );
}

export default function LinkedInCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
