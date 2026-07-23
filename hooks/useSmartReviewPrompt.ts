"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import type { PlatformReviewData } from "@/components/PlatformReviewModal";

const EXCLUDED_ROUTES = [
  "/book",
  "/dashboard/meetings/room",
  "/signin",
  "/signup",
  "/onboarding",
  "/admin",
];

export function useSmartReviewPrompt() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [existingReview, setExistingReview] = useState<PlatformReviewData | null>(null);
  const [loadingReviewState, setLoadingReviewState] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user's existing review and prompt state
  const fetchReviewState = useCallback(async () => {
    if (!user) return null;
    setLoadingReviewState(true);
    try {
      const res = await api.get("/platform-reviews/my");
      const data = res.data;
      if (data?.review) {
        setExistingReview(data.review);
      } else {
        setExistingReview(null);
      }

      if (data?.platformReviewSubmitted) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("helpmeman_review_prompt_session", "true");
        }
      }
      return data;
    } catch (err) {
      console.error("Failed to fetch platform review state", err);
      return null;
    } finally {
      setLoadingReviewState(false);
    }
  }, [user]);

  // Open modal manually (e.g., from Settings, Profile, Footer, Card, Landing page)
  const openModalManually = useCallback(async () => {
    if (!user) {
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await fetchReviewState();
    setIsOpen(true);
  }, [user, fetchReviewState]);

  // Listen for global custom event 'open-platform-review-modal'
  useEffect(() => {
    const handleGlobalEvent = () => {
      openModalManually();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("open-platform-review-modal", handleGlobalEvent);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-platform-review-modal", handleGlobalEvent);
      }
    };
  }, [openModalManually]);

  // Smart prompt evaluation engine
  useEffect(() => {
    if (!user) return;

    // Check if current route is excluded (critical workflows)
    const isExcluded = EXCLUDED_ROUTES.some((route) => pathname.startsWith(route));
    if (isExcluded) return;

    // Check session storage guard (never prompt twice in same browser session)
    if (typeof window !== "undefined") {
      const alreadyPrompted = sessionStorage.getItem("helpmeman_review_prompt_session");
      if (alreadyPrompted === "true") return;
    }

    let isMounted = true;
    const evaluate = async () => {
      const state = await fetchReviewState();
      if (!state || !isMounted) return;

      // 1. If user already submitted a review, NEVER auto-prompt
      if (state.platformReviewSubmitted) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("helpmeman_review_prompt_session", "true");
        }
        return;
      }

      // 2. Check cooldown date
      if (state.reviewCooldownUntil) {
        const cooldown = new Date(state.reviewCooldownUntil);
        if (cooldown > new Date()) return;
      }

      // 3. Track session visits count in localStorage
      let visitCount = 1;
      if (typeof window !== "undefined") {
        const storedVisits = parseInt(localStorage.getItem("helpmeman_visit_count") || "0", 10);
        const lastVisitDate = localStorage.getItem("helpmeman_last_visit_date");
        const today = new Date().toDateString();

        if (lastVisitDate !== today) {
          visitCount = storedVisits + 1;
          localStorage.setItem("helpmeman_visit_count", visitCount.toString());
          localStorage.setItem("helpmeman_last_visit_date", today);
        } else {
          visitCount = storedVisits || 1;
        }
      }

      // Engagement condition: User has >=1 completed booking OR visitCount >= 2
      const isEngaged = (state.completedBookingsCount || 0) >= 1 || visitCount >= 2;

      if (!isEngaged) return;

      // Delayed timer: Wait 8 seconds after page mount before showing auto-prompt
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!isMounted) return;
        if (typeof window !== "undefined") {
          const checkAgain = sessionStorage.getItem("helpmeman_review_prompt_session");
          if (checkAgain === "true") return;
          sessionStorage.setItem("helpmeman_review_prompt_session", "true");
        }
        setIsOpen(true);
      }, 8000);
    };

    evaluate();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user, pathname, fetchReviewState]);

  const handleCloseModal = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("helpmeman_review_prompt_session", "true");
    }
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    onClose: handleCloseModal,
    existingReview,
    openModalManually,
    mutateReviewState: fetchReviewState,
    loadingReviewState,
  };
}
