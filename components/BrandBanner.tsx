"use client";

import { useMemo } from "react";
import { resolveOrganizationBranding } from "@/lib/organization-branding-db";

interface BrandBannerProps {
  customBannerUrl?: string | null;
  bannerPosition?: string | null;
  organization?: string | null;
  institutionType?: string | null;
  className?: string;
}

export function BrandBanner({
  customBannerUrl,
  bannerPosition = "50% 50%",
  organization,
  institutionType,
  className = "",
}: BrandBannerProps) {
  // Resolve verified branding from the database. Must run before any early
  // return: calling it after the `customBannerUrl` branch meant the hook count
  // changed whenever a custom banner was set or cleared.
  const brand = useMemo(() => {
    return resolveOrganizationBranding(organization, institutionType);
  }, [organization, institutionType]);

  // 1. User uploaded custom banner
  if (customBannerUrl && customBannerUrl.trim()) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-neutral-100 dark:bg-zinc-800 ${className}`}>
        <img
          src={customBannerUrl.trim()}
          alt="Profile banner"
          className="w-full h-full object-cover transition-opacity duration-200"
          style={{ objectPosition: bannerPosition || "50% 50%" }}
          loading="lazy"
        />
      </div>
    );
  }

  // If no organization or independent
  if (!brand) {
    return (
      <div
        className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-r from-neutral-100 via-neutral-200/60 to-neutral-100 dark:from-zinc-900 dark:via-zinc-800/80 dark:to-zinc-900 border-b border-[var(--hairline)] ${className}`}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-neutral-200 dark:bg-white/[0.06] pointer-events-none" />
      </div>
    );
  }

  // 3. Branded corporate or collegiate banner
  return (
    <div
      className={`relative w-full h-full flex items-center justify-between px-5 sm:px-7 overflow-hidden select-none ${className}`}
      style={{
        backgroundColor: brand.bannerBg || "#121316",
      }}
    >
      {/* Subtle luxury edge highlight */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06] pointer-events-none" />

      {/* Main Branding Logo & Typographic Identity */}
      <div className="relative z-10 flex items-center gap-3">
        {brand.logoUrl ? (
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/15 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-full h-full object-contain filter drop-shadow-sm"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0 text-white font-bold text-xs tracking-wider shadow-sm">
            {brand.shortName.slice(0, 3).toUpperCase()}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold tracking-wide text-sm sm:text-base font-display leading-tight truncate">
            {brand.shortName.toUpperCase()}
          </span>
          <span className="text-white/60 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase truncate">
            {brand.subtext || brand.name}
          </span>
        </div>
      </div>
    </div>
  );
}
