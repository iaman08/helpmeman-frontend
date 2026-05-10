const steps = [
  {
    n: "01",
    t: "Choose your stage",
    d: "Tell us where you are — Class 12, undergrad, early career, or mid-career. We match on stage, not vibes.",
    meta: "60 seconds",
  },
  {
    n: "02",
    t: "Pick a mentor",
    d: "Browse a small, hand-picked shortlist. Read their path, focus areas, and what mentees say.",
    meta: "Verified profiles",
  },
  {
    n: "03",
    t: "Book a session",
    d: "Pick a 30 or 60 minute slot, pay once, and meet on a private call. Notes and follow-ups land in your dashboard.",
    meta: "From ₹129",
  },
];

export function HowItWorks() {
  return (
    <div className="h-full w-full flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-28 pb-12">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-(--muted)">
        <span>Chapter 03 — How it works</span>
        <span className="hidden sm:inline">Three steps. No friction.</span>
        <span>003</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-8">
        <div className="lg:col-span-8">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted) mb-6">
            How it works
          </p>
          <h2 className="font-display text-[clamp(2rem,5.4vw,4.8rem)] leading-none">
            From a question in your head
            <span className="italic"> to the right person, </span>
            in three steps.
          </h2>
        </div>
        <div className="lg:col-span-4 self-end max-w-sm text-(--fg)/85">
          <p className="text-base leading-relaxed">
            A Class 12 student preparing for JEE meets someone who cracked it
            two years ago. A junior engineer switching to ML meets the
            engineer who already made that switch.
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
        {steps.map((s, i) => (
          <li key={s.n} className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[clamp(3rem,5.5vw,5rem)] leading-none">
                {s.n}
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-(--muted)">
                {s.meta}
              </span>
            </div>
            <div
              aria-hidden
              className="h-px w-full"
              style={{ background: i === 0 ? "var(--accent)" : "var(--hairline)" }}
            />
            <h3 className="font-display text-2xl leading-snug">{s.t}</h3>
            <p className="text-sm text-(--muted) leading-relaxed max-w-sm">{s.d}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-y-3 text-xs uppercase tracking-[0.22em] text-(--muted)">
        <span>Quick · Simple · Affordable</span>
        <span>See pricing &darr;</span>
      </div>
    </div>
  );
}
