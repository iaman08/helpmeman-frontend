import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center bg-bg text-fg">
      <h1 className="text-[120px] font-bold leading-none tracking-tighter text-zinc-300 dark:text-zinc-800 select-none">
        404
      </h1>
      <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed text-base">
        The page you&rsquo;re looking for doesn&rsquo;t exist, was renamed, or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
        <Link
          href="/"
          className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-7 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Go to Homepage
        </Link>
        <Link
          href="/mentors"
          className="rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-7 py-3 text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Browse Verified Mentors
        </Link>
      </div>
    </main>
  );
}
