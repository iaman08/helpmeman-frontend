"use client";

import { motion } from "motion/react";

interface AIMatchScoreProps {
  score: number;
  reasons: { label: string; icon: string }[];
  compact?: boolean;
}

export function AIMatchScore({ score, reasons, compact = false }: AIMatchScoreProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm text-xs font-bold border"
        style={{
          background: "var(--fg)",
          borderColor: "var(--hairline)",
          color: "var(--bg)",
        }}
      >
        <span className="text-[#f5c518] text-xs">✦</span>
        <span>{score}% Match</span>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-(--fg)">
      {/* Ring + Score */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="68" height="68" viewBox="0 0 70 70">
            {/* Background circle */}
            <circle cx="35" cy="35" r={radius} fill="none" stroke="var(--hairline)" strokeWidth="6" />
            {/* Progress circle */}
            <motion.circle
              cx="35"
              cy="35"
              r={radius}
              fill="none"
              stroke="var(--fg)"
              strokeWidth="6"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              strokeLinecap="round"
              transform="rotate(-90 35 35)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold font-display text-(--fg)">
              {score}%
            </span>
          </div>
        </div>
        <div>
          <p className="font-bold text-sm text-(--fg)">AI Match Score</p>
          <p className="text-xs text-(--muted) mt-0.5">
            {score >= 85
              ? "Excellent compatibility"
              : score >= 70
              ? "Strong compatibility"
              : score >= 50
              ? "Good compatibility"
              : "Moderate compatibility"}
          </p>
        </div>
      </div>

      {/* Reason chips */}
      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {reasons.slice(0, 4).map((r, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-(--fg)/5 text-(--muted) border border-(--hairline)"
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
