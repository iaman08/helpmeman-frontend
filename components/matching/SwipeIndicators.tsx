"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

interface SwipeIndicatorsProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function SwipeIndicators({ x, y }: SwipeIndicatorsProps) {
  // Right → Interested (green)
  const interestedOpacity = useTransform(x, [20, 100], [0, 1]);
  const interestedScale = useTransform(x, [20, 100], [0.85, 1]);

  // Left → Skip (red/gray)
  const skipOpacity = useTransform(x, [-20, -100], [0, 1]);
  const skipScale = useTransform(x, [-20, -100], [0.85, 1]);

  // Up → Priority Match (gold)
  const priorityOpacity = useTransform(y, [-20, -100], [0, 1]);
  const priorityScale = useTransform(y, [-20, -100], [0.85, 1]);

  return (
    <>
      {/* INTERESTED — top left corner */}
      <motion.div
        style={{ opacity: interestedOpacity, scale: interestedScale }}
        className="absolute top-6 left-5 z-30 pointer-events-none"
      >
        <div className="swipe-stamp swipe-stamp-interested">
          Interested ❤️
        </div>
      </motion.div>

      {/* SKIP — top right corner */}
      <motion.div
        style={{ opacity: skipOpacity, scale: skipScale }}
        className="absolute top-6 right-5 z-30 pointer-events-none"
      >
        <div className="swipe-stamp swipe-stamp-skip">
          Skip ✕
        </div>
      </motion.div>

      {/* PRIORITY MATCH — center */}
      <motion.div
        style={{ opacity: priorityOpacity, scale: priorityScale }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      >
        <div className="swipe-stamp swipe-stamp-priority">
          ⭐ Priority
        </div>
      </motion.div>
    </>
  );
}
