"use client";

import {
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "motion/react";
import {
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { BrandBanner } from "@/components/BrandBanner";
import { GoldenVerifiedBadge } from "@/components/GoldenVerifiedBadge";
import { resolveOrganizationBranding } from "@/lib/organization-branding-db";
import { AIMatchScore } from "./AIMatchScore";
import { SwipeIndicators } from "./SwipeIndicators";
import type { ScoredMentor, SwipeAction } from "./useSwipeEngine";
import { PriceDisplay } from "@/components/PriceDisplay";

export interface MentorSwipeCardHandle {
  swipe: (direction: "left" | "right" | "up") => Promise<void>;
}

interface MentorSwipeCardProps {
  mentor: ScoredMentor;
  onSwipe: (action: SwipeAction) => void;
  onExpand: (mentor: ScoredMentor) => void;
  isTop: boolean;
  stackIndex: number; // 0=top, 1=second, 2=third
}

const SWIPE_THRESHOLD_X = 90;
const SWIPE_THRESHOLD_Y = -90;
const VELOCITY_THRESHOLD = 500;

function cleanHeadline(rawTitle?: string | null): string {
  if (!rawTitle) return "Mentor";
  let clean = rawTitle.replace(/\s*\([^)]*\)/g, "").trim();
  if (clean.length < 3 && rawTitle.includes("(")) {
    clean = rawTitle.split("(")[0].trim();
  }
  return clean || rawTitle;
}

export const MentorSwipeCard = forwardRef<MentorSwipeCardHandle, MentorSwipeCardProps>(
  function MentorSwipeCard(
    { mentor, onSwipe, onExpand, isTop, stackIndex },
    ref
  ) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [imgError, setImgError] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);

    // Dynamic rotation based on horizontal drag
    const rotate = useTransform(x, [-280, 0, 280], [-14, 0, 14]);

    // Opacity fades out slightly during extreme drag / throw
    const opacity = useTransform(x, [-450, -250, 0, 250, 450], [0, 1, 1, 1, 0]);

    // Dynamic color glow overlays
    const interestedOverlay = useTransform(x, [0, 50, 200], [0, 0.15, 0.35]);
    const skipOverlay = useTransform(x, [-200, -50, 0], [0.35, 0.15, 0]);
    const priorityOverlay = useTransform(y, [-200, -50, 0], [0.35, 0.15, 0]);

    // Dynamic border color tint on drag
    const borderColor = useTransform(
      x,
      [-150, -30, 0, 30, 150],
      [
        "rgba(244, 63, 94, 0.6)",
        "rgba(244, 63, 94, 0.2)",
        "rgba(128, 128, 128, 0.15)",
        "rgba(16, 185, 129, 0.2)",
        "rgba(16, 185, 129, 0.6)",
      ]
    );

    const actualAvatar = mentor.avatar || mentor.user?.avatar;
    const displayName = mentor.displayName || mentor.user?.name || "Mentor";
    const initials = displayName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const rawOrg =
      (mentor.company && mentor.company.toLowerCase() !== "independent" ? mentor.company : null) ||
      (mentor.institutionName && mentor.institutionName.toLowerCase() !== "independent" ? mentor.institutionName : null) ||
      mentor.institutionName ||
      mentor.company ||
      null;

    const institution = rawOrg
      ? rawOrg.replace(/^(currently\s+at|studying\s+at|working\s+at|student\s+at)\s+/i, "").trim()
      : null;

    const brand = useMemo(
      () => resolveOrganizationBranding(institution, mentor.institutionType),
      [institution, mentor.institutionType]
    );

    const displayHeadline = cleanHeadline(mentor.currentRole || mentor.headline);

    const languagesList = useMemo(() => {
      if (!mentor.languages) return [];
      if (Array.isArray(mentor.languages)) {
        return mentor.languages.map((l: any) =>
          typeof l === "string" ? { name: l } : { name: l.languageName || l.name }
        );
      }
      if (typeof mentor.languages === "string") {
        return (mentor.languages as string)
          .split(",")
          .map((s) => ({ name: s.trim() }))
          .filter((x) => x.name);
      }
      return [];
    }, [mentor.languages]);

    const skills = useMemo(() => {
      if (Array.isArray(mentor.expertise) && mentor.expertise.length > 0) {
        return mentor.expertise;
      }
      return [];
    }, [mentor.expertise]);

    const location = mentor.location || (mentor as any).user?.location || null;
    const ratingCount = mentor.totalSessions || 0;
    const customBannerUrl = mentor.bannerImageUrl || (mentor as any).user?.bannerImageUrl || null;
    const bannerPosition = mentor.bannerPosition || (mentor as any).user?.bannerPosition || "50% 50%";

    const throwCard = useCallback(
      async (direction: "left" | "right" | "up") => {
        if (isExiting) return;
        setIsExiting(true);

        const screenWidth = typeof window !== "undefined" ? window.innerWidth : 600;
        const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;

        const targets = {
          left: { x: -screenWidth * 0.95, y: 50, rotate: -24, scale: 0.9 },
          right: { x: screenWidth * 0.95, y: 50, rotate: 24, scale: 0.9 },
          up: { x: 0, y: -screenHeight * 0.95, rotate: 0, scale: 0.9 },
        }[direction];

        await Promise.all([
          animate(x, targets.x, { duration: 0.32, ease: [0.16, 1, 0.3, 1] }),
          animate(y, targets.y, { duration: 0.32, ease: [0.16, 1, 0.3, 1] }),
          animate(scale, targets.scale, { duration: 0.3, ease: "easeOut" }),
        ]);

        const action: SwipeAction =
          direction === "right" ? "interested" : direction === "up" ? "priority" : "skip";
        onSwipe(action);
      },
      [x, y, scale, isExiting, onSwipe]
    );

    // Expose throwCard method via imperative ref for action buttons
    useImperativeHandle(
      ref,
      () => ({
        swipe: async (direction: "left" | "right" | "up") => {
          await throwCard(direction);
        },
      }),
      [throwCard]
    );

    const handleDragEnd = useCallback(
      (_: unknown, info: PanInfo) => {
        setIsDragging(false);
        const velX = info.velocity.x;
        const velY = info.velocity.y;
        const offsetX = info.offset.x;
        const offsetY = info.offset.y;

        const isQuickSwipeRight = velX > VELOCITY_THRESHOLD && offsetX > 30;
        const isQuickSwipeLeft = velX < -VELOCITY_THRESHOLD && offsetX < -30;
        const isQuickSwipeUp = velY < -VELOCITY_THRESHOLD && offsetY < -30;

        const isPastThresholdRight = offsetX > SWIPE_THRESHOLD_X;
        const isPastThresholdLeft = offsetX < -SWIPE_THRESHOLD_X;
        const isPastThresholdUp = offsetY < SWIPE_THRESHOLD_Y;

        if ((isPastThresholdUp || isQuickSwipeUp) && Math.abs(offsetX) < Math.abs(offsetY)) {
          throwCard("up");
        } else if (isPastThresholdRight || isQuickSwipeRight) {
          throwCard("right");
        } else if (isPastThresholdLeft || isQuickSwipeLeft) {
          throwCard("left");
        } else {
          // Smooth bounce spring back to center
          animate(x, 0, { type: "spring", stiffness: 420, damping: 28 });
          animate(y, 0, { type: "spring", stiffness: 420, damping: 28 });
        }
      },
      [x, y, throwCard]
    );

    const nonTopScale = 1 - stackIndex * 0.045;
    const nonTopY = stackIndex * 12;
    const nonTopOpacity = stackIndex === 1 ? 0.75 : 0.45;

    return (
      <motion.div
        ref={cardRef}
        className="absolute cursor-grab active:cursor-grabbing will-change-transform"
        style={{
          zIndex: 10 - stackIndex,
          x: isTop ? x : 0,
          y: isTop ? y : nonTopY,
          rotate: isTop ? rotate : 0,
          scale: isTop ? scale : nonTopScale,
          opacity: isTop ? opacity : nonTopOpacity,
        }}
        animate={
          !isTop
            ? {
                scale: nonTopScale,
                y: nonTopY,
                opacity: nonTopOpacity,
              }
            : undefined
        }
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
        drag={isTop && !isExiting}
        dragElastic={0.65}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02 }}
      >
        <motion.div
          className="relative overflow-hidden select-none flex flex-col rounded-3xl transition-shadow duration-300 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800"
          style={{
            width: "min(92vw, 380px)",
            minHeight: "min(76vh, 600px)",
            borderColor: isTop ? borderColor : undefined,
            boxShadow:
              stackIndex === 0
                ? "0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05)"
                : "0 12px 30px -10px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Reactive directional glow tints */}
          {isTop && (
            <>
              <motion.div
                className="absolute inset-0 z-30 pointer-events-none rounded-3xl bg-gradient-to-tr from-emerald-500/25 via-emerald-500/10 to-transparent"
                style={{ opacity: interestedOverlay }}
              />
              <motion.div
                className="absolute inset-0 z-30 pointer-events-none rounded-3xl bg-gradient-to-tl from-rose-500/25 via-rose-500/10 to-transparent"
                style={{ opacity: skipOverlay }}
              />
              <motion.div
                className="absolute inset-0 z-30 pointer-events-none rounded-3xl bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent"
                style={{ opacity: priorityOverlay }}
              />
            </>
          )}

          {/* ─── 1. Brand Banner Header (Top Section) ─── */}
          <div className="relative w-full h-28 sm:h-32 shrink-0 overflow-hidden bg-zinc-950">
            <BrandBanner
              customBannerUrl={customBannerUrl}
              bannerPosition={bannerPosition}
              organization={institution}
              institutionType={mentor.institutionType}
            />

            {/* Swipe direction stamps */}
            {isTop && <SwipeIndicators x={x} y={y} />}

            {/* Top badges bar */}
            <div className="absolute top-3 left-3.5 right-3.5 z-10 flex items-start justify-between pointer-events-none">
              {mentor.isOnline ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-md shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online
                </span>
              ) : (
                <div />
              )}

              <AIMatchScore score={mentor.matchScore} reasons={mentor.matchReasons} compact />
            </div>
          </div>

          {/* ─── 2. Card Body ─── */}
          <div className="flex flex-col flex-1 px-4 sm:px-5 pb-4 pt-0 justify-between bg-white dark:bg-zinc-900">
            <div>
              {/* Avatar Row */}
              <div className="flex items-end justify-between -mt-10 mb-2">
                <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-md ring-4 ring-white dark:ring-zinc-900 bg-neutral-100 dark:bg-zinc-800 shrink-0">
                  {actualAvatar && !imgError ? (
                    <img
                      src={actualAvatar}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white bg-zinc-900 select-none">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Price / Free Pill */}
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-zinc-700/80 shadow-xs">
                  {mentor.pricePerSession === 0 ? (
                    <span className="text-emerald-500 font-bold">Free 1st Session</span>
                  ) : (
                    <PriceDisplay amountInPaise={mentor.pricePerSession} />
                  )}
                </div>
              </div>

              {/* Organization Badge */}
              {(brand || institution) && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40">
                    {brand?.shortName || institution}
                  </span>
                </div>
              )}

              {/* Name & Golden Verified Starburst Badge */}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-neutral-900 dark:text-white truncate max-w-full">
                  <span className="truncate">{displayName}</span>
                  <GoldenVerifiedBadge size={18} className="h-4.5 w-4.5" />
                </div>
                {displayHeadline && (
                  <p className="text-xs sm:text-[13px] font-medium text-neutral-600 dark:text-neutral-300 truncate mt-1">
                    {displayHeadline}
                  </p>
                )}
              </div>

              {/* Skills Tags */}
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

              {/* Rating Row: 5 Gold Stars with Review Count */}
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

              {/* Languages Spoken */}
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
                  </div>
                </div>
              )}

              {/* Location Row */}
              {location && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-neutral-100 dark:border-zinc-800">
              <div className="flex items-baseline gap-0.5">
                <span className="font-display text-base font-bold text-neutral-900 dark:text-white">
                  <PriceDisplay amountInPaise={mentor.pricePerSession} />
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                  /session
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(mentor);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group-hover:translate-x-0.5 duration-200 cursor-pointer"
              >
                <span>View Profile</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);
