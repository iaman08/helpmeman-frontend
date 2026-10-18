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
  // 1. User uploaded custom banner
  if (customBannerUrl && customBannerUrl.trim()) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-zinc-950 ${className}`}>
        <img
          src={customBannerUrl.trim()}
          alt="Profile banner"
          className="w-full h-full object-cover"
          style={{ objectPosition: bannerPosition || "50% 50%" }}
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Resolve verified branding from the database
  const brand = useMemo(() => {
    return resolveOrganizationBranding(organization, institutionType);
  }, [organization, institutionType]);

  // If no organization or independent
  if (!brand) {
    return (
      <div
        className={`relative w-full h-full overflow-hidden select-none ${className}`}
        style={{
          background: "linear-gradient(135deg, #0e1219 0%, #161c26 50%, #1e2633 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)",
          }}
        />
      </div>
    );
  }

  // 3. Branded corporate or collegiate banner
  return (
    <div
      className={`relative w-full h-full flex items-center justify-between px-5 sm:px-7 overflow-hidden select-none ${className}`}
      style={{
        background: brand.bannerBg,
      }}
    >
      {/* Subtle modern geometric mesh texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Branding Logo & Typographic Identity */}
      <div className="relative z-10 flex items-center gap-3">
        {brand.logoUrl ? (
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-full h-full object-contain filter drop-shadow-sm"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 text-white font-bold text-xs tracking-wider shadow-sm">
            {brand.shortName.slice(0, 3).toUpperCase()}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-white font-extrabold tracking-wider text-sm sm:text-base font-display leading-tight truncate">
            {brand.shortName.toUpperCase()}
          </span>
          <span className="text-white/70 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase truncate">
            {brand.subtext || brand.name}
          </span>
        </div>
      </div>
    </div>
  );
}
