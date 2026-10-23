"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Share2,
  Globe,
  Star,
  X,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { BrandBanner } from "./BrandBanner";
import { GoldenVerifiedBadge } from "./GoldenVerifiedBadge";
import { PriceDisplay } from "./PriceDisplay";
import { resolveOrganizationBranding } from "@/lib/organization-branding-db";
import type { Mentor, User } from "@/lib/types";

export interface ProfileCardProps {
  profile?: User | null;
  mentor?: Mentor | null;
  mode?: "mentor" | "user";
  onShare?: (data: Mentor | User) => void;
  className?: string;
  isCompact?: boolean;
}

/**
 * Clean up verbose or parenthetical titles for crisp display
 */
function cleanHeadline(rawTitle?: string | null): string {
  if (!rawTitle) return "Mentor";

  // Remove bulky autobiographical parentheticals like "(I am a sophomore, second year in BTech...)"
  let clean = rawTitle.replace(/\s*\([^)]*\)/g, "").trim();

  if (clean.length < 3 && rawTitle.includes("(")) {
    clean = rawTitle.split("(")[0].trim();
  }

  return clean || rawTitle;
}

export function ProfileCard({
  profile,
  mentor,
  mode = mentor ? "mentor" : "user",
  onShare,
  className = "",
}: ProfileCardProps) {
  const [isAvatarEnlarged, setIsAvatarEnlarged] = useState(false);

  // Extract normalized fields from either mentor or user
  const id = mentor?.id || profile?.id || "";
  const userId = mentor?.userId || profile?.id || "";
  const name =
    mentor?.displayName ||
    mentor?.user?.name ||
    profile?.name ||
    "Professional";
  const username = profile?.username || mentor?.user?.username || null;
  const avatarUrl =
    mentor?.avatar ||
    mentor?.user?.avatar ||
    profile?.avatar ||
    null;

  // Clean real organization (company or university), ignoring 'independent'
  const rawOrg =
    (mentor?.company && mentor.company.toLowerCase() !== "independent" ? mentor.company : null) ||
    (mentor?.institutionName && mentor.institutionName.toLowerCase() !== "independent" ? mentor.institutionName : null) ||
    (profile?.currentCompany && profile.currentCompany.toLowerCase() !== "independent" ? profile.currentCompany : null) ||
    profile?.university ||
    null;

  const institution = rawOrg
    ? rawOrg.replace(/^(currently\s+at|studying\s+at|working\s+at|student\s+at)\s+/i, "").trim()
    : null;

  const brand = useMemo(() => {
    return resolveOrganizationBranding(institution, mentor?.institutionType);
  }, [institution, mentor?.institutionType]);

  const rawHeadline =
    mentor?.headline ||
    mentor?.currentRole ||
    profile?.headline ||
    profile?.currentRole ||
    profile?.jobTitle ||
    null;

  const displayHeadline = cleanHeadline(rawHeadline);

  // Location
  const location =
    mentor?.location ||
    [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") ||
    null;
  const shortLocation = location ? location.split(",")[0].trim() : null;

  // Skills
  const skills: string[] = useMemo(() => {
    if (mentor?.expertise && mentor.expertise.length > 0) return mentor.expertise;
    if (profile?.skills && profile.skills.length > 0) return profile.skills;
    return [];
  }, [mentor?.expertise, profile?.skills]);

  // Languages Spoken
  const languagesList: Array<{ name: string; proficiency?: string }> = useMemo(() => {
    if (mentor?.userLanguages && mentor.userLanguages.length > 0) {
      return mentor.userLanguages.map(l => ({ name: l.languageName, proficiency: l.proficiency }));
    }
    if (profile?.languages && profile.languages.length > 0) {
      return profile.languages.map(l => ({ name: l.languageName, proficiency: l.proficiency }));
    }
    if (mentor?.languages) {
      if (Array.isArray(mentor.languages)) {
        return mentor.languages.map(l => ({ name: l }));
      }
      if (typeof mentor.languages === "string") {
        return mentor.languages.split(",").map(l => ({ name: l.trim() }));
      }
    }
    return [];
  }, [mentor?.userLanguages, profile?.languages, mentor?.languages]);

  const [avatarError, setAvatarError] = useState(false);

  // Fallback initials
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const customBannerUrl = mentor?.bannerImageUrl || profile?.bannerImageUrl || null;
  const bannerPosition = mentor?.bannerPosition || profile?.bannerPosition || "50% 50%";

  const isMentorMode = mode === "mentor" && mentor != null;
  const profileLink = isMentorMode
    ? `/mentors/${mentor.id}`
    : username
    ? `/${username}`
    : `/mentors/${id}`;

  const ratingCount = mentor?.totalSessions || 0;

  return (
    <>
      <div
        className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${className}`}
      >
        {/* ─── 1. Official Corporate / Collegiate Brand Banner ─── */}
        <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-zinc-950 shrink-0">
          <BrandBanner
            customBannerUrl={customBannerUrl}
            bannerPosition={bannerPosition}
            organization={institution}
            institutionType={mentor?.institutionType}
          />

          {/* Subtle share button in corner */}
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShare(mentor || (profile as any));
              }}
              className="absolute top-2.5 right-3 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
              title="Share profile"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* ─── 2. Card Body ─── */}
        <div className="flex flex-col flex-1 px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
          {/* Avatar Row */}
          <div className="flex items-end justify-between -mt-10 sm:-mt-11 mb-2.5">
            {/* Click Avatar to Enlarge */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (avatarUrl && !avatarError) {
                  setIsAvatarEnlarged(true);
                }
              }}
              className="relative block shrink-0 z-10 cursor-pointer group/avatar focus:outline-hidden"
              title="Click to enlarge profile photo"
            >
              <div className="relative h-[72px] w-[72px] sm:h-20 sm:w-20 rounded-full overflow-hidden shadow-md ring-4 ring-white dark:ring-zinc-900 bg-neutral-100 dark:bg-zinc-800 transition-transform duration-300 group-hover/avatar:scale-105">
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg sm:text-xl font-bold text-white bg-zinc-900 select-none">
                    {initials}
                  </div>
                )}
              </div>

              {/* Active Online Indicator */}
              {mentor?.isOnline && (
                <span
                  className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs"
                  title="Active now"
                />
              )}
            </button>
          </div>

          {/* ─── Organization Badge at Top (Matching Reference Image 2: [ IIT Madras ]) ─── */}
          {(brand || institution) && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40">
                {brand?.shortName || institution}
              </span>
            </div>
          )}

          {/* ─── Name & Golden 16-Lobe Rosette Tick (Matching Reference Image 1) ─── */}
          <div className="min-w-0">
            <Link
              href={profileLink}
              className="inline-flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-neutral-900 dark:text-white hover:underline truncate max-w-full"
            >
              <span className="truncate">{name}</span>
              {/* Golden 16-Lobe Rosette Tick */}
              <GoldenVerifiedBadge size={18} className="h-4.5 w-4.5" />
            </Link>

            {/* Clean, punchy subtitle role (Matching Image 2) */}
            <p className="text-xs sm:text-[13px] font-medium text-neutral-600 dark:text-neutral-300 truncate mt-1">
              {displayHeadline}
            </p>
          </div>

          {/* ─── Skills Tags (Matching Image 2: [Tech] [Ops]) ─── */}
          {skills.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              {skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 border border-neutral-200/60 dark:border-zinc-700/60"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 pl-0.5">
                  +{skills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* ─── Rating Row: 5 Gold Stars with Review Count (Matching Image 2: ★★★★★ (36)) ─── */}
          <div className="mt-3.5 flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium ml-0.5">
              ({ratingCount})
            </span>
          </div>

          {/* ─── Languages: Properly Visible & Premium ─── */}
          {languagesList.length > 0 && (
            <div className="mt-3.5 flex items-center gap-2 text-xs">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">
                Languages:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {languagesList.slice(0, 3).map((l, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 border border-neutral-200/80 dark:border-zinc-700/80 shadow-2xs"
                  >
                    {l.name}
                  </span>
                ))}
                {languagesList.length > 3 && (
                  <span className="text-[10px] font-medium text-neutral-400">
                    +{languagesList.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ─── Location: Properly Visible & Premium in its Own Row ─── */}
          {location && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
              <MapPin className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* ─── Action Footer (Matching Image 2: ₹999/session      Book →) ─── */}
          <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-neutral-100 dark:border-zinc-800">
            {isMentorMode ? (
              <>
                {/* Clean Price Display: ₹999/session */}
                <div className="flex items-baseline gap-0.5">
                  <span className="font-display text-base font-bold text-neutral-900 dark:text-white">
                    <PriceDisplay amountInPaise={mentor.pricePerSession} />
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                    /session
                  </span>
                </div>

                {/* Direct Link matching Image 2: Book → */}
                <Link
                  href={profileLink}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group-hover:translate-x-0.5 duration-200"
                >
                  <span>Book</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <>
                {/* User Socials */}
                <div className="flex items-center gap-2">
                  {profile?.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      title="Website"
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {profile?.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-neutral-400 hover:text-[#0a66c2] transition-colors"
                      title="LinkedIn"
                    >
                      <FaLinkedin className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {profile?.socialLinks?.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      title="GitHub"
                    >
                      <FaGithub className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <Link
                  href={profileLink}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <span>View</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Profile Photo Enlarge Lightbox / Modal ─── */}
      {isAvatarEnlarged && avatarUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAvatarEnlarged(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col items-center gap-4 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAvatarEnlarged(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* High-res Image */}
            <div className="h-56 w-56 sm:h-64 sm:w-64 rounded-full overflow-hidden ring-4 ring-white/20 shadow-xl bg-zinc-950 mt-2">
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <h3 className="font-display font-bold text-lg text-white flex items-center justify-center gap-1.5">
                <span>{name}</span>
                <GoldenVerifiedBadge size={18} className="h-4.5 w-4.5" />
              </h3>
              {displayHeadline && (
                <p className="text-xs text-zinc-400 mt-0.5">{displayHeadline}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
