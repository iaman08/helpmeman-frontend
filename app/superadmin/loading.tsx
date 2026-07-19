"use client";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 bg-(--fg)/10 rounded animate-pulse" />
        <div className="h-10 w-64 bg-(--fg)/10 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-(--fg)/5 animate-pulse" />
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-8">
        <div className="h-6 w-48 bg-(--fg)/10 rounded animate-pulse" />
        <div className="h-64 w-full rounded-2xl bg-(--fg)/5 animate-pulse" />
      </div>
    </div>
  );
}
