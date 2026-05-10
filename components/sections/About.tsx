const pillars = [
  {
    k: "01",
    t: "Real mentors, not influencers",
    d: "Every mentor on HelpMeMan has actually walked the path — placements, residencies, clerkships, founding teams.",
  },
  {
    k: "02",
    t: "Verified, every single one",
    d: "Verified against institution emails, alumni records, or company domains. If they say IIT or Goldman, they are.",
  },
  {
    k: "03",
    t: "From the rooms you want to be in",
    d: "Mentors from IITs, AIIMS, NLUs, top liberal arts colleges, FAANG, quant firms, and elite founders.",
  },
  {
    k: "04",
    t: "Practical, not performative",
    d: "Specific frameworks, honest tradeoffs, decisions you can act on this week. Never generic life advice.",
  },
];

export function About() {
  return (
    <div className="h-full w-full flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-28 pb-12">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-(--muted)">
        <span>Chapter 02 — About</span>
        <span className="hidden sm:inline">Why HelpMeMan exists</span>
        <span>002</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-10">
        <div className="lg:col-span-7">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted) mb-6">
            About us
          </p>
          <h2 className="font-display text-[clamp(2rem,5.4vw,4.8rem)] leading-none">
            Most career advice is loud.
            <span className="italic"> The good kind is quiet.</span>
          </h2>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-5 self-end max-w-md text-(--fg)/85">
          <p className="text-base sm:text-lg leading-relaxed">
            Students and young professionals are surrounded by noise — about
            entrance exams, internships, placements, the &ldquo;right&rdquo;
            skills, the &ldquo;right&rdquo; pivot. Most of it is written by
            people who haven&rsquo;t done the thing.
          </p>
          <p className="text-base sm:text-lg leading-relaxed">
            We built HelpMeMan so you can skip the noise and talk to someone who
            already made the decision you&rsquo;re trying to make — without
            paying coaching-class money.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
        {pillars.map((p) => (
          <div key={p.k} className="flex flex-col gap-3 pt-5">
            <div aria-hidden className="h-px w-12" style={{ background: "var(--accent)" }} />
            <div className="text-[10px] tracking-[0.22em] text-(--muted)">{p.k}</div>
            <h3 className="font-display text-xl leading-snug">{p.t}</h3>
            <p className="text-sm text-(--muted) leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
