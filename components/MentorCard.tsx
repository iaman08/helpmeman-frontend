"use client";

import { ProfileCard } from "./ProfileCard";
import type { Mentor } from "@/lib/types";

type Props = {
  mentor: Mentor;
  onShare?: (mentor: Mentor) => void;
  className?: string;
};

export function MentorCard({ mentor, onShare, className }: Props) {
  return (
    <ProfileCard
      mentor={mentor}
      mode="mentor"
      onShare={onShare as any}
      className={className}
    />
  );
}

