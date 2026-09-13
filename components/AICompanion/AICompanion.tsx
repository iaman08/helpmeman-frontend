"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  BotState,
  BotStateContext,
  BotStateContextValue,
  BOT_STATE_DURATIONS,
  useBotState,
} from "./animationState";
import "./AICompanion.css";

const SPEECH_MESSAGES = [
  "Hey! Need help? 👋",
  "Ask me anything ✨",
  "I'm Ruth — let's chat!",
  "Career advice, anyone? 🚀",
  "Find your perfect mentor 🎯",
];

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

interface RuthSVGProps {
  size?: number;
  eyeOffset?: { x: number; y: number };
  botState: BotState;
  isThinking?: boolean;
  isTalking?: boolean;
}

/**
 * Ruth v2 — Kawaii lavender dome-head robot
 *
 * Design language:
 *  • Smooth dome head (half-ellipse cap)
 *  • Big round glossy eyes with pupils + double highlights
 *  • Rosy blush cheeks
 *  • Heart-tipped antenna
 *  • Barrel body with belly plate + heart badge
 *  • Chunky stubby arms (rounded caps)
 *  • Round feet
 *  • Mouth arc that changes shape by state
 */
function RuthSVG({
  size = 80,
  eyeOffset = { x: 0, y: 0 },
  botState,
  isThinking = false,
  isTalking = false,
}: RuthSVGProps) {
  // Eye pupil drift — max 2.5px
  const px = eyeOffset.x * 2.5;
  const py = eyeOffset.y * 2.0;

  // Body / accent colors per state
  const bodyHue =
    botState === "error" ? ["#e879a0", "#c026d3", "#86198f"] :
      botState === "success" ? ["#86efac", "#22c55e", "#15803d"] :
        botState === "thinking" ? ["#c4b5fd", "#8b5cf6", "#6d28d9"] :
    /* default */["#c4b5fd", "#a78bfa", "#7c3aed"];

  const pupilColor =
    botState === "error" ? "#7f1d1d" :
      botState === "success" ? "#14532d" :
        "#1e1b4b";

  const glowColor =
    botState === "error" ? "#f9a8d4" :
      botState === "success" ? "#bbf7d0" :
        botState === "thinking" ? "#ddd6fe" :
          "#ede9fe";

  // Mouth: arc path in a 0 0 36 20 local coord space
  const mouthPath = useMemo(() => {
    if (botState === "success" || botState === "greeting")
      return "M 4 10 Q 18 22 32 10"; // big open smile
    if (botState === "error")
      return "M 4 14 Q 18 4  32 14"; // sad frown
    if (botState === "thinking")
      return "M 8 12 Q 18 12 28 12"; // flat thinking line
    if (botState === "talking")
      return isTalking ? "M 6 10 Q 18 20 30 10" : "M 6 11 Q 18 16 30 11";
    return "M 6 10 Q 18 18 30 10"; // gentle smile
  }, [botState, isTalking]);

  // Brow tilt (expressed as dy on outer vs inner endpoint)
  const browDy =
    botState === "error" ? 3 :   // worried brows up outer
      botState === "thinking" ? -2 :   // furrowed
        botState === "success" || botState === "greeting" ? -3 : // raised happy
          0;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 90"
      width={size}
      height={size * (90 / 80)}
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      <defs>
        {/* Body gradient */}
        <radialGradient id="rv2-body" cx="38%" cy="28%" r="68%">
          <stop offset="0%" stopColor={bodyHue[0]} />
          <stop offset="55%" stopColor={bodyHue[1]} />
          <stop offset="100%" stopColor={bodyHue[2]} />
        </radialGradient>
        {/* Head gradient — slightly lighter */}
        <radialGradient id="rv2-head" cx="36%" cy="26%" r="66%">
          <stop offset="0%" stopColor={glowColor} />
          <stop offset="45%" stopColor={bodyHue[0]} />
          <stop offset="100%" stopColor={bodyHue[1]} />
        </radialGradient>
        {/* Belly plate */}
        <radialGradient id="rv2-belly" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={glowColor} />
          <stop offset="100%" stopColor={bodyHue[0]} />
        </radialGradient>
        {/* Eye white */}
        <radialGradient id="rv2-eye" cx="36%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </radialGradient>
        {/* Soft shadow */}
        <filter id="rv2-shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={bodyHue[2]} floodOpacity="0.4" />
        </filter>
        {/* Glow */}
        <filter id="rv2-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feComposite in="SourceGraphic" in2="b" operator="over" />
        </filter>
        <clipPath id="rv2-eye-l">
          <circle cx="25" cy="36" r="9" />
        </clipPath>
        <clipPath id="rv2-eye-r">
          <circle cx="55" cy="36" r="9" />
        </clipPath>
      </defs>

      {/* ── Ground shadow ──────────────────────────────────────────── */}
      <ellipse cx="40" cy="89" rx="20" ry="3" fill={`${bodyHue[2]}40`} />

      {/* ══════════════════════════════════════════════════════════
          BODY — barrel shape
          ══════════════════════════════════════════════════════════ */}
      <rect x="18" y="54" width="44" height="30" rx="16" ry="16"
        fill="url(#rv2-body)" filter="url(#rv2-shadow)"
      />

      {/* Belly plate (lighter oval inset) */}
      <ellipse cx="40" cy="68" rx="13" ry="11" fill="url(#rv2-belly)" opacity="0.6" />

      {/* Heart badge on belly */}
      <text x="40" y="72" textAnchor="middle" fontSize="9" fill={bodyHue[2]} opacity="0.85">♥</text>

      {/* ── Left arm ──────────────────────────────────────────────── */}
      <rect x="7" y="56" width="12" height="18" rx="6"
        fill="url(#rv2-body)"
        transform="rotate(-8 13 65)"
      />
      {/* Left hand (round cap) */}
      <circle cx="11" cy="74" r="5" fill={bodyHue[0]}
        transform="rotate(-8 11 74)"
      />

      {/* ── Right arm ─────────────────────────────────────────────── */}
      <rect x="61" y="56" width="12" height="18" rx="6"
        fill="url(#rv2-body)"
        transform="rotate(8 67 65)"
      />
      <circle cx="69" cy="74" r="5" fill={bodyHue[0]}
        transform="rotate(8 69 74)"
      />

      {/* ── Feet ──────────────────────────────────────────────────── */}
      <ellipse cx="30" cy="86" rx="9" ry="5" fill={bodyHue[2]} opacity="0.8" />
      <ellipse cx="50" cy="86" rx="9" ry="5" fill={bodyHue[2]} opacity="0.8" />

      {/* ══════════════════════════════════════════════════════════
          HEAD — dome (large rounded rect capped by ellipse)
          ══════════════════════════════════════════════════════════ */}
      {/* Head main */}
      <rect x="13" y="18" width="54" height="40" rx="27" ry="27"
        fill="url(#rv2-head)" filter="url(#rv2-shadow)"
      />
      {/* Head top dome cap */}
      <ellipse cx="40" cy="18" rx="27" ry="16" fill="url(#rv2-head)" />

      {/* Head sheen */}
      <ellipse cx="30" cy="14" rx="11" ry="5" fill="rgba(255,255,255,0.30)" />

      {/* ── Antenna ───────────────────────────────────────────────── */}
      <line x1="40" y1="6" x2="40" y2="14"
        stroke={bodyHue[1]} strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Antenna ball */}
      <circle cx="40" cy="5" r="4" fill={bodyHue[0]} className="ruth-antenna-light" />
      {/* Heart tip */}
      <text x="40" y="8" textAnchor="middle" fontSize="6.5" fill={bodyHue[2]}
        className="ruth-antenna-light"
      >♥</text>

      {/* ══════════════════════════════════════════════════════════
          EYES
          ══════════════════════════════════════════════════════════ */}

      {/* ── Left eye white ────────────────────────────────────────── */}
      <circle cx="25" cy="36" r="9" fill="url(#rv2-eye)" />
      {/* Left pupil */}
      <g clipPath="url(#rv2-eye-l)">
        <circle
          cx={25 + px} cy={36 + py}
          r="5.5"
          fill={pupilColor}
          style={{ transition: "cx 0.1s ease, cy 0.1s ease" }}
        />
        {/* Pupil shine — large */}
        <circle cx={23 + px} cy={33 + py} r="2" fill="rgba(255,255,255,0.9)" />
        {/* Pupil shine — small */}
        <circle cx={28 + px} cy={38 + py} r="1" fill="rgba(255,255,255,0.55)" />
      </g>
      {/* Brow left */}
      {botState !== "error" && (
        <path
          d={`M ${17} ${28 + browDy} Q 25 ${24 + browDy} ${32} ${28}`}
          stroke={bodyHue[2]} strokeWidth="2" fill="none" strokeLinecap="round"
        />
      )}
      {/* Error brow — angry inward slant */}
      {botState === "error" && (
        <line x1="17" y1="27" x2="31" y2="31" stroke={bodyHue[2]} strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* ── Right eye white ───────────────────────────────────────── */}
      <circle cx="55" cy="36" r="9" fill="url(#rv2-eye)" />
      <g clipPath="url(#rv2-eye-r)">
        <circle
          cx={55 + px} cy={36 + py}
          r="5.5"
          fill={pupilColor}
          style={{ transition: "cx 0.1s ease, cy 0.1s ease" }}
        />
        <circle cx={53 + px} cy={33 + py} r="2" fill="rgba(255,255,255,0.9)" />
        <circle cx={58 + px} cy={38 + py} r="1" fill="rgba(255,255,255,0.55)" />
      </g>
      {/* Brow right */}
      {botState !== "error" && (
        <path
          d={`M ${48} ${28} Q 55 ${24 + browDy} ${63} ${28 + browDy}`}
          stroke={bodyHue[2]} strokeWidth="2" fill="none" strokeLinecap="round"
        />
      )}
      {botState === "error" && (
        <line x1="49" y1="31" x2="63" y2="27" stroke={bodyHue[2]} strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Eyelid blink mask — animates via CSS */}
      <ellipse
        cx="25" cy="27.5"
        rx="9" ry="8.5"
        fill="url(#rv2-head)"
        className="ruth-eyelid"
        style={{ transformOrigin: "25px 27.5px" }}
      />
      <ellipse
        cx="55" cy="27.5"
        rx="9" ry="8.5"
        fill="url(#rv2-head)"
        className="ruth-eyelid"
        style={{ transformOrigin: "55px 27.5px" }}
      />

      {/* ── Blush cheeks ──────────────────────────────────────────── */}
      <ellipse cx="15" cy="42" rx="5.5" ry="3.5" fill="rgba(251,113,133,0.40)" />
      <ellipse cx="65" cy="42" rx="5.5" ry="3.5" fill="rgba(251,113,133,0.40)" />
      {/* Extra rosy on success/greeting */}
      {(botState === "success" || botState === "greeting") && (
        <>
          <ellipse cx="15" cy="42" rx="6.5" ry="4" fill="rgba(251,113,133,0.30)" />
          <ellipse cx="65" cy="42" rx="6.5" ry="4" fill="rgba(251,113,133,0.30)" />
        </>
      )}

      {/* ── Mouth ─────────────────────────────────────────────────── */}
      <g transform="translate(22, 44)">
        <path
          d={mouthPath}
          stroke={botState === "success" || botState === "greeting" ? "#dc2626" : bodyHue[2]}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill={botState === "success" || botState === "greeting" ? "#fca5a5" : "none"}
          fillOpacity="0.5"
          style={{ transition: "d 0.25s ease" }}
        />
        {/* Tongue on big smile */}
        {(botState === "success" || botState === "greeting") && (
          <ellipse cx="18" cy="17" rx="5" ry="3" fill="#fca5a5" />
        )}
      </g>

      {/* ── Thinking dots ─────────────────────────────────────────── */}
      {isThinking && (
        <g transform="translate(0, -2)">
          <circle className="ruth-think-dot" cx="31" cy="55" r="2.5"
            fill={bodyHue[1]} opacity="0.9"
          />
          <circle className="ruth-think-dot" cx="40" cy="55" r="2.5"
            fill={bodyHue[1]} opacity="0.9"
          />
          <circle className="ruth-think-dot" cx="49" cy="55" r="2.5"
            fill={bodyHue[1]} opacity="0.9"
          />
        </g>
      )}

      {/* ── Star eyes on success ──────────────────────────────────── */}
      {botState === "success" && (
        <>
          <text x="25" y="40" textAnchor="middle" fontSize="11" fill="#fbbf24">★</text>
          <text x="55" y="40" textAnchor="middle" fontSize="11" fill="#fbbf24">★</text>
        </>
      )}
    </svg>
  );
}

