import { clsx } from "clsx";

type SkeletonProps = {
  className?: string;
  /** Renders a circular skeleton */
  circle?: boolean;
};

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        "animate-pulse bg-[var(--fg)]/8",
        circle ? "rounded-full" : "rounded-lg",
        className,
      )}
      style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}
    />
  );
}

export function MentorCardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
    >
      {/* Banner placeholder */}
      <div className="w-full h-28 sm:h-32 bg-neutral-100 dark:bg-zinc-800 animate-pulse shrink-0 border-b border-[var(--hairline)]" />

      {/* Body */}
      <div className="flex flex-col flex-1 px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-10 sm:-mt-11 mb-2.5">
          <div className="h-[72px] w-[72px] sm:h-20 sm:w-20 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-900 bg-neutral-200 dark:bg-zinc-700 animate-pulse shrink-0" />
        </div>

        {/* Name and title */}
        <div className="flex flex-col gap-2 mt-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>

        {/* Skills */}
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-3.5">
          <Skeleton className="h-3.5 w-24" />
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-zinc-800">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}
