"use client";

import { motion } from "motion/react";
import { X, RotateCcw, Star, Heart, SlidersHorizontal } from "lucide-react";
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
  hoverBg: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

function ActionButton({
  icon,
  label,
  onClick,
  color,
  hoverBg,
  size = "md",
  disabled,
}: ActionButtonProps) {
  const sizeClasses = {
    sm: "h-11 w-11 text-xs",
    md: "h-14 w-14 text-sm",
    lg: "h-16 w-16 text-base",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.08, y: -1 }}
        whileTap={disabled ? {} : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border bg-(--bg) text-(--muted) border-(--hairline) hover:text-(--fg) hover:border-(--fg)/30 shadow-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
        style={{
          color: disabled ? undefined : color,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = hoverBg;
            e.currentTarget.style.borderColor = `${color}40`;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = "var(--bg)";
            e.currentTarget.style.borderColor = "var(--hairline)";
          }
        }}
      >
        {icon}
      </motion.button>
      <span className="text-[9px] font-bold tracking-wider text-(--muted) uppercase mt-0.5">
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
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 24 }}
      className="flex items-center justify-center gap-3 sm:gap-5 px-4 py-3"
    >
      {/* Skip */}
      <ActionButton
        icon={<X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />}
        label="Skip"
        onClick={() => onSwipe("skip")}
        color="#ef4444"
        hoverBg="rgba(239,68,68,0.06)"
        disabled={disabled}
      />

      {/* Undo */}
      <ActionButton
        icon={<RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />}
        label="Undo"
        onClick={onUndo}
        color="var(--muted)"
        hoverBg="var(--hairline)"
        size="sm"
        disabled={!canUndo || disabled}
      />

      {/* Priority Match */}
      <ActionButton
        icon={<Star className="h-6 w-6 sm:h-7 sm:w-7 fill-current" strokeWidth={1.5} />}
        label="Priority"
        onClick={() => onSwipe("priority")}
        color="#f59e0b"
        hoverBg="rgba(245,158,11,0.06)"
        size="lg"
        disabled={disabled}
      />

      {/* Interested */}
      <ActionButton
        icon={<Heart className="h-5 w-5 sm:h-6 sm:w-6 fill-current" strokeWidth={1.5} />}
        label="Interested"
        onClick={() => onSwipe("interested")}
        color="#22c55e"
        hoverBg="rgba(34,197,94,0.06)"
        disabled={disabled}
      />

      {/* Filters */}
      <ActionButton
        icon={<SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />}
        label="Filters"
        onClick={onFilter}
        color="var(--fg)"
        hoverBg="rgba(255,255,255,0.05)"
        size="sm"
      />
    </motion.div>
  );
}
