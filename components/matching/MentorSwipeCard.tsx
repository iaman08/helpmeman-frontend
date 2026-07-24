"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
  type PanInfo,
} from "motion/react";
import { Star, Clock, CheckCircle2, Award, Globe, Zap } from "lucide-react";
import { AIMatchScore } from "./AIMatchScore";
import { SwipeIndicators } from "./SwipeIndicators";
import type { ScoredMentor, SwipeAction } from "./useSwipeEngine";
import { PriceDisplay } from "@/components/PriceDisplay";

interface MentorSwipeCardProps {
  mentor: ScoredMentor;
  onSwipe: (action: SwipeAction) => void;
  onExpand: (mentor: ScoredMentor) => void;
  isTop: boolean;
  stackIndex: number; // 0=top, 1=second, 2=third
}

const SWIPE_THRESHOLD_X = 100;
const SWIPE_THRESHOLD_Y = -100;
const THROW_VELOCITY = 800;

export function MentorSwipeCard({
  mentor,
  onSwipe,
  onExpand,
  isTop,
  stackIndex,
}: MentorSwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [imgError, setImgError] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring for non-dragging transforms
  const xSpring = useSpring(x, { stiffness: 400, damping: 40 });

  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  const opacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0]);

  // Background color overlay changes based on drag direction
  const interestedBg = useTransform(x, [0, SWIPE_THRESHOLD_X, 200], [0, 0, 0.12]);
  const skipBg = useTransform(x, [-200, -SWIPE_THRESHOLD_X, 0], [0.12, 0, 0]);
  const priorityBg = useTransform(y, [-200, SWIPE_THRESHOLD_Y, 0], [0.12, 0, 0]);

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
      const targets = {
        left: { x: -600, y: 80, rotate: -25 },
        right: { x: 600, y: 80, rotate: 25 },
        up: { x: 0, y: -700, rotate: 0 },
      }[direction];

      await Promise.all([
        animate(x, targets.x, { duration: 0.4, ease: [0.32, 0, 0.67, 0] }),
        animate(y, targets.y, { duration: 0.4, ease: [0.32, 0, 0.67, 0] }),
      ]);

      const action: SwipeAction =
        direction === "right" ? "interested" : direction === "up" ? "priority" : "skip";
      onSwipe(action);
    },
    [x, y, onSwipe]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      setIsSwiping(false);
      const velX = info.velocity.x;
      const velY = info.velocity.y;
      const offsetX = info.offset.x;
      const offsetY = info.offset.y;

      const shouldSwipeRight =
        offsetX > SWIPE_THRESHOLD_X || (velX > THROW_VELOCITY && offsetX > 50);
      const shouldSwipeLeft =
        offsetX < -SWIPE_THRESHOLD_X || (velX < -THROW_VELOCITY && offsetX < -50);
      const shouldSwipeUp =
        offsetY < SWIPE_THRESHOLD_Y || (velY < -THROW_VELOCITY && offsetY < -50);

      if (shouldSwipeUp && !shouldSwipeLeft && !shouldSwipeRight) {
        throwCard("up");
      } else if (shouldSwipeRight) {
        throwCard("right");
      } else if (shouldSwipeLeft) {
        throwCard("left");
      } else {
        // Spring back to center
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
        animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
      }
    },
    [throwCard, x, y]
  );

  // Stack appearance (cards behind the top one)
  const stackScale = 1 - stackIndex * 0.04;
  const stackY = stackIndex * 10;
  const stackOpacity = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.85 : 0.6;

  return (
    <motion.div
      ref={cardRef}
      className="absolute"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : stackY,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : stackOpacity,
        scale: isTop ? 1 : stackScale,
        zIndex: 10 - stackIndex,
        cursor: isTop ? "grab" : "default",
        touchAction: isTop ? "none" : "auto",
      }}
      drag={isTop}
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={() => setIsSwiping(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing", scale: 1.02 }}
    >
      <div
        className="relative overflow-hidden select-none flex flex-col glass"
        style={{
          width: "min(88vw, 360px)",
          height: "min(78vh, 580px)",
          borderRadius: "1.5rem",
          background: "var(--bg)",
          border: "1px solid var(--hairline)",
          boxShadow:
            stackIndex === 0
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--hairline)"
              : "0 10px 20px -6px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--hairline)",
        }}
      >
        {/* Color overlays (swipe feedback) */}
        {isTop && (
          <>
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none rounded-[1.5rem]"
              style={{ background: "rgba(34,197,94,0.06)", opacity: interestedBg }}
            />
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none rounded-[1.5rem]"
              style={{ background: "rgba(107,114,128,0.06)", opacity: skipBg }}
            />
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none rounded-[1.5rem]"
              style={{ background: "rgba(245,158,11,0.06)", opacity: priorityBg }}
            />
          </>
        )}

        {/* Photo Container (Top 46%) */}
        <div className="relative h-[46%] w-full overflow-hidden bg-(--fg)/3">
          <img
            src={avatarUrl}
            alt={mentor.displayName}
            className="w-full h-full object-cover object-top"
            draggable={false}
            onError={() => setImgError(true)}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
            }}
          />

          {/* Swipe direction stamps */}
          {isTop && <SwipeIndicators x={x} y={y} />}

          {/* Top badges over image */}
          <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-start justify-between">
            {/* Online indicator */}
            {mentor.isOnline ? (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online
              </span>
            ) : (
              <span />
            )}

            {/* AI Match chip */}
            <AIMatchScore score={mentor.matchScore} reasons={mentor.matchReasons} compact />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-(--hairline)" />

        {/* Info Area (Bottom 54%) */}
        <div className="flex-1 flex flex-col justify-between p-5 bg-transparent text-(--fg)">
          <div>
            {/* Name + Verified */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <h3 className="text-xl font-bold font-display truncate leading-tight">{mentor.displayName}</h3>
              <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
              {mentor.rating >= 4.8 && (
                <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded border border-amber-500/20">
                  Top
                </span>
              )}
            </div>

            {/* Role + Company */}
            {mentor.currentRole && (
              <p className="text-xs text-(--muted) leading-snug mb-3 line-clamp-2">
                {mentor.currentRole}
                {mentor.institutionName && (
                  <span className="font-semibold text-(--fg)/80"> @ {mentor.institutionName}</span>
                )}
              </p>
            )}

            {/* Structured Stats Section */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-b border-(--hairline) py-2.5 my-2">
              <div className="flex items-center gap-1.5 text-[11px] text-(--muted)">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                <span className="font-bold text-(--fg)">
                  {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
                </span>
                {mentor.totalSessions > 0 && <span>({mentor.totalSessions} sessions)</span>}
              </div>
              
              {mentor.experienceYears !== undefined && mentor.experienceYears !== null && (
                <div className="flex items-center gap-1.5 text-[11px] text-(--muted)">
                  <span className="font-bold text-(--fg)">{mentor.experienceYears}y</span>
                  <span>experience</span>
                </div>
              )}

              {mentor.averageResponseTime && (
                <div className="flex items-center gap-1.5 text-[11px] text-(--muted) col-span-2">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>Replies:</span>
                  <span className="font-semibold text-(--fg)">{mentor.averageResponseTime}</span>
                </div>
              )}
            </div>

            {/* Expertise Skills tags */}
            {mentor.expertise && mentor.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {mentor.expertise.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-(--fg)/5 text-(--muted) border border-(--hairline)"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto">
            {/* Price + Tap to View */}
            <div className="flex items-center justify-between border-t border-(--hairline) pt-3.5 mt-4">
              {languages.length > 0 ? (
                <span className="flex items-center gap-1 text-[10px] text-(--muted)">
                  <Globe className="h-3 w-3" />
                  {languages.slice(0, 2).join(" • ")}
                </span>
              ) : (
                <span />
              )}
              <div className="text-right">
                <span className="text-sm text-(--muted) mr-1">Session:</span>
                <span className="text-base font-bold font-display text-(--accent)">
                  {mentor.pricePerSession === 0 ? (
                    <span className="text-emerald-500">Free</span>
                  ) : (
                    <PriceDisplay amountInPaise={mentor.pricePerSession} />
                  )}
                </span>
              </div>
            </div>

            {/* Tap to expand hint (only for top card, not while dragging) */}
            {isTop && !isSwiping && (
              <motion.button
                type="button"
                onClick={() => onExpand(mentor)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-3 py-2 rounded-xl text-xs font-bold bg-(--fg) text-(--bg) hover:opacity-90 transition-opacity cursor-pointer text-center"
              >
                View Details & Calendar
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Skeleton loading card ─── */
export function SwipeCardSkeleton({ stackIndex }: { stackIndex: number }) {
  const scale = 1 - stackIndex * 0.04;
  const y = stackIndex * 10;

  return (
    <div
      className="absolute animate-pulse glass"
      style={{
        width: "min(88vw, 360px)",
        height: "min(78vh, 580px)",
        borderRadius: "1.5rem",
        background: "var(--bg)",
        border: "1px solid var(--hairline)",
        transform: `scale(${scale}) translateY(${y}px)`,
        zIndex: 10 - stackIndex,
        opacity: stackIndex === 0 ? 1 : stackIndex === 1 ? 0.75 : 0.5,
      }}
    >
      <div className="h-full w-full rounded-[1.5rem] overflow-hidden flex flex-col">
        <div className="h-[46%] w-full bg-(--fg)/5 border-b border-(--hairline)" />
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="h-5 w-36 bg-(--fg)/8 rounded mb-2" />
            <div className="h-3 w-48 bg-(--fg)/5 rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-(--fg)/5 rounded" />
              <div className="h-4 w-16 bg-(--fg)/5 rounded" />
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-(--hairline) flex justify-between items-end">
            <div className="h-3 w-20 bg-(--fg)/5 rounded" />
            <div className="h-5 w-24 bg-(--fg)/8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
