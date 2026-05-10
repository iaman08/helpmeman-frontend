import Link from "next/link";

type Tier = {
  price: string;
  audience: string;
  blurb: string;
  call: string;
  chat: string;
  cta: string;
  tag: string;
  feature?: boolean;
};

const tiers: Tier[] = [
  {
    price: "₹129",
    audience: "11th – 12th guidance",
    blurb: "Stream choice, JEE/NEET strategy, board-vs-entrance balance.",
    call: "1 mentor call",
    chat: "30-day chat",
    cta: "Book at ₹129",
    tag: "Starter",
  },
  {
    price: "₹199",
    audience: "1st / 2nd / 3rd year",
    blurb: "Branch reality-check, internships, skills, side projects, GPA.",
    call: "1 mentor call",
    chat: "30-day chat",
    cta: "Book at ₹199",
    tag: "Most chosen",
  },
  {
    price: "₹249",
    audience: "Internship / job guidance",
    blurb: "Resume, interviews, offer evaluation, first 90-day plans.",
    call: "1 mentor call",
    chat: "30-day chat",
    cta: "Book at ₹249",
    tag: "Career",
  },
  {
    price: "₹499",
    audience: "Top MNC mentors",
    blurb: "Senior engineers and PMs from FAANG, quant firms, and unicorns.",
    call: "1 mentor call",
    chat: "7-day chat",
    cta: "Book at ₹499",
    tag: "Premium",
    feature: true,
  },
];

export function Pricing() {
  return (
    <div className="h-full w-full flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-28 pb-12">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-(--muted)">
        <span>Chapter 04 — Pricing</span>
        <span className="hidden sm:inline">Honest. Flat. Affordable.</span>
        <span>004</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-6">
        <div className="lg:col-span-8">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted) mb-6">
            Pricing
          </p>
          <h2 className="font-display text-[clamp(2rem,5.4vw,4.8rem)] leading-none">
            Real mentorship, at the price of
            <span className="italic"> a meal out.</span>
          </h2>
        </div>
        <div className="lg:col-span-4 self-end max-w-sm text-(--fg)/85">
          <p className="text-base leading-relaxed">
            One transparent price per stage. No subscriptions, no hidden
            upsells. Pay once, talk to someone who&rsquo;s been there.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map((t) => (
          <div
            key={t.price}
            className={`flex flex-col justify-between gap-6 rounded-2xl p-6 transition-colors ${
              t.feature
                ? "bg-(--fg)/5 hover:bg-(--fg)/7"
                : "bg-transparent hover:bg-(--fg)/3"
            }`}
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.22em] text-(--muted)">
                  {t.tag}
                </span>
                {t.feature && (
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-(--accent)">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
                    Highlighted
                  </span>
                )}
              </div>
              <div>
                <div className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-none">
                  {t.price}
                </div>
                <div className="mt-2 text-sm text-(--fg)/90">{t.audience}</div>
              </div>
              <p className="text-sm text-(--muted) leading-relaxed">{t.blurb}</p>
              <ul className="flex flex-col gap-1.5 text-sm">
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-(--fg)" />
                  {t.call}
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-(--fg)" />
                  {t.chat}
                </li>
              </ul>
            </div>

            <Link
              href="/signup"
              className={`self-start rounded-full px-5 py-3 text-sm tracking-wide transition-opacity ${
                t.feature
                  ? "bg-(--accent) text-(--accent-fg) hover:opacity-90"
                  : "text-(--fg) hover:opacity-70"
              }`}
            >
              {t.cta} {t.feature ? "" : "→"}
            </Link>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div aria-hidden className="h-px w-full" style={{ background: "var(--hairline)" }} />
        <div className="flex flex-wrap items-center justify-between gap-y-3 text-xs text-(--muted)">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 uppercase tracking-[0.22em]">
            <li>Verified mentors</li>
            <li>No subscription</li>
            <li>Refundable if mentor cancels</li>
          </ul>
          <span className="uppercase tracking-[0.22em]">
            © HelpMeMan {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}
