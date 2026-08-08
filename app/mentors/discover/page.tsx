"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DiscoverPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mentors?tab=discover");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var()] text-[var()]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-[var()] border-t-transparent animate-spin" />
        <p className="text-xs text-[var()]">Redirecting to Discover Mode...</p>
      </div>
    </div>
  );
}
