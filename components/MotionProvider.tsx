"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { EASE_OUT, MOTION_DURATION } from "@/lib/motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: MOTION_DURATION.surface, ease: EASE_OUT }}>
      {children}
    </MotionConfig>
  );
}
