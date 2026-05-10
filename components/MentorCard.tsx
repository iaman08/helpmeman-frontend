import Link from "next/link";
import { Star } from "lucide-react";
import { InstitutionBadge } from "./InstitutionBadge";
import type { Mentor } from "@/lib/types";

type Props = {
  mentor: Mentor;
};

function formatPrice(paise: number): string {
  return `₹${Math.round(paise / 100)}`;
}

export function MentorCard({ mentor }: Props) {
  const initials = mentor.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="group flex flex-col gap-5 rounded-2xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 p-6 transition-colors"
    >
      {/* ─── Header ─── */}
      <div className="flex items-center gap-4">
        {mentor.avatar ? (
          <img
            src={mentor.avatar}
            alt={mentor.displayName}
            className="h-12 w-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--fg)/8 text-sm font-medium shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-display text-lg leading-tight truncate">
            {mentor.displayName}
          </span>
          {mentor.currentRole && (
            <span className="text-xs text-(--muted) truncate">
              {mentor.currentRole}
              {mentor.company ? ` at ${mentor.company}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* ─── Institution ─── */}
      <InstitutionBadge
        institutionName={mentor.institutionName}
        institutionType={mentor.institutionType}
        className="self-start"
      />

      {/* ─── Bio snippet ─── */}
      <p className="text-sm text-(--muted) leading-relaxed line-clamp-2">
        {mentor.bio}
      </p>

      {/* ─── Expertise tags ─── */}
      {mentor.expertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {mentor.expertise.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-(--fg)/5 px-2.5 py-1 text-[11px] text-(--fg)/70"
            >
              {tag}
            </span>
          ))}
          {mentor.expertise.length > 4 && (
            <span className="rounded-full bg-(--fg)/5 px-2.5 py-1 text-[11px] text-(--muted)">
              +{mentor.expertise.length - 4}
            </span>
          )}
        </div>
      )}

      {/* ─── Footer ─── */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">
              {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
            </span>
          </div>
          <span className="text-xs text-(--muted)">
            {mentor.totalSessions} session{mentor.totalSessions !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="font-display text-lg">
          {formatPrice(mentor.pricePerSession)}
        </span>
      </div>
    </Link>
  );
}
