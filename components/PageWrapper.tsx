"use client";

import { type ReactNode } from "react";

type Props = {
  id: string;
  children: ReactNode;
  last?: boolean;
};

/**
 * Simple section wrapper — no scroll-snap or page-turn animation.
 * Each section takes natural height and flows normally.
 */
export function PageWrapper({ id, children }: Props) {
  return (
    <section id={id} className="relative w-full">
      {children}
    </section>
  );
}
