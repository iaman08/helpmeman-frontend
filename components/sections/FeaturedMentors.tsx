import Link from "next/link";
import { Star } from "lucide-react";

const MENTORS = [
  {
    name: "Arjun Verma",
    role: "SDE-3 at Google",
    rating: "5.0",
    img: "https://i.pravatar.cc/150?img=11",
    tags: ["Algorithms", "Career"]
  },
  {
    name: "Priya Sharma",
    role: "Product at Meta",
    rating: "4.9",
    img: "https://i.pravatar.cc/150?img=32",
    tags: ["Product", "Strategy"]
  },
  {
    name: "Rohit Mehra",
    role: "Founder at YC W23",
    rating: "5.0",
    img: "https://i.pravatar.cc/150?img=12",
    tags: ["Founding", "Growth"]
  },
  {
    name: "Sneha Gupta",
    role: "Consultant at McKinsey",
    rating: "4.8",
    img: "https://i.pravatar.cc/150?img=44",
    tags: ["Case Study", "MBA"]
  }
];

export function FeaturedMentors() {
  return (
    <div className="w-full px-5 sm:px-10 lg:px-24 py-16 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-(--muted) font-bold mb-3">
            Top Rated
          </p>
          <h2 className="font-display text-[clamp(1.6rem,4.5vw,3.6rem)] leading-[1.05]">
            Talk to the 
            <span className="italic"> best in the field.</span>
          </h2>
        </div>
        <Link 
          href="/signin" 
          className="text-sm font-bold border-b border-(--fg) pb-1 hover:text-(--muted) hover:border-(--muted) transition-colors"
        >
          View all mentors →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MENTORS.map((m) => (
          <div key={m.name} className="group relative flex flex-col gap-4">
            <div className="aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-(--fg)/5 border border-(--hairline)">
              <img 
                src={m.img} 
                alt={m.name} 
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold">{m.rating}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-xl">{m.name}</h3>
              <p className="text-sm text-(--muted)">{m.role}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {m.tags.map(t => (
                  <span key={t} className="text-[10px] uppercase tracking-wider font-bold bg-(--fg)/5 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
