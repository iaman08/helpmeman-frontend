"use client";

import { useState } from "react";
import { Building2, GraduationCap } from "lucide-react";
import type { OrganizationBranding } from "@/lib/types";

// Static mapping of verified local and CDN logos for top organizations
const LOGO_MAP: Record<string, string> = {
  // FAANG & Top Tech
  google: "/logos/google.svg",
  meta: "/logos/meta.svg",
  amazon: "/logos/amazon.svg",
  microsoft: "/logos/microsoft.svg",
  apple: "/logos/apple.svg",
  netflix: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/netflix.svg",
  uber: "/logos/uber.svg",
  spotify: "/logos/spotify.svg",
  adobe: "/logos/adobe.svg",
  airbnb: "/logos/airbnb.svg",
  figma: "/logos/figma.svg",
  slack: "/logos/slack.svg",
  cultfit: "/logos/cultfit.svg",
  apollo: "/logos/apollo.svg",
  unilever: "/logos/unilever.svg",
  goldman: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/goldmansachs.svg",
  goldmansachs: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/goldmansachs.svg",
  mckinsey: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mckinsey.svg",

  // Top Institutes & Universities
  aiims: "/aiimsdelhi.png",
  aiimsdelhi: "/aiimsdelhi.png",
  nlsiu: "/nlsiu.png",
  iit: "https://api.iconify.design/lucide:graduation-cap.svg?color=%232563eb",
  nit: "https://api.iconify.design/lucide:graduation-cap.svg?color=%232563eb",
  stanford: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/stanford.svg",
  harvard: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/harvard.svg",
  mit: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mit.svg",
};

interface Props {
  name?: string;
  type?: "COMPANY" | "UNIVERSITY" | "COLLEGE" | "STARTUP" | string;
  branding?: OrganizationBranding | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function OrganizationLogo({
  name,
  type = "COMPANY",
  branding,
  className = "",
  size = "md",
}: Props) {
  const [hasError, setHasError] = useState(false);

  const resolvedName = name || branding?.name || "";
  if (!resolvedName || !resolvedName.trim()) return null;

  const trimmed = resolvedName.trim();
  const lower = trimmed.toLowerCase();
  const isEdu =
    type === "COLLEGE" ||
    type === "UNIVERSITY" ||
    lower.includes("iit") ||
    lower.includes("nit") ||
    lower.includes("university") ||
    lower.includes("college") ||
    lower.includes("institute");

  // Determine logo URL
  let resolvedLogoUrl = branding?.logoUrl;
  if (!resolvedLogoUrl) {
    for (const [key, path] of Object.entries(LOGO_MAP)) {
      if (lower.includes(key)) {
        resolvedLogoUrl = path;
        break;
      }
    }
  }

  // Size configurations
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-6 w-6",
  }[size];

  const badgeIconSize = {
    sm: 11,
    md: 13,
    lg: 16,
  }[size];

  // If logo URL is available and has not errored, render logo image
  if (resolvedLogoUrl && !hasError) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 rounded-md bg-white p-0.5 border border-black/10 overflow-hidden shadow-xs ${className}`}
        style={{ width: size === "sm" ? 18 : size === "md" ? 20 : 26, height: size === "sm" ? 18 : size === "md" ? 20 : 26 }}
      >
        <img
          src={resolvedLogoUrl}
          alt={trimmed}
          className={`${sizeClasses} object-contain`}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: A crisp, polished text-based organization badge
  const initial = trimmed.charAt(0).toUpperCase();

  return (
    <div
      className={`flex items-center justify-center shrink-0 rounded-md text-[10px] font-bold shadow-xs select-none ${className}`}
      style={{
        width: size === "sm" ? 18 : size === "md" ? 20 : 26,
        height: size === "sm" ? 18 : size === "md" ? 20 : 26,
        background: isEdu
          ? "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)"
          : "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
        color: "#ffffff",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
      title={trimmed}
    >
      {initial}
    </div>
  );
}

/**
 * OrganizationBadge: Render organization logo + name in a subtle, refined pill
 */
export function OrganizationBadge({
  name,
  type = "COMPANY",
  branding,
  jobTitle,
  className = "",
}: {
  name?: string | null;
  type?: "COMPANY" | "UNIVERSITY" | "COLLEGE" | "STARTUP" | string;
  branding?: OrganizationBranding | null;
  jobTitle?: string | null;
  className?: string;
}) {
  if (!name && !jobTitle) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium max-w-full truncate transition-colors ${className}`}
      style={{
        background: "color-mix(in srgb, var(--fg) 5%, transparent)",
        border: "1px solid var(--hairline)",
        color: "var(--fg)",
      }}
    >
      {name && (
        <OrganizationLogo
          name={name}
          type={type}
          branding={branding}
          size="sm"
        />
      )}
      <span className="truncate">
        {jobTitle && name ? (
          <>
            <span className="font-semibold">{jobTitle}</span>
            <span className="opacity-40 mx-1">·</span>
            <span className="opacity-80">{name}</span>
          </>
        ) : (
          <span className="font-medium">{name || jobTitle}</span>
        )}
      </span>
    </div>
  );
}
