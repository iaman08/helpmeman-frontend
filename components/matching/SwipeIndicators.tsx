"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { Check, X, Star } from "lucide-react";

interface SwipeIndicatorsProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function SwipeIndicators({ x, y }: SwipeIndicatorsProps) {
  // Right → Interested / Connect (Emerald glow)
  const interestedOpacity = useTransform(x, [15, 80], [0, 1]);
  const interestedScale = useTransform(x, [15, 80], [0.75, 1]);
  const interestedRotate = useTransform(x, [0, 150], [-10, -18]);

  // Left → Skip / Pass (Rose glow)
  const skipOpacity = useTransform(x, [-15, -80], [0, 1]);
  const skipScale = useTransform(x, [-15, -80], [0.75, 1]);
  const skipRotate = useTransform(x, [0, -150], [10, 18]);

  // Up → Priority Match (Amber/Gold glow)
  const priorityOpacity = useTransform(y, [-15, -80], [0, 1]);
  const priorityScale = useTransform(y, [-15, -80], [0.75, 1.05]);

  return (
    <>
      {/* CONNECT — top-left stamp */}
      <motion.div
        style={{
          opacity: interestedOpacity,
          scale: interestedScale,
          rotate: interestedRotate,
        }}
        className="absolute top-5 left-5 z-30 pointer-events-none select-none"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(16,185,129,0.45)] backdrop-blur-md">
          <Check className="h-4 w-4 stroke-[2.8]" />
          <span>Connect</span>
        </div>
      </motion.div>

      {/* SKIP — top-right stamp */}
      <motion.div
        style={{
          opacity: skipOpacity,
          scale: skipScale,
          rotate: skipRotate,
        }}
        className="absolute top-5 right-5 z-30 pointer-events-none select-none"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-rose-500/20 text-rose-400 border-2 border-rose-400 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(244,63,94,0.45)] backdrop-blur-md">
          <X className="h-4 w-4 stroke-[3]" />
          <span>Pass</span>
        </div>
      </motion.div>

      {/* PRIORITY MATCH — top-center stamp */}
      <motion.div
        style={{
          opacity: priorityOpacity,
          scale: priorityScale,
        }}
        className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none"
      >
        <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-500/30 text-amber-300 border-2 border-amber-300 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.55)] backdrop-blur-md">
          <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
          <span>Priority</span>
        </div>
      </motion.div>
    </>
  );
}
