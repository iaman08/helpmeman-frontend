"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  scheduledAt: string;
  durationMinutes: number;
  className?: string;
}

type SessionState = "upcoming" | "soon" | "starting" | "ongoing" | "ended";

function getSessionState(scheduledAt: string, durationMinutes: number): {
  state: SessionState;
  label: string;
  msUntilStart: number;
} {
  const now = Date.now();
  const start = new Date(scheduledAt).getTime();
  const end = start + durationMinutes * 60 * 1000;
  const msUntilStart = start - now;
  const msUntilEnd = end - now;

  if (msUntilEnd <= 0) {
    return { state: "ended", label: "Session ended", msUntilStart };
  }
  if (msUntilStart <= 0) {
    const minsLeft = Math.ceil(msUntilEnd / 60000);
    return { state: "ongoing", label: `Ongoing · ${minsLeft}m left`, msUntilStart };
  }
  if (msUntilStart <= 15 * 60 * 1000) {
    return { state: "starting", label: "Starting soon!", msUntilStart };
  }

  // Format countdown
  const totalSecs = Math.floor(msUntilStart / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  let label = "Starts in ";
  if (days > 0) label += `${days}d ${hours}h`;
  else if (hours > 0) label += `${hours}h ${mins}m`;
  else if (mins > 0) label += `${mins}m ${secs}s`;
  else label += `${secs}s`;

  const state: SessionState = msUntilStart <= 60 * 60 * 1000 ? "soon" : "upcoming";
  return { state, label, msUntilStart };
}

/**
 * Live countdown timer for a scheduled session.
 * Automatically transitions through: upcoming → soon → starting → ongoing → ended
 */
export function CountdownTimer({ scheduledAt, durationMinutes, className = "" }: CountdownTimerProps) {
  const [{ state, label }, setStatus] = useState(() =>
    getSessionState(scheduledAt, durationMinutes)
  );

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setStatus(getSessionState(scheduledAt, durationMinutes));
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledAt, durationMinutes]);

  const colorClass =
    state === "ended"
      ? "text-(--muted)"
      : state === "ongoing"
        ? "text-green-500"
        : state === "starting"
          ? "text-amber-500"
          : state === "soon"
            ? "text-blue-400"
            : "text-(--muted)";

  const dotClass =
    state === "ongoing"
      ? "bg-green-500 animate-pulse"
      : state === "starting"
        ? "bg-amber-500 animate-pulse"
        : "bg-(--fg)/20";

  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${colorClass} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass}`} />
      {label}
    </span>
  );
}

/**
 * Returns true if the Join Meeting button should be active.
 * Active from 15 minutes before until the session ends.
 */
export function isJoinable(scheduledAt: string, durationMinutes: number): boolean {
  const now = Date.now();
  const start = new Date(scheduledAt).getTime();
  const end = start + durationMinutes * 60 * 1000;
  return now >= start - 15 * 60 * 1000 && now <= end;
}
