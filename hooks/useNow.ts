"use client";

import { useSyncExternalStore } from "react";

/**
 * A single shared clock for "is it still within N minutes of X?" UI.
 *
 * Reading `Date.now()` during render makes render impure (React Compiler and
 * StrictMode both reject it) and the value never updates, so a deadline never
 * expires. This exposes the current time as an external store instead: one
 * timer for the whole page, pure reads in render, every subscriber re-renders
 * on the tick.
 *
 * Granularity is deliberately coarse — nothing here needs sub-minute accuracy.
 */
const TICK_MS = 30_000;

let now = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  // Initialise lazily on the client so the value is never stale when the first
  // subscriber mounts.
  if (now === 0) now = Date.now();

  listeners.add(listener);

  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      for (const l of listeners) l();
    }, TICK_MS);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => now;
// During SSR there is no clock; 0 means "unknown" and callers treat any
// time-based window as closed until hydration.
const getServerSnapshot = () => 0;

/** Current time in ms, refreshed every 30s. Returns 0 before hydration. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