MentorSwipeCard.displayName = "MentorSwipeCard";

/* ─── Skeleton Loading Card ─── */
export function SwipeCardSkeleton({ stackIndex }: { stackIndex: number }) {
  const scale = 1 - stackIndex * 0.045;
  const y = stackIndex * 12;

  return (
    <div
      className="absolute animate-pulse rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800"
      style={{
        width: "min(92vw, 380px)",
        minHeight: "min(76vh, 600px)",
        transform: `scale(${scale}) translateY(${y}px)`,
        zIndex: 10 - stackIndex,
        opacity: stackIndex === 0 ? 1 : stackIndex === 1 ? 0.75 : 0.45,
      }}
    >
      <div className="h-full w-full flex flex-col justify-between">
        <div className="h-28 sm:h-32 w-full bg-neutral-200/80 dark:bg-zinc-800" />
        <div className="flex-1 px-5 pb-5 pt-0 flex flex-col justify-between">
          <div>
            <div className="h-20 w-20 rounded-full bg-neutral-300 dark:bg-zinc-700 -mt-10 mb-2 ring-4 ring-white dark:ring-zinc-900" />
            <div className="h-5 w-24 bg-neutral-200 dark:bg-zinc-800 rounded-full mb-2" />
            <div className="h-6 w-44 bg-neutral-300 dark:bg-zinc-700 rounded-md mb-2" />
            <div className="h-4 w-56 bg-neutral-200 dark:bg-zinc-800 rounded-md mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-20 bg-neutral-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-6 w-20 bg-neutral-200 dark:bg-zinc-800 rounded-md" />
            </div>
            <div className="h-4 w-32 bg-neutral-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 flex justify-between items-center">
            <div className="h-5 w-24 bg-neutral-200 dark:bg-zinc-800 rounded" />
            <div className="h-5 w-24 bg-neutral-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
