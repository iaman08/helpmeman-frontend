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
    blurb: "Branch reality-check, internships, skills, side projects.",
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
    <div className="w-full px-5 sm:px-10 lg:px-24 py-14 sm:py-20">
      {/* Headline */}
      <div className="max-w-3xl mb-10 sm:mb-14">
        <h2 className="font-display text-[clamp(1.6rem,4.5vw,3.6rem)] leading-[1.05]">
          Real mentorship, at the price of
          <span className="italic"> a meal out.</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-(--muted) max-w-md">
          One transparent price. No subscriptions. Pay once, talk to someone who&rsquo;s been there.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12 sm:mb-14">
        {tiers.map((t) => (
          <div
            key={t.price}
            className={`flex flex-col justify-between gap-5 rounded-2xl p-5 sm:p-6 transition-colors ${
              t.feature
                ? "bg-(--fg)/5 border border-(--hairline)"
                : "hover:bg-(--fg)/3"
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.22em] text-(--muted)">
                  {t.tag}
                </span>
                {t.feature && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-(--accent)">
                    <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />
                    Popular
                  </span>
                )}
              </div>
              <div>
                <div className="font-display text-[clamp(1.6rem,2.5vw,2.4rem)] leading-none">
                  {t.price}
                </div>
                <div className="mt-1.5 text-sm text-(--fg)/90">{t.audience}</div>
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
              className={`self-start rounded-full px-5 py-2.5 sm:py-3 text-sm tracking-wide transition-opacity ${
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

      {/* Footer */}
      <div className="pt-6 sm:pt-8 border-t border-(--hairline)">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-(--muted)">
          <ul className="flex flex-wrap items-center gap-x-5 sm:gap-x-8 gap-y-2 uppercase tracking-[0.22em]">
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
