const steps = [
  {
    n: "01",
    t: "Choose stage",
    d: "Tell us where you are. We'll match you.",
  },
  {
    n: "02",
    t: "Pick a mentor",
    d: "Browse verified profiles from top firms.",
  },
  {
    n: "03",
    t: "Book session",
    d: "Pay once. Meet on a private call.",
  },
];

export function HowItWorks() {
  return (
    <div className="w-full px-5 sm:px-10 lg:px-24 py-12 sm:py-16">
      <h2 className="font-display text-[clamp(1.6rem,4.5vw,3.6rem)] leading-[1.05] max-w-2xl mb-10">
        Three steps to
        <span className="italic"> the right mentor.</span>
      </h2>

      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <li key={s.n} className="flex flex-col gap-3">
            <span className="font-display text-4xl leading-none text-(--muted)">
              {s.n}
            </span>
            <div
              aria-hidden
              className="h-px w-full"
              style={{ background: i === 0 ? "var(--accent)" : "var(--hairline)" }}
            />
            <h3 className="font-display text-xl leading-snug">{s.t}</h3>
            <p className="text-sm text-(--muted)">{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
