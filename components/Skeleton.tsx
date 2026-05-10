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
        "animate-pulse bg-(--fg)/8",
        circle ? "rounded-full" : "rounded-lg",
        className,
      )}
    />
  );
}

export function MentorCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-(--fg)/3 p-6">
      <div className="flex items-center gap-4">
        <Skeleton circle className="h-12 w-12 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 mt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}
