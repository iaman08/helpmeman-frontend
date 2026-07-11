"use client";

export default function Loading() {
  return (
    <div className="w-full space-y-6 md:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-28 bg-(--fg)/10 rounded-lg" />
        <div className="h-10 w-64 bg-(--fg)/10 rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="h-40 bg-(--fg)/[0.02] border border-(--hairline) rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 w-40 bg-(--fg)/10 rounded-lg" />
            <div className="h-3 w-56 bg-(--fg)/10 rounded-lg" />
          </div>
          <div className="h-8 w-24 bg-(--fg)/10 rounded-lg" />
        </div>
        <div className="h-40 bg-(--fg)/[0.02] border border-(--hairline) rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 w-40 bg-(--fg)/10 rounded-lg" />
            <div className="h-3 w-56 bg-(--fg)/10 rounded-lg" />
          </div>
          <div className="h-8 w-24 bg-(--fg)/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