function SparkleBurst() {
  const sparks = [
    { x: -30, y: -24, rot: -30, color: "#fbbf24", size: 11 },
    { x: 30, y: -26, rot: 25, color: "#c084fc", size: 9 },
    { x: -24, y: 22, rot: -60, color: "#34d399", size: 10 },
    { x: 26, y: 24, rot: 40, color: "#f472b6", size: 8 },
    { x: 0, y: -36, rot: 0, color: "#a78bfa", size: 12 },
    { x: 18, y: -28, rot: 55, color: "#f9a8d4", size: 7 },
  ];
  return (
    <>
      {sparks.map((s, i) => (
        <div key={i} className="ruth-sparkle"
          style={{ left: `calc(50% + ${s.x}px)`, top: `calc(50% + ${s.y}px)`, transform: `rotate(${s.rot}deg)` }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 10 10" fill="none">
            <path d="M5 0 L5.8 3.8 L10 5 L5.8 6.2 L5 10 L4.2 6.2 L0 5 L4.2 3.8 Z" fill={s.color} />
          </svg>
        </div>
      ))}
    </>
  );
}

interface RuthMascotProps {
  onClick?: () => void;
  isOpen?: boolean;
  externalState?: BotState;
  size?: number;
}

export function RuthMascot({ onClick, isOpen = false, externalState, size = 80 }: RuthMascotProps) {
  const { botState: ctxState, setBotState } = useBotState();
  const botState = externalState ?? ctxState;

  const [speechMsg, setSpeechMsg] = useState<string | null>(null);
  const [speechPhase, setSpeechPhase] = useState<"entering" | "exiting" | "hidden">("hidden");
  const speechTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const [mouthOpen, setMouthOpen] = useState(false);
  const talkRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearSpeechTimers = useCallback(() => {
    speechTimerRef.current.forEach(clearTimeout);
    speechTimerRef.current = [];
  }, []);

  const showBubble = useCallback((msg: string) => {
    clearSpeechTimers();
    setSpeechMsg(msg);
    setSpeechPhase("entering");
    const t1 = setTimeout(() => setSpeechPhase("exiting"), 3500);
    const t2 = setTimeout(() => { setSpeechPhase("hidden"); setSpeechMsg(null); }, 3800);
    speechTimerRef.current = [t1, t2];
  }, [clearSpeechTimers]);

  useEffect(() => {
    if (isOpen) { clearSpeechTimers(); setSpeechPhase("hidden"); return; }
    let idx = 0;
    const schedule = () => {
      const delay = 8000 + Math.random() * 12000;
      const t = setTimeout(() => {
        showBubble(SPEECH_MESSAGES[idx % SPEECH_MESSAGES.length]);
        idx++;
        schedule();
      }, delay);
      speechTimerRef.current.push(t);
    };
    const first = setTimeout(() => { showBubble(SPEECH_MESSAGES[0]); idx = 1; schedule(); }, 5000);
    speechTimerRef.current.push(first);
    return clearSpeechTimers;
  }, [isOpen, showBubble, clearSpeechTimers]);

  useEffect(() => {
    if (botState === "talking") {
      talkRef.current = setInterval(() => setMouthOpen(p => !p), 160);
    } else {
      if (talkRef.current) clearInterval(talkRef.current);
      setMouthOpen(false);
    }
    return () => { if (talkRef.current) clearInterval(talkRef.current); };
  }, [botState]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setEyeOffset({
      x: Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2))),
      y: Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2))),
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!externalState) setBotState("hover");
  }, [externalState, setBotState]);

  const handleMouseLeave = useCallback(() => {
    setEyeOffset({ x: 0, y: 0 });
    if (!externalState) setBotState("idle");
  }, [externalState, setBotState]);

  useEffect(() => {
    const fn = () => { if (document.hidden) setEyeOffset({ x: 0, y: 0 }); };
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  return (
    <div
      ref={rootRef}
      className="ruth-mascot"
      data-state={botState}
      aria-label="Open HelpMeMan AI assistant"
      role="button"
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative", display: "inline-flex" }}
    >
      <AnimatePresence>
        {speechPhase !== "hidden" && speechMsg && (
          <div className={`ruth-speech-bubble ${speechPhase}`}>{speechMsg}</div>
        )}
      </AnimatePresence>

      <span style={{
        position: "absolute", top: "4px", right: "4px",
        width: "10px", height: "10px", borderRadius: "50%",
        background: "#22c55e", border: "2px solid rgba(255,255,255,0.9)", zIndex: 3,
      }}>
        <span className="ruth-online-ping" style={{
          display: "block", width: "100%", height: "100%",
          borderRadius: "50%", background: "rgba(34,197,94,0.5)",
        }} />
      </span>

      <div className="ruth-body-wrap">
        <RuthSVG
          size={size}
          eyeOffset={eyeOffset}
          botState={botState}
          isThinking={botState === "thinking"}
          isTalking={mouthOpen}
        />
      </div>

      <AnimatePresence>
        {botState === "success" && <SparkleBurst />}
      </AnimatePresence>
    </div>
  );
}

interface RuthMascotInlineProps {
  size?: number;
  botState?: BotState;
}

export function RuthMascotInline({ size = 28, botState = "idle" }: RuthMascotInlineProps) {
  return (
    <div className="ruth-mascot" data-state={botState} aria-hidden="true"
      style={{ display: "inline-flex", flexShrink: 0 }}
    >
      <div className="ruth-body-wrap" style={{ display: "flex" }}>
        <RuthSVG
          size={size}
          eyeOffset={{ x: 0, y: 0 }}
          botState={botState}
          isThinking={botState === "thinking"}
        />
      </div>
    </div>
  );
}

export { useBotState };
export type { BotState };
