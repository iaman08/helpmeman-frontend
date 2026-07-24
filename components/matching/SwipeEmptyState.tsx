"use client";

import { motion } from "motion/react";
import { Sparkles, TrendingUp, Users, Filter } from "lucide-react";
import Link from "next/link";

interface SwipeEmptyStateProps {
  onExpandFilters: () => void;
  hasFilters: boolean;
}

export function SwipeEmptyState({ onExpandFilters, hasFilters }: SwipeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center text-(--fg)">
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative mb-8"
      >
        {/* Stacked empty card silhouettes */}
        <div className="relative h-48 w-36">
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `color-mix(in srgb, var(--fg) ${4 + i * 3}%, transparent)`,
                border: "1px solid var(--hairline)",
                transform: `rotate(${[-6, 3, 0][i]}deg) translateY(${[8, 4, 0][i]}px)`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl"
            >
              🎓
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold font-display mb-2 text-(--fg)">
          {hasFilters ? "No mentors match your filters" : "You've seen all mentors!"}
        </h3>
        <p className="text-sm text-(--muted) max-w-xs mx-auto leading-relaxed">
          {hasFilters
            ? "Try broadening your search criteria to discover more mentors."
            : "Check back soon — new mentors join HelpMeMan every day."}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col gap-3 w-full max-w-xs mt-8"
      >
        {hasFilters && (
          <button
            type="button"
            onClick={onExpandFilters}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-(--fg) text-(--bg) hover:opacity-90 active:scale-97 cursor-pointer"
          >
            <Filter className="h-4 w-4" />
            Expand Filters
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            // Trigger clear/browse from parent
            window.location.href = "/mentors";
          }}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-(--fg)/5 border border-(--hairline) text-(--fg) hover:bg-(--fg)/10 active:scale-97 cursor-pointer transition-all"
        >
          <Users className="h-4 w-4" />
          Browse All Mentors
        </button>

        <Link
          href="/mentors?sortBy=rating"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-(--muted) hover:text-(--fg) transition-colors"
        >
          <TrendingUp className="h-4 w-4" />
          See Top-Rated Mentors
        </Link>
      </motion.div>

      {/* Suggestion chips */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-2 justify-center mt-6"
      >
        {["AI / ML", "SWE", "Product", "Design", "Finance", "Marketing"].map((tag) => (
          <Link
            key={tag}
            href={`/mentors?tab=discover&category=${tag.toLowerCase().replace(/\s+/g, "-")}`}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-(--hairline) text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5 transition-colors"
          >
            {tag}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
