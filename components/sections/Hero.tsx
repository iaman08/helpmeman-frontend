import Link from "next/link";

const LOGOS = [
  { name: "Google", img: "https://logo.clearbit.com/google.com" },
  { name: "Meta", img: "https://logo.clearbit.com/meta.com" },
  { name: "Y Combinator", img: "https://logo.clearbit.com/ycombinator.com" },
  { name: "IIT Delhi", img: "https://logo.clearbit.com/iitd.ac.in" },
  { name: "AIIMS", img: "https://logo.clearbit.com/aiims.edu" },
  { name: "Goldman Sachs", img: "https://logo.clearbit.com/goldmansachs.com" },
];

const STATS = [
  { value: "500+", label: "Verified Mentors" },
  { value: "₹129", label: "Starting Price" },
  { value: "60s", label: "To Get Matched" },
];

export function Hero() {
  return (
    <div className="w-full px-5 sm:px-10 lg:px-24 pt-24 sm:pt-32 pb-12 sm:pb-16">
      {/* Main Headline */}
      <div className="max-w-4xl">
        <h1 className="font-display text-[clamp(2.2rem,7vw,5.5rem)] leading-[0.96] tracking-tight">
          Get your mentor
          <br className="hidden sm:block" />
          <span className="italic"> in 60 seconds.</span>
        </h1>
      </div>

      {/* CTA */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Link
          href="/signin"
          className="rounded-full bg-(--accent) text-(--accent-fg) px-8 py-4 text-sm font-bold tracking-wide hover:opacity-90 transition-opacity text-center"
        >
          Find Your Mentor →
        </Link>
        <Link
          href="/signin"
          className="rounded-full bg-(--fg)/6 text-(--fg) px-8 py-4 text-sm font-bold tracking-wide hover:bg-(--fg)/10 transition-colors text-center"
        >
          Browse Mentors
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-6 sm:gap-10">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="font-display text-2xl sm:text-3xl">{s.value}</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-(--muted)">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Logos */}
      <div className="mt-12 sm:mt-16 pt-8 border-t border-(--hairline)">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-(--muted) font-bold mb-5">
          Mentors from
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-(--hairline) bg-(--fg)/[0.02] hover:bg-(--fg)/5 transition-colors text-sm sm:text-base font-medium shadow-sm"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white overflow-hidden shrink-0 shadow-sm border border-neutral-100">
                <img src={logo.img} alt={logo.name} className="h-full w-full object-contain p-1" />
              </div>
              <span className="font-bold">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
