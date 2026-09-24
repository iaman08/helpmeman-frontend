"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <span className="text-2xl">⚠️</span>
      </div>
      <h1 className="font-display text-3xl">Something went wrong.</h1>
      <p className="max-w-md leading-relaxed" style={{ color: "var(--muted)" }}>
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="flex items-center gap-4 mt-2">
        <Button
          type="button"
          onClick={reset}
          className="rounded-full px-7 py-3 text-sm font-medium h-auto"
        >
          Try again
        </Button>
        <Link href="/">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-7 py-3 text-sm font-medium h-auto"
          >
            Go home
          </Button>
        </Link>
      </div>
    </main>
  );
}
