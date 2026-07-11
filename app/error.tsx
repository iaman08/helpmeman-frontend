"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <span className="text-2xl">⚠️</span>
      </div>
      <h1 className="font-display text-3xl">Something went wrong.</h1>
      <p className="text-(--muted) max-w-md leading-relaxed">
        An unexpected error occurred. Please try again or return to the home
        page.
      </p>
      <div className="flex items-center gap-4 mt-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90 cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full bg-(--fg)/5 px-7 py-3 text-sm hover:bg-(--fg)/8 transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
