"use client";

import {
  useRef,
  useState,
  useCallback,
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
  Clock,
  CheckCircle2,
  Globe,
  Briefcase,
  ChevronRight,
} from "lucide-react";
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

    const languages: string[] = Array.isArray(mentor.languages)
      ? mentor.languages
      : typeof mentor.languages === "string"
      ? mentor.languages.split(",").map((l) => l.trim())
      : [];

    const avatarUrl = imgError
      ? `https://i.pravatar.cc/400?u=${mentor.id}`
      : mentor.avatar || `https://i.pravatar.cc/400?u=${mentor.id}`;

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
          animate(scale, 1, { type: "spring", stiffness: 420, damping: 28 });
        }
      },
      [throwCard, x, y, scale]
    );

    // Dynamic styling for stack layers
    const targetScale = isTop ? 1 : Math.max(0.88, 1 - stackIndex * 0.045);
    const targetY = isTop ? 0 : stackIndex * 12;
    const targetOpacity = isTop ? 1 : stackIndex === 1 ? 0.9 : 0.65;

    return (
      <motion.div
        ref={cardRef}
        className="absolute will-change-transform"
        style={{
          x: isTop ? x : 0,
          y: isTop ? y : undefined,
          rotate: isTop ? rotate : 0,
          scale: isTop ? scale : undefined,
          opacity: isTop ? opacity : undefined,
          zIndex: 20 - stackIndex,
          cursor: isTop ? (isDragging ? "grabbing" : "grab") : "default",
          touchAction: isTop ? "none" : "auto",
        }}
        initial={
          stackIndex > 0
            ? {
                scale: 1 - (stackIndex + 1) * 0.045,
                y: (stackIndex + 1) * 12,
                opacity: 0.5,
              }
            : false
        }
        animate={
          !isTop
            ? {
                scale: targetScale,
                y: targetY,
                opacity: targetOpacity,
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
          className="relative overflow-hidden select-none flex flex-col glass rounded-3xl transition-shadow duration-300"
          style={{
            width: "min(92vw, 375px)",
            height: "min(74vh, 590px)",
            background: "var(--bg)",
            borderColor: isTop ? borderColor : "var(--hairline)",
            boxShadow:
              stackIndex === 0
                ? "0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--hairline)"
                : "0 12px 30px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--hairline)",
          }}
        >
          {/* Reactive directional glow tints */}
          {isTop && (
            <>
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none rounded-3xl bg-gradient-to-tr from-emerald-500/25 via-emerald-500/10 to-transparent"
                style={{ opacity: interestedOverlay }}
              />
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none rounded-3xl bg-gradient-to-tl from-rose-500/25 via-rose-500/10 to-transparent"
                style={{ opacity: skipOverlay }}
              />
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none rounded-3xl bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent"
                style={{ opacity: priorityOverlay }}
              />
            </>
          )}

          {/* Photo Section (Top 46%) */}
          <div className="relative h-[46%] w-full overflow-hidden bg-[var()]/4">
            <img
              src={avatarUrl}
              alt={mentor.displayName}
              className="w-full h-full object-cover object-top pointer-events-none transition-transform duration-500"
              draggable={false}
              onError={() => setImgError(true)}
            />

            {/* Smooth gradient shadow overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
              }}
            />

            {/* Swipe direction stamps */}
            {isTop && <SwipeIndicators x={x} y={y} />}

            {/* Top badges bar */}
            <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-start justify-between">
              {mentor.isOnline ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online
                </span>
              ) : (
                <div />
              )}

              <AIMatchScore score={mentor.matchScore} reasons={mentor.matchReasons} compact />
            </div>

            {/* Price Pill Floating over photo bottom */}
            <div className="absolute bottom-3 right-3.5 z-10">
              <div className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/15 shadow-sm">
                {mentor.pricePerSession === 0 ? (
                  <span className="text-emerald-400">Free 1st Session</span>
                ) : (
                  <PriceDisplay amountInPaise={mentor.pricePerSession} />
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[var()]" />

          {/* Info Section (Bottom 54%) */}
          <div className="flex-1 flex flex-col justify-between p-4.5 sm:p-5 bg-transparent text-[var()]">
            <div>
              {/* Name & Verified Badge */}
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-xl font-black font-display truncate leading-tight">
                  {mentor.displayName}
                </h3>
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                {mentor.rating >= 4.8 && (
                  <span className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">
                    ★ Top
                  </span>
                )}
              </div>

              {/* Current Role & Institution */}
              {mentor.currentRole && (
                <p className="text-xs text-[var()] leading-snug mb-3 line-clamp-1 font-medium">
                  {mentor.currentRole}
                  {mentor.institutionName && (
                    <span className="font-bold text-[var()]/90"> @ {mentor.institutionName}</span>
                  )}
                </p>
              )}

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 border-t border-b border-[var()] py-2.5 my-2">
                <div className="flex items-center gap-1.5 text-xs text-[var()] font-medium">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <span className="font-bold text-[var()]">
                    {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
                  </span>
                  {mentor.totalSessions > 0 && (
                    <span className="text-[10px] text-[var()]/70">({mentor.totalSessions} sessions)</span>
                  )}
                </div>

                {mentor.experienceYears !== undefined && mentor.experienceYears !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-[var()] font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-[var()]/70 flex-shrink-0" />
                    <span className="font-bold text-[var()]">{mentor.experienceYears}y</span>
                    <span className="text-[10px] text-[var()]/70">experience</span>
                  </div>
                )}

                {mentor.averageResponseTime && (
                  <div className="flex items-center gap-1.5 text-xs text-[var()] col-span-2">
                    <Clock className="h-3.5 w-3.5 text-[var()]/70 flex-shrink-0" />
                    <span className="text-[10px] text-[var()]/70">Replies:</span>
                    <span className="font-bold text-[var()] text-xs">{mentor.averageResponseTime}</span>
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {mentor.expertise.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-[var()]/5 text-[var()] border border-[var()]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer: Language & View Details Button */}
            <div className="mt-3 pt-2.5 border-t border-[var()] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-[var()]/80">
                {languages.length > 0 ? (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Globe className="h-3 w-3 flex-shrink-0" />
                    {languages.slice(0, 2).join(" • ")}
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var()]/60">
                  Swipe or tap to view
                </span>
              </div>

              {/* View details & calendar button */}
              {isTop && (
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand(mentor);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[var()] text-[var()] hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>View Details & Schedule</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.button>
              )}
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
      className="absolute animate-pulse glass rounded-3xl"
      style={{
        width: "min(92vw, 375px)",
        height: "min(74vh, 590px)",
        background: "var(--bg)",
        border: "1px solid var(--hairline)",
        transform: `scale(${scale}) translateY(${y}px)`,
        zIndex: 10 - stackIndex,
        opacity: stackIndex === 0 ? 1 : stackIndex === 1 ? 0.75 : 0.45,
      }}
    >
      <div className="h-full w-full rounded-3xl overflow-hidden flex flex-col">
        <div className="h-[46%] w-full bg-[var()]/6 border-b border-[var()]" />
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="h-5 w-40 bg-[var()]/10 rounded-md mb-2" />
            <div className="h-3 w-52 bg-[var()]/6 rounded-md mb-4" />
            <div className="h-10 w-full bg-[var()]/4 rounded-xl mb-3" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-[var()]/6 rounded-full" />
              <div className="h-5 w-16 bg-[var()]/6 rounded-full" />
            </div>
          </div>
          <div className="mt-auto pt-3 border-t border-[var()] flex justify-between items-center">
            <div className="h-3 w-24 bg-[var()]/6 rounded" />
            <div className="h-8 w-full bg-[var()]/8 rounded-xl mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
