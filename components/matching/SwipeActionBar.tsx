"use client";

import { motion } from "motion/react";
import { X, RotateCcw, Star, Check, SlidersHorizontal } from "lucide-react";
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
  variant?: "neutral" | "danger" | "gold" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = "neutral",
  size = "md",
  disabled,
}: ActionButtonProps) {
  const sizeClasses = {
    sm: "h-11 w-11 text-xs",
    md: "h-13 w-13 text-sm",
    lg: "h-14 w-14 text-base",
  };

  const variantStyles = {
    neutral:
      "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-zinc-700/80",
    danger:
      "bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/40 dark:text-neutral-300 dark:hover:text-rose-400 border border-neutral-200/80 hover:border-rose-300 dark:border-zinc-700/80 dark:hover:border-rose-900/60",
    gold:
      "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/40 shadow-xs",
    success:
      "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 border border-neutral-900 dark:border-white shadow-xs font-semibold",
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.08, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.92 }}
        transition={{ type: "spring", stiffness: 450, damping: 22 }}
        className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed group relative shadow-2xs ${variantStyles[variant]}`}
      >
        <span className="transition-transform duration-200 group-hover:scale-105">
          {icon}
        </span>
      </motion.button>
      <span className="text-[10px] font-semibold tracking-tight text-neutral-500 dark:text-neutral-400 select-none">
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
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 24 }}
      className="flex items-center justify-center gap-3 sm:gap-4 px-4 py-2.5 w-full max-w-sm mx-auto select-none rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {/* Undo */}
      <ActionButton
        icon={<RotateCcw className="h-4 w-4" strokeWidth={2.2} />}
        label="Undo"
        onClick={onUndo}
        variant="neutral"
        size="sm"
        disabled={!canUndo || disabled}
      />

      {/* Skip / Pass */}
      <ActionButton
        icon={<X className="h-5 w-5" strokeWidth={2.4} />}
        label="Pass"
        onClick={() => onSwipe("skip")}
        variant="danger"
        size="md"
        disabled={disabled}
      />

      {/* Priority Match */}
      <ActionButton
        icon={<Star className="h-5 w-5 fill-amber-400 text-amber-500" strokeWidth={2} />}
        label="Priority"
        onClick={() => onSwipe("priority")}
        variant="gold"
        size="lg"
        disabled={disabled}
      />

      {/* Connect / Like */}
      <ActionButton
        icon={<Check className="h-5 w-5 stroke-[2.6]" />}
        label="Connect"
        onClick={() => onSwipe("interested")}
        variant="success"
        size="md"
        disabled={disabled}
      />

      {/* Preferences / Filter */}
      <ActionButton
        icon={<SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} />}
        label="Filters"
        onClick={onFilter}
        variant="neutral"
        size="sm"
      />
    </motion.div>
  );
}
