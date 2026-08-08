"use client";

export default function Loading() {
  return (
    <div className="w-full space-y-6 md:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-28 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
        <div className="h-10 w-64 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="h-40 rounded-3xl p-6 flex flex-col justify-between" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <div className="space-y-3">
            <div className="h-5 w-40 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
            <div className="h-3 w-56 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
          </div>
          <div className="h-8 w-24 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
        </div>
        <div className="h-40 rounded-3xl p-6 flex flex-col justify-between" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <div className="space-y-3">
            <div className="h-5 w-40 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
            <div className="h-3 w-56 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
          </div>
          <div className="h-8 w-24 rounded-lg" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
        </div>
      </div>
    </div>
  );
}
