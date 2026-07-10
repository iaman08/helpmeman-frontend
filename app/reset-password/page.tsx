"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/forgot-password");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-sm text-(--muted)">Redirecting to reset flow…</div>
    </main>
  );
}
