import Link from "next/link";
import { Star, Building2 } from "lucide-react";
import { InstitutionBadge } from "./InstitutionBadge";
import { useState } from "react";
import type { Mentor } from "@/lib/types";

type Props = {
  mentor: Mentor;
};

function formatPrice(paise: number): string {
  return `₹${Math.round(paise / 100)}`;
}

function CompanyLogo({ company }: { company: string }) {
  const [error, setError] = useState(false);
  const companyLogoUrl = `https://logo.clearbit.com/${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  return (
    <div className="h-8 w-8 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0 border border-neutral-200">
      {!error ? (
        <img
          src={companyLogoUrl}
          alt={company}
          className="h-full w-full object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <Building2 className="h-4 w-4 text-neutral-400" />
      )}
    </div>
  );
}

export function MentorCard({ mentor }: Props) {
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = mentor.avatar || `https://i.pravatar.cc/150?u=${mentor.id}`;
  const initials = mentor.displayName.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/mentors/${mentor.id}`}
      className="group flex flex-col gap-4 rounded-2xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 p-5 sm:p-6 transition-colors border border-transparent hover:border-(--hairline)"
    >
      {/* ─── Header ─── */}
      <div className="flex items-center gap-4">
        {!avatarError ? (
          <img
            src={avatarUrl}
            alt={mentor.displayName}
            className="h-14 w-14 rounded-full object-cover shrink-0 border border-(--hairline)"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--fg)/8 text-lg font-medium shrink-0 border border-(--hairline)">
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
            </span>
          )}
        </div>
      </div>

      {/* ─── Company / Institution ─── */}
      <div className="flex flex-col gap-2 mt-2">
        {mentor.company && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-(--fg)/5 border border-(--hairline)">
            <CompanyLogo company={mentor.company} />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-[0.2em] text-(--muted) font-bold leading-none">
                Company
              </span>
              <span className="text-sm font-bold truncate">
                {mentor.company}
              </span>
            </div>
          </div>
        )}
        
        <InstitutionBadge
          institutionName={mentor.institutionName}
          institutionType={mentor.institutionType}
          className="self-start"
        />
      </div>

      {/* ─── Bio snippet ─── */}
      <p className="text-sm text-(--muted) leading-relaxed line-clamp-2 mt-1">
        {mentor.bio}
      </p>

      {/* ─── Footer ─── */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-(--hairline)">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold">
              {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
            </span>
          </div>
          <span className="text-xs text-(--muted) font-medium">
            {mentor.totalSessions} session{mentor.totalSessions !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="font-display text-lg text-(--accent)">
          {formatPrice(mentor.pricePerSession)}
        </span>
      </div>
    </Link>
  );
}
