"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

type Props = {
  id: string;
  children: ReactNode;
  /** When true, this is the last section — don't flip out as user scrolls past. */
  last?: boolean;
};

/**
 * Wraps a full-screen section in a scroll-tied page-turn animation.
 *
 * - The section is a real, in-flow `h-screen w-screen` block (no overlap).
 * - As it enters from below, it swings in from the right (rotateY: 55 → 0).
 * - As it leaves upward, it swings out to the left around its left edge
 *   (rotateY: 0 → -65), like a page turning right-to-left.
 *
 * Each section drives its own progress, so layout is independent and stable.
 */
export function PageWrapper({ id, children, last }: Props) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 0 = section's top hits viewport bottom (entering)
  // 0.5 = section is centered
  // 1 = section's bottom hits viewport top (left)
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [55, 0, last ? 0 : -65],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    [0, 1, 1, 1, last ? 1 : 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.94, 1, last ? 1 : 0.94],
  );

  return (
    <section
      id={id}
      ref={ref}
      className="relative h-screen w-screen overflow-hidden snap-start"
      style={{ perspective: "2400px" }}
    >
      <motion.div
        style={{
          rotateY,
          opacity,
          scale,
          transformOrigin: "0% 50%",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
        className="absolute inset-0"
      >
        {children}
      </motion.div>
    </section>
  );
}
