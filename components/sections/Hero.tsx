import Link from "next/link";

const trust = [
  "Verified mentors",
  "Affordable pricing",
  "Real guidance",
  "Students & professionals",
];

export function Hero() {
  return (
    <div className="h-full w-full flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-28 pb-12">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-(--muted)">
        <span>Chapter 01 — Hero</span>
        <span className="hidden sm:inline">A mentorship platform</span>
        <span>HelpMeMan</span>
      </div>

      <div className="max-w-5xl">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted) mb-6">
          Mentorship, reimagined
        </p>
        <h1 className="font-display text-[clamp(2.4rem,7vw,6.4rem)] leading-[0.96]">
          Get mentored by people who
          <span className="italic"> already did </span>
          what you want to do.
        </h1>
        <p className="mt-8 max-w-2xl text-base sm:text-lg text-(--muted) leading-relaxed">
          Book affordable, one-on-one sessions with verified mentors from
          IITs, AIIMS, NLUs, FAANG, and the founders of companies you read
          about. No noise. Just the conversations that change a career.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3">
          <Link
            href="/signup"
            className="rounded-full bg-(--accent) text-(--accent-fg) px-7 py-4 text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Sign Up
          </Link>
          <Link
            href="/signin"
            className="rounded-full bg-(--fg)/6 text-(--fg) px-7 py-4 text-sm tracking-wide hover:bg-(--fg)/10 transition-colors"
          >
            Sign In
          </Link>
          <a
            href="#how"
            className="ml-2 px-3 py-4 text-sm tracking-wide text-(--fg)/80 hover:text-(--fg) transition-colors"
          >
            Explore Mentors &nbsp;&rarr;
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div aria-hidden className="h-px w-full" style={{ background: "var(--hairline)" }} />
        <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-10">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-(--fg)/85">
            {trust.map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.2em] text-(--muted)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <span className="text-xs uppercase tracking-[0.22em] text-(--muted)">
            Scroll &darr;
          </span>
        </div>
      </div>
    </div>
  );
}
