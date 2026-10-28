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
  Clock3,
  MessagesSquare,
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { BrandBanner } from "./BrandBanner";
import { GoldenVerifiedBadge } from "./GoldenVerifiedBadge";
import { PriceDisplay } from "./PriceDisplay";
import { resolveOrganizationBranding } from "@/lib/organization-branding-db";
import type { Mentor, User } from "@/lib/types";
import styles from "./ProfileCard.module.css";
import { Dialog } from "@base-ui/react/dialog";
import surfaces from "./PublicDialog.module.css";

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
  }, [mentor, profile]);

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

  const sessionCount = mentor?.totalSessions || 0;
  const rating = Number(mentor?.rating) || 0;

  return (
    <Dialog.Root open={isAvatarEnlarged} onOpenChange={setIsAvatarEnlarged}>
      <article className={`${styles.card} ${className}`}>
        <div className={styles.cover}>
          <BrandBanner customBannerUrl={customBannerUrl} bannerPosition={bannerPosition} organization={institution} institutionType={mentor?.institutionType} className={customBannerUrl ? "" : styles.coverArtwork} />
          {onShare && (mentor || profile) && (
            <button type="button" aria-label={`Share ${name}'s profile`} onClick={() => onShare(mentor || profile!)} className={styles.share}><Share2 size={16} /></button>
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.identityRow}>
            <Dialog.Trigger disabled={!avatarUrl || avatarError} className={styles.avatarButton} aria-label={`Enlarge ${name}'s profile photo`}>
              <span className={styles.avatar}>
                {avatarUrl && !avatarError ? <img src={avatarUrl} alt={name} onError={() => setAvatarError(true)} loading="lazy" /> : <span>{initials}</span>}
              </span>
              {mentor?.isOnline && <span className={styles.online} title="Active now" />}
            </Dialog.Trigger>
            {institution && <span className={styles.organization} title={institution}>{brand?.shortName || institution}</span>}
          </div>
          <div className={styles.identity}>
            <Link href={profileLink} className={styles.name}><span>{name}</span>{isMentorMode && mentor.approvalStatus === "APPROVED" && <GoldenVerifiedBadge size={18} className="shrink-0" />}</Link>
            <p className={styles.headline} title={displayHeadline}>{displayHeadline}</p>
          </div>
          {skills.length > 0 && <div className={styles.skills}>{skills.slice(0, 3).map((skill) => <span key={skill} title={skill}>{skill}</span>)}{skills.length > 3 && <span title={skills.slice(3).join(", ")}>+{skills.length - 3}</span>}</div>}
          {(shortLocation || languagesList.length > 0) && <div className={styles.details}>
            {shortLocation && <span title={location || undefined}><MapPin size={12} aria-hidden="true" />{shortLocation}</span>}
            {languagesList.length > 0 && <span title={languagesList.map((language) => language.name).join(", ")}><Globe size={12} aria-hidden="true" />{languagesList.slice(0, 2).map((language) => language.name).join(", ")}{languagesList.length > 2 ? ` +${languagesList.length - 2}` : ""}</span>}
          </div>}
          {isMentorMode ? (
            <div className={styles.footer}>
              <div className={styles.stats}>
                <div><Star size={17} className={styles.ratingIcon} aria-hidden="true" /><strong>{rating > 0 ? rating.toFixed(1) : "New"}</strong><span>Rating</span></div>
                <div><MessagesSquare size={17} className={styles.priceIcon} aria-hidden="true" /><strong><PriceDisplay amountInPaise={mentor.pricePerSession} /></strong><span>Per session</span></div>
                <div><Clock3 size={17} className={styles.timeIcon} aria-hidden="true" /><strong>{mentor.sessionDuration}</strong><span>Minutes</span></div>
              </div>
              <Link href={profileLink} className={styles.action}>View profile <ArrowRight size={15} aria-hidden="true" /></Link>
              <p className={styles.sessionNote}>{sessionCount > 0 ? `${sessionCount} ${sessionCount === 1 ? "conversation" : "conversations"} and counting` : "Start a conversation"}</p>
            </div>
          ) : (
            <div className={styles.userFooter}>
              <div className={styles.socials}>
                {profile?.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s website`}><Globe size={16} /></a>}
                {profile?.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s LinkedIn`}><FaLinkedin size={16} /></a>}
                {profile?.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s GitHub`}><FaGithub size={16} /></a>}
              </div>
              <Link href={profileLink} className={styles.action}>View profile <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </article>

      {avatarUrl && <Dialog.Portal>
        <Dialog.Backdrop className={`${surfaces.backdrop} ${surfaces.photoBackdrop}`} />
        <Dialog.Viewport className={`${surfaces.viewport} ${surfaces.photoViewport}`}>
          <Dialog.Popup className={`${surfaces.popup} relative max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col items-center gap-4 shadow-2xl`}>
            <Dialog.Close className={`${surfaces.close} absolute top-2 right-2 rounded-full bg-white/10 text-white`} aria-label="Close profile photo">
              <X className="h-4 w-4" />
            </Dialog.Close>

            {/* High-res Image */}
            <div className="h-56 w-56 sm:h-64 sm:w-64 rounded-full overflow-hidden ring-4 ring-white/20 shadow-xl bg-zinc-950 mt-2">
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center min-w-0 max-w-full">
              <Dialog.Title className={`${surfaces.photoTitle} font-display font-bold text-lg text-white flex items-center justify-center gap-1.5`}>
                <span>{name}</span>
                <GoldenVerifiedBadge size={18} className="h-4.5 w-4.5" />
              </Dialog.Title>
              {displayHeadline && (
                <p className="text-xs text-zinc-400 mt-0.5">{displayHeadline}</p>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>}
    </Dialog.Root>
  );
}
