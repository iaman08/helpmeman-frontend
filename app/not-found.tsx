import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-[120px] leading-none text-(--fg)/10">
        404
      </h1>
      <h2 className="font-display text-3xl">Page not found.</h2>
      <p className="text-(--muted) max-w-md leading-relaxed">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <div className="flex items-center gap-4 mt-2">
        <Link
          href="/"
          className="rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/?auth=signup"
          className="rounded-full bg-(--fg)/5 px-7 py-3 text-sm hover:bg-(--fg)/8 transition-colors"
        >
          Browse mentors
        </Link>
      </div>
    </main>
  );
}
