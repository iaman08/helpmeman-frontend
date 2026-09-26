"use client";

import { useRouter } from "next/navigation";
import LinkedInOnboarding from "@/components/mentor/LinkedInOnboarding";

export default function BecomeMentorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <LinkedInOnboarding
        onContinueManual={() => router.push("/onboarding?role=mentor&mode=manual")}
      />
    </div>
  );
}
