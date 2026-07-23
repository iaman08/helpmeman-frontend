"use client";

import { useSmartReviewPrompt } from "@/hooks/useSmartReviewPrompt";
import { PlatformReviewModal } from "@/components/PlatformReviewModal";

export function PlatformReviewTrigger() {
  const { isOpen, onClose, existingReview, mutateReviewState } = useSmartReviewPrompt();

  return (
    <PlatformReviewModal
      isOpen={isOpen}
      onClose={onClose}
      existingReview={existingReview}
      onReviewSubmitted={() => mutateReviewState()}
      onReviewDeleted={() => mutateReviewState()}
    />
  );
}
