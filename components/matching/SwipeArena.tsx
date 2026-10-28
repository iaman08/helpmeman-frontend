"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { motion, AnimatePresence } from "motion/react";
import {
  MentorSwipeCard,
  SwipeCardSkeleton,
  type MentorSwipeCardHandle,
} from "./MentorSwipeCard";
import { SwipeActionBar } from "./SwipeActionBar";
import { FilterSheet } from "./FilterSheet";
import { MatchFoundModal } from "./MatchFoundModal";
import { SwipeEmptyState } from "./SwipeEmptyState";
import {
  useSwipeEngine,
  type MatchFilters,
  type ScoredMentor,
  type SwipeAction,
} from "./useSwipeEngine";
import { SlidersHorizontal } from "lucide-react";
import { getMatchKeyboardAction } from "@/lib/matching-keyboard";

interface SwipeArenaProps {
  initialFilters?: MatchFilters;
}

interface ToastMessage {
  id: number;
  text: string;
  type: "like" | "skip" | "priority" | "undo";
}

export function SwipeArena({ initialFilters = {} }: SwipeArenaProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<MatchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [matchedMentor, setMatchedMentor] = useState<ScoredMentor | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const topCardRef = useRef<MentorSwipeCardHandle>(null);

  const {
    deck,
    currentMentor,
    nextMentor,
    thirdMentor,
    isLoading,
    swipe,
    undo,
    canUndo,
    trackCustomInteraction,
  } = useSwipeEngine(filters);

  // Prefetch upcoming mentor profiles for instant navigation and seed SWR cache
  useEffect(() => {
    if (currentMentor) {
      router.prefetch(`/mentors/${currentMentor.id}?from=discover`);
      router.prefetch(`/book/${currentMentor.id}`);
      router.prefetch(`/dashboard/chat?mentorId=${currentMentor.id}`);
      mutate(`/mentors/${currentMentor.id}`, { mentor: currentMentor }, false);
    }
    if (nextMentor) {
      router.prefetch(`/mentors/${nextMentor.id}?from=discover`);
      router.prefetch(`/book/${nextMentor.id}`);
      router.prefetch(`/dashboard/chat?mentorId=${nextMentor.id}`);
      mutate(`/mentors/${nextMentor.id}`, { mentor: nextMentor }, false);
    }
    if (thirdMentor) {
      router.prefetch(`/mentors/${thirdMentor.id}?from=discover`);
      router.prefetch(`/book/${thirdMentor.id}`);
      router.prefetch(`/dashboard/chat?mentorId=${thirdMentor.id}`);
      mutate(`/mentors/${thirdMentor.id}`, { mentor: thirdMentor }, false);
    }
  }, [currentMentor, nextMentor, thirdMentor, router]);

  const showToast = useCallback((text: string, type: ToastMessage["type"]) => {
    setToast({ id: Date.now(), text, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleExpand = useCallback(
    (mentor: ScoredMentor) => {
      trackCustomInteraction("profile_opened", mentor.id);
      router.push(`/mentors/${mentor.id}?from=discover`);
    },
    [trackCustomInteraction, router]
  );

  // Called when the card has finished its physical exit trajectory animation
  const handleCardSwipeComplete = useCallback(
    (action: SwipeAction) => {
      if (!currentMentor) return;
      const targetMentor = currentMentor;

      if (action === "priority") {
        setMatchedMentor(targetMentor);
        showToast(`Marked ${targetMentor.displayName} as Priority`, "priority");
      } else if (action === "interested") {
        showToast(`Connecting with ${targetMentor.displayName}…`, "like");
        router.push(`/mentors/${targetMentor.id}?from=discover`);
      } else {
        showToast(`Passed`, "skip");
      }

      swipe(action);
    },
    [currentMentor, swipe, showToast, router]
  );

  // Triggered by Action Bar buttons or keyboard shortcuts
  const handleActionSwipe = useCallback(
    async (action: SwipeAction) => {
      if (!currentMentor) return;
      if (topCardRef.current) {
        const dir = action === "interested" ? "right" : action === "priority" ? "up" : "left";
        await topCardRef.current.swipe(dir);
      } else {
        handleCardSwipeComplete(action);
      }
    },
    [currentMentor, handleCardSwipeComplete]
  );

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    undo();
    showToast("Undone last action", "undo");
  }, [canUndo, undo, showToast]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showFilters || matchedMentor) return;

      const target = e.target;
      const targetIsInteractive = target instanceof Element && !!target.closest(
        'input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="button"], [role="dialog"], [role="switch"], [role="slider"], [role="combobox"]'
      );
      const action = getMatchKeyboardAction({
        key: e.key, repeat: e.repeat, isComposing: e.isComposing, busy: topCardRef.current?.isAnimating() ?? false,
        defaultPrevented: e.defaultPrevented, altKey: e.altKey,
        ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey,
        targetIsInteractive,
      });
      if (!action) return;
      if (action === "undo") {
        if (!canUndo) return;
        e.preventDefault();
        handleUndo();
      } else if (currentMentor) {
        e.preventDefault();
        if (action === "expand") handleExpand(currentMentor);
        else handleCardSwipeComplete(action);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCardSwipeComplete, handleUndo, currentMentor, showFilters, matchedMentor, handleExpand, canUndo]);

  const isEmpty = !isLoading && deck.length === 0;
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "" && v !== 0 && v !== false
  ).length;

  return (
    <div className="relative flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden">
      {/* ─── Matchmaker Mini Header ─── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/80 dark:border-zinc-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-2xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Curated Matches</span>
            {deck.length > 0 && (
              <>
                <span className="text-neutral-300 dark:text-zinc-700">·</span>
                <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                  {deck.length} profiles ready
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-neutral-200/80 dark:border-zinc-700/80 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer shadow-2xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="h-4.5 w-4.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Floating Toast Notification ─── */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ y: -20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shadow-xl border backdrop-blur-md flex items-center gap-2 ${
                toast.type === "like"
                  ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
                  : toast.type === "priority"
                  ? "bg-amber-950/90 text-amber-300 border-amber-500/40"
                  : toast.type === "undo"
                  ? "bg-indigo-950/90 text-indigo-300 border-indigo-500/40"
                  : "bg-zinc-900/90 text-zinc-300 border-zinc-700/50"
              }`}
            >
              <span>{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Center Card Stack Arena ─── */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 py-2">
        {isLoading && deck.length === 0 ? (
          /* Loading skeletons */
          <div
            className="relative flex items-center justify-center"
            style={{ width: "min(92vw, 375px)", height: "min(74vh, 590px)" }}
          >
            {[2, 1, 0].map((i) => (
              <SwipeCardSkeleton key={i} stackIndex={i} />
            ))}
          </div>
        ) : isEmpty ? (
          /* Empty state */
          <div className="w-full max-w-sm px-4" style={{ height: "min(74vh, 590px)" }}>
            <SwipeEmptyState
              onExpandFilters={() => setShowFilters(true)}
              hasFilters={activeFiltersCount > 0}
            />
          </div>
        ) : (
          /* Active Card Deck */
          <div
            className="relative flex items-center justify-center"
            style={{ width: "min(92vw, 375px)", height: "min(74vh, 590px)" }}
            role="region"
            aria-label="Mentor discovery card deck"
          >
            {/* Third card (back) */}
            {thirdMentor && (
              <MentorSwipeCard
                key={thirdMentor.id}
                mentor={thirdMentor}
                onSwipe={() => {}}
                onExpand={() => {}}
                isTop={false}
                stackIndex={2}
              />
            )}

            {/* Second card */}
            {nextMentor && (
              <MentorSwipeCard
                key={nextMentor.id}
                mentor={nextMentor}
                onSwipe={() => {}}
                onExpand={() => {}}
                isTop={false}
                stackIndex={1}
              />
            )}

            {/* Top card (draggable & interactive) */}
            {currentMentor && (
              <MentorSwipeCard
                ref={topCardRef}
                key={currentMentor.id}
                mentor={currentMentor}
                onSwipe={handleCardSwipeComplete}
                onExpand={handleExpand}
                isTop={true}
                stackIndex={0}
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Keyboard shortcuts hint ─── */}
      {/* ─── Keyboard Guide ─── */}
      {!isEmpty && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 pb-2.5 flex-shrink-0 hidden sm:flex select-none"
        >
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 bg-neutral-100/90 dark:bg-zinc-800/90 font-mono text-[10px] text-neutral-600 dark:text-neutral-300">←</kbd>
            <span>Pass</span>
          </span>
          <span className="text-neutral-300 dark:text-zinc-700">·</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 bg-neutral-100/90 dark:bg-zinc-800/90 font-mono text-[10px] text-neutral-600 dark:text-neutral-300">→</kbd>
            <span>Connect</span>
          </span>
          <span className="text-neutral-300 dark:text-zinc-700">·</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 bg-neutral-100/90 dark:bg-zinc-800/90 font-mono text-[10px] text-neutral-600 dark:text-neutral-300">↑</kbd>
            <span>Priority</span>
          </span>
          <span className="text-neutral-300 dark:text-zinc-700">·</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 bg-neutral-100/90 dark:bg-zinc-800/90 font-mono text-[10px] text-neutral-600 dark:text-neutral-300">↵</kbd>
            <span>View Profile</span>
          </span>
          <span className="text-neutral-300 dark:text-zinc-700">·</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-neutral-200 dark:border-zinc-800 bg-neutral-100/90 dark:bg-zinc-800/90 font-mono text-[10px] text-neutral-600 dark:text-neutral-300">Ctrl+Z</kbd>
            <span>Undo</span>
          </span>
        </motion.div>
      )}

      {/* ─── Tactile Action Bar ─── */}
      <div className="flex-shrink-0 pb-2">
        <SwipeActionBar
          onSwipe={handleActionSwipe}
          onUndo={handleUndo}
          onFilter={() => setShowFilters(true)}
          canUndo={canUndo}
          disabled={isEmpty || isLoading}
        />
      </div>

      {/* ─── Filter Sheet ─── */}
      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />

      {/* ─── Priority Match Celebratory Modal ─── */}
      <MatchFoundModal
        mentor={matchedMentor}
        onClose={() => setMatchedMentor(null)}
      />
    </div>
  );
}
