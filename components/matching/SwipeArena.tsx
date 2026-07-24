"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { motion, AnimatePresence } from "motion/react";
import { MentorSwipeCard, SwipeCardSkeleton } from "./MentorSwipeCard";
import { SwipeActionBar } from "./SwipeActionBar";
import { FilterSheet } from "./FilterSheet";
import { MatchFoundModal } from "./MatchFoundModal";
import { SwipeEmptyState } from "./SwipeEmptyState";
import { useSwipeEngine, type MatchFilters, type ScoredMentor } from "./useSwipeEngine";

interface SwipeArenaProps {
  initialFilters?: MatchFilters;
}

export function SwipeArena({ initialFilters = {} }: SwipeArenaProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<MatchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [matchedMentor, setMatchedMentor] = useState<ScoredMentor | null>(null);

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

  // Prefetch upcoming profiles for instant navigation and seed SWR cache
  useEffect(() => {
    if (currentMentor) {
      router.prefetch(`/mentors/${currentMentor.id}`);
      mutate(`/mentors/${currentMentor.id}`, { mentor: currentMentor }, false);
    }
    if (nextMentor) {
      router.prefetch(`/mentors/${nextMentor.id}`);
      mutate(`/mentors/${nextMentor.id}`, { mentor: nextMentor }, false);
    }
    if (thirdMentor) {
      router.prefetch(`/mentors/${thirdMentor.id}`);
      mutate(`/mentors/${thirdMentor.id}`, { mentor: thirdMentor }, false);
    }
  }, [currentMentor, nextMentor, thirdMentor, router]);

  const handleExpand = useCallback(
    (mentor: ScoredMentor) => {
      trackCustomInteraction("profile_opened", mentor.id);
      router.push(`/mentors/${mentor.id}`);
    },
    [trackCustomInteraction, router]
  );

  const handleSwipe = useCallback(
    (action: "skip" | "interested" | "priority") => {
      if (!currentMentor) return;
      const targetMentor = currentMentor;
      if (action === "priority") {
        setMatchedMentor(targetMentor);
      }
      swipe(action);

      if (action === "interested" || action === "priority") {
        router.push(`/mentors/${targetMentor.id}`);
      }
    },
    [currentMentor, swipe, router]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showFilters || matchedMentor) return;

      switch (e.key) {
        case "ArrowLeft":
          handleSwipe("skip");
          break;
        case "ArrowRight":
          handleSwipe("interested");
          break;
        case "ArrowUp":
          handleSwipe("priority");
          break;
        case "z":
        case "Z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            undo();
          }
          break;
        case "Enter":
          if (currentMentor) handleExpand(currentMentor);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSwipe, undo, currentMentor, showFilters, matchedMentor, handleExpand]);

  const isEmpty = !isLoading && deck.length === 0;
  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== "" && v !== 0 && v !== false);

  return (
    <div
      className="relative flex flex-col h-full w-full"
      style={{ minHeight: "calc(100dvh - 0px)" }}
    >
      {/* Spacer to align cards nicely */}
      <div className="h-4 sm:h-6" />

      {/* ─── Card Stack ─── */}
      <div className="flex-1 flex items-center justify-center relative min-h-0">
        {isLoading && deck.length === 0 ? (
          /* Loading skeleton */
          <div className="relative" style={{ width: "min(88vw, 360px)", height: "min(78vh, 580px)" }}>
            {[2, 1, 0].map((i) => (
              <SwipeCardSkeleton key={i} stackIndex={i} />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="w-full max-w-sm px-4" style={{ height: "min(78vh, 580px)" }}>
            <SwipeEmptyState
              onExpandFilters={() => setShowFilters(true)}
              hasFilters={hasFilters}
            />
          </div>
        ) : (
          <div
            className="relative flex items-center justify-center"
            style={{ width: "min(88vw, 360px)", height: "min(78vh, 580px)" }}
            role="region"
            aria-label="Mentor discovery cards"
          >
            <AnimatePresence mode="popLayout">
              {/* Third card (back) */}
              {thirdMentor && (
                <MentorSwipeCard
                  key={`${thirdMentor.id}-third`}
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
                  key={`${nextMentor.id}-second`}
                  mentor={nextMentor}
                  onSwipe={() => {}}
                  onExpand={() => {}}
                  isTop={false}
                  stackIndex={1}
                />
              )}

              {/* Top card (draggable) */}
              {currentMentor && (
                <MentorSwipeCard
                  key={currentMentor.id}
                  mentor={currentMentor}
                  onSwipe={handleSwipe}
                  onExpand={handleExpand}
                  isTop={true}
                  stackIndex={0}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ─── Keyboard shortcuts hint ─── */}
      {!isEmpty && !isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-[10px] text-white/20 pb-1 flex-shrink-0 hidden sm:block"
        >
          ← Skip · → Interested · ↑ Priority · Enter to view profile · Ctrl+Z Undo
        </motion.p>
      )}

      {/* ─── Action Bar ─── */}
      <div className="flex-shrink-0">
        <SwipeActionBar
          onSwipe={handleSwipe}
          onUndo={undo}
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

      {/* ─── Match Found Modal ─── */}
      <MatchFoundModal
        mentor={matchedMentor}
        onClose={() => setMatchedMentor(null)}
      />
    </div>
  );
}
