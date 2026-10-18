"use client";

import React, {
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  BotState,
  BotStateContext,
  BotStateContextValue,
  BOT_STATE_DURATIONS,
  useBotState,
} from "./animationState";
import "./AICompanion.css";

/**
 * HelpMeMan Official Logo SVG
 */
export function HelpMeManLogo({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="100" height="100" fill="#0B0B0C" rx="20" />
      <path d="M20 20h12v60H20V20z" fill="#FFFFFF" />
      <path d="M68 20h12v60H68V20z" fill="#FFFFFF" />
      <path d="M32 60h12v8H32v-8z" fill="#FFFFFF" />
      <path d="M44 48h12v8H44v-8z" fill="#FFFFFF" />
      <path d="M56 36h12v8H56v-8z" fill="#FFFFFF" />
    </svg>
  );
}

export const NormalAISVG = HelpMeManLogo;
export const RuthSVG = HelpMeManLogo;

export function BotStateProvider({ children }: { children: React.ReactNode }) {
  const [botState, setBotStateRaw] = useState<BotState>("idle");

  const setBotState = useCallback((next: BotState) => {
    setBotStateRaw(next);
    const duration = BOT_STATE_DURATIONS[next];
    if (duration) {
      const t = setTimeout(() => setBotStateRaw("idle"), duration);
      return () => clearTimeout(t);
    }
  }, []);

  const value = useMemo<BotStateContextValue>(
    () => ({ botState, setBotState }),
    [botState, setBotState]
  );

  return (
    <BotStateContext.Provider value={value}>
      {children}
    </BotStateContext.Provider>
  );
}

interface RuthMascotInlineProps {
  size?: number;
  botState?: BotState;
  className?: string;
}

/**
 * Clean inline HelpMeMan logo badge
 */
export function RuthMascotInline({
  size = 28,
  botState = "idle",
  className = "",
}: RuthMascotInlineProps) {
  const isThinking = botState === "thinking";

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-xs select-none transition-all duration-200 ${className}`}
      data-state={botState}
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      <div
        className={`flex items-center justify-center ${
          isThinking ? "animate-pulse" : ""
        }`}
      >
        <HelpMeManLogo size={size} />
      </div>
    </div>
  );
}

interface RuthMascotProps {
  onClick?: () => void;
  isOpen?: boolean;
  externalState?: BotState;
  size?: number;
}

/**
 * Premium floating action button using the HelpMeMan logo
 */
export function RuthMascot({
  onClick,
  externalState,
  size = 52,
}: RuthMascotProps) {
  const { botState: ctxState, setBotState } = useBotState();
  const botState = externalState ?? ctxState;
  const isThinking = botState === "thinking";

  return (
    <div
      className="normal-ai-mascot relative inline-flex items-center justify-center cursor-pointer select-none group"
      data-state={botState}
      aria-label="Open HelpMeMan assistant"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={() => !externalState && setBotState("hover")}
      onMouseLeave={() => !externalState && setBotState("idle")}
    >
      {/* Subtle live indicator dot */}
      <span className="absolute -top-0.5 -right-0.5 z-20 flex h-3.5 w-3.5 pointer-events-none">
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 shadow-xs" />
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
      </span>

      {/* Floating button body with HelpMeMan logo */}
      <div
        className="relative flex items-center justify-center rounded-2xl sm:rounded-full bg-[#0B0B0C] border border-white/20 dark:border-white/15 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.55)] group-hover:scale-105 active:scale-95 overflow-hidden"
        style={{
          width: size,
          height: size,
        }}
      >
        <div
          className={`flex items-center justify-center transition-transform duration-200 ${
            isThinking ? "animate-pulse" : ""
          }`}
        >
          <HelpMeManLogo size={Math.round(size * 0.72)} />
        </div>
      </div>
    </div>
  );
}

export { useBotState };
export type { BotState };
