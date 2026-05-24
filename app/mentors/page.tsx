"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, X, LayoutDashboard, CalendarCheck, MessageCircle, Settings, Search as SearchIcon, Sparkles } from "lucide-react";
import { useMentors, useCategories, type MentorFilters } from "@/lib/hooks";
import { MentorCard } from "@/components/MentorCard";
import { MentorCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { Navbar } from "@/components/Navbar";
import { SidebarShell } from "@/components/SidebarShell";
import { useAuth } from "@/lib/auth-context";
import { ShareProfileModal } from "@/components/ShareProfileModal";
import type { Mentor } from "@/lib/types";

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
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState<MentorFilters>({
    page: 1,
    limit: 12,
    sortBy: "rating",
  });
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShareMentor, setSelectedShareMentor] = useState<Mentor | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

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

  const content = (
    <div className={`w-full ${user ? '' : 'max-w-[1400px] mx-auto px-5 sm:px-10 pt-24 sm:pt-28'} pb-10`}>
      {/* ─── Page Title ─── */}
      <div className="flex flex-col gap-2 mb-6 sm:mb-8">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-(--muted) font-bold">
          Explore mentors
        </p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl leading-tight">
          Find the right mentor
          <span className="italic"> for your stage.</span>
        </h1>
      </div>

      {/* ─── Search + Filter Bar ─── */}
      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--muted) group-focus-within:text-(--fg) transition-colors" />
            <input
              type="text"
              placeholder="Search by name, institution, or skill…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl sm:rounded-2xl pl-11 pr-4 py-3 sm:py-4 text-base sm:text-sm outline-none focus:border-(--fg)/20 focus:bg-(--fg)/10 transition-all shadow-sm placeholder:text-(--muted)"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSearch}
              className="flex-1 sm:flex-none rounded-xl sm:rounded-2xl bg-(--accent) text-(--accent-fg) px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border px-4 sm:px-6 py-3 sm:py-4 text-sm font-bold transition-all active:scale-95 cursor-pointer ${showFilters
                  ? "bg-(--fg)/10 border-(--fg)/20 text-(--fg)"
                  : "bg-(--fg)/5 border-(--hairline) text-(--muted) hover:border-(--fg)/20 hover:text-(--fg)"
                }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--accent) text-(--accent-fg) text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filters Dialog Modal ─── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-(--bg) border border-(--hairline) rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-6 md:p-10 shadow-2xl flex flex-col gap-6 sm:gap-8 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold">Refine Search</h3>
                <p className="text-sm text-(--muted) mt-1">Find the perfect mentor.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-2.5 sm:p-3 bg-(--fg)/5 hover:bg-(--fg)/10 border border-(--hairline) rounded-full transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-(--muted)" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Category</label>
                <select
                  value={filters.category ?? ""}
                  onChange={(e) =>
                    updateFilter("category", e.target.value || undefined)
                  }
                  className="w-full bg-(--bg) border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm focus:border-(--fg)/20 cursor-pointer appearance-none transition-all hover:bg-(--fg)/5"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Institution Type */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Institution</label>
                <select
                  value={filters.institutionType ?? ""}
                  onChange={(e) =>
                    updateFilter("institutionType", e.target.value || undefined)
                  }
                  className="w-full bg-(--bg) border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm focus:border-(--fg)/20 cursor-pointer appearance-none transition-all hover:bg-(--fg)/5"
                >
                  {INSTITUTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Min Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.minPrice ? filters.minPrice / 100 : ""}
                  onChange={(e) =>
                    updateFilter(
                      "minPrice",
                      e.target.value ? Number(e.target.value) * 100 : undefined,
                    )
                  }
                  className="w-full bg-(--bg) border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm focus:border-(--fg)/20 transition-all placeholder:text-(--muted)"
                />
              </div>

              {/* Max Price */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-(--muted) font-bold ml-1">Max Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={filters.maxPrice ? filters.maxPrice / 100 : ""}
                  onChange={(e) =>
                    updateFilter(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) * 100 : undefined,
                    )
                  }
                  className="w-full bg-(--bg) border border-(--hairline) rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-sm focus:border-(--fg)/20 transition-all placeholder:text-(--muted)"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-(--hairline)">
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
                className="w-full sm:w-auto px-6 py-3 sm:py-4 text-sm font-bold text-(--muted) hover:text-(--fg) transition-colors cursor-pointer order-2 sm:order-1"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-(--accent) text-(--accent-fg) rounded-xl sm:rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer order-1 sm:order-2"
              >
                Show Results {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sort ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <span className="text-sm text-(--muted) font-medium">
          Showing <span className="text-(--fg)">{data?.total ?? 0}</span> mentor{data?.total !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] uppercase tracking-widest text-(--muted) font-bold shrink-0">Sort by:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter("sortBy", opt.value)}
              className={`rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${filters.sortBy === opt.value
                  ? "bg-(--accent) text-(--accent-fg) shadow-lg"
                  : "bg-(--fg)/5 text-(--muted) hover:text-(--fg) border border-(--hairline)"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Grid ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {data.mentors.map((m) => (
              <MentorCard
                key={m.id}
                mentor={m}
                onShare={(mentor) => {
                  setSelectedShareMentor(mentor);
                  setIsShareOpen(true);
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: p }))
                    }
                    className={`h-9 w-9 rounded-full text-sm transition-colors cursor-pointer ${data.page === p
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

      {selectedShareMentor && (
        <ShareProfileModal
          isOpen={isShareOpen}
          onClose={() => {
            setIsShareOpen(false);
            setSelectedShareMentor(null);
          }}
          mentor={selectedShareMentor}
        />
      )}
    </div>
  );

  if (user) {
    const NAV = [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/dashboard/chat", label: "Chat", icon: MessageCircle },
      {
        onClick: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("open-ai"));
          }
        },
        label: "AI Assistant",
        icon: Sparkles,
      },
      { href: "/mentors", label: "Browse Mentors", icon: SearchIcon },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    return (
      <SidebarShell
        navItems={NAV}
        rootPath="/dashboard"
        brandLabel="Dashboard"
        userName={user.name}
        userEmail={user.email}
        userAvatar={user.avatar}
        onLogout={async () => {
          await logout();
          window.location.href = "/signin";
        }}
      >
        {content}
      </SidebarShell>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{content}</main>
    </div>
  );
}
