"use client";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMentors, useCategories, type MentorFilters } from "@/lib/hooks";
import { MentorCard } from "@/components/MentorCard";
import { MentorCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Navbar } from "@/components/Navbar";

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "price", label: "Lowest Price" },
  { value: "sessions", label: "Most Sessions" },
  { value: "newest", label: "Newest" },
];

const INSTITUTION_TYPES = [
  { value: "", label: "All" },
  { value: "COLLEGE", label: "College" },
  { value: "COMPANY", label: "Company" },
  { value: "STARTUP", label: "Startup" },
];

export default function MentorsPage() {
  const [filters, setFilters] = useState<MentorFilters>({
    page: 1,
    limit: 12,
    sortBy: "rating",
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useMentors(filters);
  const { data: catData } = useCategories();

  const categories = catData?.categories ?? [];

  const updateFilter = useCallback(
    (key: keyof MentorFilters, value: string | number | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    [],
  );

  const handleSearch = useCallback(() => {
    updateFilter("q", searchInput.trim() || undefined);
  }, [searchInput, updateFilter]);

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 12, sortBy: "rating" });
    setSearchInput("");
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.category) count++;
    if (filters.institutionType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-6 sm:px-10 pt-28 pb-16">
        {/* ─── Page Title ─── */}
        <div className="flex flex-col gap-3 mb-10">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
            Explore mentors
          </p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.6rem)] leading-none">
            Find the right mentor
            <span className="italic"> for your stage.</span>
          </h1>
        </div>

        {/* ─── Search + Filter Bar ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--muted)" />
            <input
              type="text"
              placeholder="Search by name, institution, or skill…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-(--fg)/5 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:bg-(--fg)/8 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-full bg-(--accent) text-(--accent-fg) px-6 py-3 text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((p) => !p)}
            className="flex items-center gap-2 rounded-full bg-(--fg)/5 px-5 py-3 text-sm hover:bg-(--fg)/8 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── Filters Panel ─── */}
        {showFilters && (
          <div className="mb-8 rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.22em] text-(--muted)">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-(--muted) hover:text-(--fg) cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                  Category
                </span>
                <select
                  value={filters.category ?? ""}
                  onChange={(e) =>
                    updateFilter("category", e.target.value || undefined)
                  }
                  className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none text-sm cursor-pointer"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Institution Type */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                  Institution
                </span>
                <select
                  value={filters.institutionType ?? ""}
                  onChange={(e) =>
                    updateFilter("institutionType", e.target.value || undefined)
                  }
                  className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none text-sm cursor-pointer"
                >
                  {INSTITUTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Min Price */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                  Min price (₹)
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.minPrice ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "minPrice",
                      e.target.value ? Number(e.target.value) * 100 : undefined,
                    )
                  }
                  className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none text-sm"
                />
              </label>

              {/* Max Price */}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-(--muted) text-xs uppercase tracking-[0.18em]">
                  Max price (₹)
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={filters.maxPrice ?? ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) * 100 : undefined,
                    )
                  }
                  className="bg-(--fg)/5 rounded-lg px-3 py-2.5 outline-none text-sm"
                />
              </label>
            </div>
          </div>
        )}

        {/* ─── Sort ─── */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-(--muted)">
            {data ? `${data.total} mentor${data.total !== 1 ? "s" : ""}` : ""}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-(--muted)">Sort:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFilter("sortBy", opt.value)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  filters.sortBy === opt.value
                    ? "bg-(--accent) text-(--accent-fg)"
                    : "bg-(--fg)/5 text-(--fg)/70 hover:bg-(--fg)/8"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Grid ─── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <MentorCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load mentors"
            description="Please check your connection and try again."
            action={
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full bg-(--accent) text-(--accent-fg) px-6 py-3 text-sm cursor-pointer"
              >
                Retry
              </button>
            }
          />
        ) : data && data.mentors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.mentors.map((m) => (
                <MentorCard key={m.id} mentor={m} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: p }))
                      }
                      className={`h-9 w-9 rounded-full text-sm transition-colors cursor-pointer ${
                        data.page === p
                          ? "bg-(--accent) text-(--accent-fg)"
                          : "bg-(--fg)/5 hover:bg-(--fg)/8"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No mentors found"
            description="Try adjusting your filters or search query."
            action={
              activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full bg-(--fg)/5 px-5 py-2.5 text-sm hover:bg-(--fg)/8 cursor-pointer"
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
