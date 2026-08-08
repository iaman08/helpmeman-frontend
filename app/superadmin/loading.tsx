"use client";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 rounded animate-pulse" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
        <div className="h-10 w-64 rounded-lg animate-pulse" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "color-mix(in srgb, var(--fg) 4%, transparent)", border: "1px solid var(--hairline)" }} />
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-8">
        <div className="h-6 w-48 rounded animate-pulse" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)" }} />
        <div className="h-64 w-full rounded-2xl animate-pulse" style={{ background: "color-mix(in srgb, var(--fg) 4%, transparent)", border: "1px solid var(--hairline)" }} />
      </div>
    </div>
  );
}
