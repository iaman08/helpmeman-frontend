"use client";

import { motion } from "motion/react";
import { X, RotateCcw, Sparkles, Heart, SlidersHorizontal } from "lucide-react";
import type { SwipeAction } from "./useSwipeEngine";

interface SwipeActionBarProps {
  onSwipe: (action: SwipeAction) => void;
  onUndo: () => void;
  onFilter: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  glowColor: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

function ActionButton({
  icon,
  label,
  onClick,
  color,
  glowColor,
  size = "md",
  disabled,
}: ActionButtonProps) {
  const sizeClasses = {
    sm: "h-11 w-11 sm:h-12 sm:w-12 text-sm",
    md: "h-14 w-14 sm:h-15 sm:w-15 text-base",
    lg: "h-16 w-16 sm:h-17 sm:w-17 text-lg",
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.12, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.88 }}
        transition={{ type: "spring", stiffness: 450, damping: 22 }}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border bg-[var()] border-[var()] shadow-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group relative`}
        style={{
          color: disabled ? "var(--muted)" : color,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = `0 8px 24px ${glowColor}`;
            e.currentTarget.style.borderColor = color;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "var(--hairline)";
          }
        }}
      >
        <span className="transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      </motion.button>
      <span className="text-[10px] font-bold tracking-wider text-[var()]/70 uppercase select-none">
        {label}
      </span>
    </div>
  );
}

export function SwipeActionBar({
  onSwipe,
  onUndo,
  onFilter,
  canUndo,
  disabled,
}: SwipeActionBarProps) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25, type: "spring", stiffness: 280, damping: 24 }}
      className="flex items-center justify-center gap-3 sm:gap-6 px-4 py-2 w-full max-w-lg mx-auto select-none"
    >
      {/* Undo */}
      <ActionButton
        icon={<RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.4} />}
        label="Undo"
        onClick={onUndo}
        color="var(--fg)"
        glowColor="rgba(255,255,255,0.15)"
        size="sm"
        disabled={!canUndo || disabled}
      />

      {/* Skip */}
      <ActionButton
        icon={<X className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.8} />}
        label="Skip"
        onClick={() => onSwipe("skip")}
        color="#f43f5e"
        glowColor="rgba(244,63,94,0.3)"
        size="md"
        disabled={disabled}
      />

      {/* Priority Match */}
      <ActionButton
        icon={<Sparkles className="h-7 w-7 sm:h-8 sm:w-8 fill-current" strokeWidth={1.5} />}
        label="Priority"
        onClick={() => onSwipe("priority")}
        color="#f59e0b"
        glowColor="rgba(245,158,11,0.35)"
        size="lg"
        disabled={disabled}
      />

      {/* Interested */}
      <ActionButton
        icon={<Heart className="h-6 w-6 sm:h-7 sm:w-7 fill-current" strokeWidth={1.5} />}
        label="Like"
        onClick={() => onSwipe("interested")}
        color="#10b981"
        glowColor="rgba(16,185,129,0.35)"
        size="md"
        disabled={disabled}
      />

      {/* Filters */}
      <ActionButton
        icon={<SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.4} />}
        label="Filters"
        onClick={onFilter}
        color="var(--fg)"
        glowColor="rgba(255,255,255,0.15)"
        size="sm"
      />
    </motion.div>
  );
}
