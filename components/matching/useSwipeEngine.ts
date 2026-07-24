"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Mentor } from "@/lib/types";
import api from "@/lib/api";

/* ─── Types ─── */

export type SwipeAction = "skip" | "interested" | "priority";

export interface SwipeRecord {
  mentorId: string;
  action: SwipeAction;
  timestamp: number;
}

export interface MatchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  language?: string;
  verifiedOnly?: boolean;
  onlineOnly?: boolean;
  freeSessionOnly?: boolean;
  availableToday?: boolean;
  minExperience?: number;
  sessionType?: string;
  q?: string;
}

export interface AIMatchReason {
  label: string;
  icon: string;
}

export interface ScoredMentor extends Mentor {
  matchScore: number;
  matchReasons: AIMatchReason[];
}

/* ─── Storage keys ─── */
const HISTORY_KEY = "hmm_swipe_history";
const INTERESTED_KEY = "hmm_interested";
const MAX_HISTORY = 200;

function loadHistory(): SwipeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(records: SwipeRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(-MAX_HISTORY)));
}

function loadInterested(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(INTERESTED_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveInterested(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTERESTED_KEY, JSON.stringify(ids));
}

/* ─── AI Match Score Algorithm ─── */

export function computeMatchScore(
  mentor: Mentor,
  userLangs: string[] = ["English"],
  budgetPaise?: number
): { score: number; reasons: AIMatchReason[] } {
  let score = 0;
  const reasons: AIMatchReason[] = [];

  // Language overlap (0–20 pts)
  const mentorLangs: string[] = Array.isArray(mentor.languages)
    ? mentor.languages
    : typeof mentor.languages === "string"
    ? mentor.languages.split(",").map((l) => l.trim())
    : ["English"];
  const sharedLangs = mentorLangs.filter((l) =>
    userLangs.some((ul) => ul.toLowerCase() === l.toLowerCase())
  );
  if (sharedLangs.length > 0) {
    score += Math.min(20, sharedLangs.length * 10);
    reasons.push({ label: `Speaks ${sharedLangs.join(" & ")}`, icon: "🌐" });
  }

  // Budget match (0–20 pts)
  if (budgetPaise && budgetPaise > 0) {
    if (mentor.pricePerSession <= budgetPaise) {
      score += 20;
      reasons.push({ label: "Fits your budget", icon: "💰" });
    } else if (mentor.pricePerSession <= budgetPaise * 1.3) {
      score += 12;
    }
  } else {
    // No budget specified — give neutral pts
    score += 10;
  }

  // Rating (0–15 pts) — scales 4.0–5.0 → 0–15
  if (mentor.rating > 0) {
    const ratingScore = Math.max(0, Math.min(15, (mentor.rating - 4.0) * 15));
    score += ratingScore;
    if (mentor.rating >= 4.9) {
      reasons.push({ label: `Top-rated ${mentor.rating.toFixed(1)} ⭐`, icon: "⭐" });
    } else if (mentor.rating >= 4.5) {
      reasons.push({ label: `Highly rated ${mentor.rating.toFixed(1)} ⭐`, icon: "⭐" });
    }
  }

  // Response time (0–10 pts)
  const resp = mentor.averageResponseTime?.toLowerCase() || "";
  if (resp.includes("min") || resp.includes("hour")) {
    const mins = extractMinutes(resp);
    if (mins <= 15) {
      score += 10;
      reasons.push({ label: "Replies within 15 min", icon: "⚡" });
    } else if (mins <= 60) {
      score += 7;
      reasons.push({ label: "Fast responder", icon: "⚡" });
    } else {
      score += 3;
    }
  } else {
    score += 5; // unknown
  }

  // Experience years (0–10 pts)
  const expYears = mentor.experienceYears || 0;
  if (expYears >= 7) {
    score += 10;
    reasons.push({ label: `${expYears} years experience`, icon: "🎓" });
  } else if (expYears >= 3) {
    score += 6;
  } else if (expYears >= 1) {
    score += 3;
  }

  // Session count (0–10 pts) — social proof
  const sessions = mentor.totalSessions || 0;
  if (sessions >= 500) {
    score += 10;
    reasons.push({ label: `${sessions}+ sessions completed`, icon: "🏆" });
  } else if (sessions >= 100) {
    score += 7;
  } else if (sessions >= 20) {
    score += 4;
  }

  // Online now bonus (0–5 pts)
  if (mentor.isOnline) {
    score += 5;
    reasons.push({ label: "Available now", icon: "🟢" });
  }

  // Cap at 100
  const finalScore = Math.round(Math.min(100, score));

  // Always have at least 1 reason
  if (reasons.length === 0) {
    reasons.push({ label: "Compatible mentor", icon: "✨" });
  }

  return { score: finalScore, reasons };
}

function extractMinutes(text: string): number {
  const hourMatch = text.match(/(\d+)\s*h/);
  const minMatch = text.match(/(\d+)\s*m/);
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const mins = minMatch ? parseInt(minMatch[1]) : 0;
  return hours * 60 + mins || 999;
}

/* ─── Hook ─── */

export function useSwipeEngine(filters: MatchFilters = {}) {
  const [deck, setDeck] = useState<ScoredMentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExhausted, setIsExhausted] = useState(false);
  const [undoStack, setUndoStack] = useState<{ mentor: ScoredMentor; action: SwipeAction }[]>([]);
  const [history, setHistory] = useState<SwipeRecord[]>(() => loadHistory());
  const [interested, setInterested] = useState<string[]>(() => loadInterested());
  const [currentPage, setCurrentPage] = useState(1);
  const isFetchingRef = useRef(false);
  const allFetchedRef = useRef<Set<string>>(new Set());

  const skippedIds = new Set(history.filter((r) => r.action === "skip").map((r) => r.mentorId));
  const seenIds = new Set(history.map((r) => r.mentorId));

  const fetchMoreMentors = useCallback(
    async (page: number) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        params.set("sortBy", "rating");
        if (filters.category) params.set("category", filters.category);
        if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
        if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
        if (filters.minRating) params.set("minRating", String(filters.minRating));
        if (filters.q) params.set("q", filters.q);

        const { data } = await api.get<{ mentors: Mentor[]; total: number; totalPages: number }>(
          `/mentors?${params.toString()}`
        );

        const freshMentors = data.mentors.filter(
          (m) => !skippedIds.has(m.id) && !allFetchedRef.current.has(m.id)
        );

        freshMentors.forEach((m) => allFetchedRef.current.add(m.id));

        // Apply client-side filters
        let filtered = freshMentors;
        if (filters.onlineOnly) filtered = filtered.filter((m) => m.isOnline);
        if (filters.freeSessionOnly) filtered = filtered.filter((m) => m.pricePerSession === 0);
        if (filters.minExperience) {
          filtered = filtered.filter((m) => (m.experienceYears || 0) >= filters.minExperience!);
        }
        if (filters.language) {
          filtered = filtered.filter((m) => {
            const langs = Array.isArray(m.languages)
              ? m.languages
              : typeof m.languages === "string"
              ? m.languages.split(",").map((l) => l.trim())
              : [];
            return langs.some((l) => l.toLowerCase().includes(filters.language!.toLowerCase()));
          });
        }

        // Score and sort
        const scored: ScoredMentor[] = filtered.map((m) => {
          const { score, reasons } = computeMatchScore(m, ["English"], filters.maxPrice);
          return { ...m, matchScore: score, matchReasons: reasons };
        });

        scored.sort((a, b) => b.matchScore - a.matchScore);

        setDeck((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOnes = scored.filter((m) => !existingIds.has(m.id));
          return [...prev, ...newOnes];
        });

        if (data.totalPages <= page) {
          setIsExhausted(true);
        }
      } catch (e) {
        console.error("Swipe engine fetch error:", e);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.category, filters.minPrice, filters.maxPrice, filters.minRating, filters.q,
     filters.onlineOnly, filters.freeSessionOnly, filters.minExperience, filters.language]
  );

  // Initial load + refetch on filter change
  useEffect(() => {
    setDeck([]);
    setIsLoading(true);
    setIsExhausted(false);
    setCurrentPage(1);
    allFetchedRef.current = new Set();
    fetchMoreMentors(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.minRating, filters.q,
      filters.onlineOnly, filters.freeSessionOnly, filters.minExperience, filters.language]);

  // Prefetch next page when deck runs low
  useEffect(() => {
    if (!isExhausted && deck.length < 5 && !isFetchingRef.current && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMoreMentors(nextPage);
    }
  }, [deck.length, isExhausted, currentPage, fetchMoreMentors, isLoading]);

  /* ─── Actions ─── */

  const swipe = useCallback(
    (action: SwipeAction) => {
      setDeck((prev) => {
        if (prev.length === 0) return prev;
        const [top, ...rest] = prev;
        const record: SwipeRecord = { mentorId: top.id, action, timestamp: Date.now() };

        setHistory((h) => {
          const updated = [...h, record];
          saveHistory(updated);
          return updated;
        });

        if (action === "interested" || action === "priority") {
          setInterested((ids) => {
            const updated = [...ids, top.id];
            saveInterested(updated);
            return updated;
          });
        }

        // Post to backend asynchronously
        api.post("/mentors/interactions", {
          actionType: action,
          mentorId: top.id,
          matchScore: top.matchScore,
          filters,
        }).catch((err) => console.error("Failed to log swipe interaction:", err));

        setUndoStack((us) => [...us.slice(-2), { mentor: top, action }]);
        return rest;
      });
    },
    [filters]
  );

  const trackCustomInteraction = useCallback(
    (actionType: string, mentorId: string, extra?: { timeSpent?: number }) => {
      api.post("/mentors/interactions", {
        actionType,
        mentorId,
        timeSpent: extra?.timeSpent,
        matchScore: deck.find((m) => m.id === mentorId)?.matchScore || undefined,
        filters,
      }).catch((err) => console.error("Failed to track custom interaction:", err));
    },
    [deck, filters]
  );

  const undo = useCallback(() => {
    setUndoStack((us) => {
      if (us.length === 0) return us;
      const last = us[us.length - 1];

      // Remove from history
      setHistory((h) => {
        const updated = h.filter((r) => r.mentorId !== last.mentor.id);
        saveHistory(updated);
        return updated;
      });

      // If it was interested/priority, remove from interested
      if (last.action !== "skip") {
        setInterested((ids) => {
          const updated = ids.filter((id) => id !== last.mentor.id);
          saveInterested(updated);
          return updated;
        });
      }

      // Put it back on top of deck
      setDeck((prev) => [last.mentor, ...prev]);

      return us.slice(0, -1);
    });
  }, []);

  const currentMentor = deck[0] ?? null;
  const nextMentor = deck[1] ?? null;
  const thirdMentor = deck[2] ?? null;
  const canUndo = undoStack.length > 0;

  return {
    deck,
    currentMentor,
    nextMentor,
    thirdMentor,
    isLoading,
    isExhausted,
    swipe,
    undo,
    canUndo,
    history,
    interested,
    undoStack,
    trackCustomInteraction,
  };
}
