// ─── Ruth AI Mascot — Animation State Machine ────────────────────────────────
//
// This module defines the canonical set of animation states for the Ruth mascot
// and a React context/hook to share them across the app.
//
// Future Rive integration:
//   If a `.riv` file is added, replace the CSS class switching in AICompanion.tsx
//   with `useRive({ src: 'ruth.riv', stateMachines: 'State Machine 1' })` and
//   map BotState → rive state machine inputs here.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export type BotState =
  | "idle"       // Floating bob, random blinks, subtle eye drift
  | "hover"      // Eyes track cursor, slight bounce, tooltip shows
  | "greeting"   // Wave + excited bounce when chat opens
  | "thinking"   // Slow eye rotation / head tilt / thinking dots
  | "talking"    // Mouth moves, body sways gently
  | "success"    // Happy bounce + sparkle burst
  | "error";     // Sad/confused expression, subtle shake

// ── Context ───────────────────────────────────────────────────────────────────

export interface BotStateContextValue {
  botState: BotState;
  setBotState: (state: BotState) => void;
}

export const BotStateContext = createContext<BotStateContextValue>({
  botState: "idle",
  setBotState: () => {},
});

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBotState() {
  return useContext(BotStateContext);
}

// ── Duration helpers (ms) ─────────────────────────────────────────────────────
//   Use these when you want to auto-transition back to idle after a short state.

export const BOT_STATE_DURATIONS: Partial<Record<BotState, number>> = {
  greeting: 1800,
  success: 2000,
  error: 2500,
};
