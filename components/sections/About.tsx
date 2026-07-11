const features = [
  {
    t: "Real mentors, not influencers",
    d: "Every mentor has actually walked the path — placements, residencies, founding teams.",
  },
  {
    t: "Verified credentials",
    d: "Verified against institution emails, alumni records, or company domains.",
  },
  {
    t: "IITs · FAANG · YC · AIIMS",
    d: "Mentors from the rooms you want to be in. Top colleges, MNCs, and elite startups.",
  },
  {
    t: "Practical, not generic",
    d: "Specific frameworks and honest tradeoffs you can act on this week.",
  },
];

export function About() {
  return (
    <div className="w-full px-5 sm:px-10 lg:px-24 py-14 sm:py-20">
      {/* Headline */}
      <div className="max-w-3xl mb-10 sm:mb-14">
        <h2 className="font-display text-[clamp(1.6rem,4.5vw,3.6rem)] leading-[1.05]">
          Skip the noise.
          <span className="italic"> Talk to someone who&rsquo;s done it.</span>
        </h2>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col gap-2.5 pt-4 border-t border-(--hairline)">
            <h3 className="font-display text-base sm:text-lg leading-snug">{f.t}</h3>
            <p className="text-sm text-(--muted) leading-relaxed">{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
