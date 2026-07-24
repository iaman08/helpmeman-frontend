"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { MatchFilters } from "./useSwipeEngine";
import { useCategories } from "@/lib/hooks";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MatchFilters;
  onApply: (filters: MatchFilters) => void;
}

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Punjabi", "Urdu", "Spanish", "French", "German", "Mandarin"];
const SESSION_TYPES = ["Video Call", "Chat", "Career Guidance", "Interview Prep", "Resume Review", "Code Review", "Portfolio Review"];
const EXPERIENCE_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "1+ years", value: 1 },
  { label: "3+ years", value: 3 },
  { label: "5+ years", value: 5 },
  { label: "7+ years", value: 7 },
  { label: "10+ years", value: 10 },
];
const RATING_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "4.0+", value: 4.0 },
  { label: "4.5+", value: 4.5 },
  { label: "4.8+", value: 4.8 },
];

export function FilterSheet({ isOpen, onClose, filters, onApply }: FilterSheetProps) {
  const [local, setLocal] = useState<MatchFilters>(filters);
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];

  const update = (key: keyof MatchFilters, value: unknown) =>
    setLocal((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleClear = () => {
    setLocal({});
    onApply({});
    onClose();
  };

  const activeCount = Object.values(local).filter(
    (v) => v !== undefined && v !== "" && v !== 0 && v !== false
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-xl md:bottom-6 rounded-t-3xl md:rounded-3xl z-50 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl border-t md:border border-(--hairline)"
            style={{
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-(--fg)/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--hairline)">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-(--fg)" />
                <h3 className="text-lg font-bold font-display text-(--fg)">Discovery Filters</h3>
                {activeCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--accent) text-[10px] font-bold text-(--accent-fg)">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-(--fg)/5 hover:bg-(--fg)/10 transition-colors cursor-pointer text-(--fg)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 pb-28">
              {/* Category */}
              <FilterSection title="Category">
                <div className="relative">
                  <select
                    value={local.category ?? ""}
                    onChange={(e) => update("category", e.target.value || undefined)}
                    className="w-full appearance-none bg-(--fg)/4 border border-(--hairline) hover:border-(--fg)/20 rounded-xl px-4.5 py-3 text-sm text-(--fg) outline-none focus:border-(--fg)/30 focus:bg-(--fg)/8 cursor-pointer transition-all font-medium"
                  >
                    <option value="" className="bg-(--bg) text-(--fg)">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug} className="bg-(--bg) text-(--fg)">{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-(--muted) pointer-events-none" />
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title="Price Range (₹ / session)">
                <div className="grid grid-cols-2 gap-3.5">
                  <input
                    type="number"
                    placeholder="Min (₹)"
                    value={local.minPrice ? local.minPrice / 100 : ""}
                    onChange={(e) =>
                      update("minPrice", e.target.value ? Number(e.target.value) * 100 : undefined)
                    }
                    className="bg-(--fg)/4 border border-(--hairline) hover:border-(--fg)/20 rounded-xl px-4.5 py-3 text-sm text-(--fg) outline-none focus:border-(--fg)/30 focus:bg-(--fg)/8 placeholder:text-(--muted)/60 transition-all font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Max (₹)"
                    value={local.maxPrice ? local.maxPrice / 100 : ""}
                    onChange={(e) =>
                      update("maxPrice", e.target.value ? Number(e.target.value) * 100 : undefined)
                    }
                    className="bg-(--fg)/4 border border-(--hairline) hover:border-(--fg)/20 rounded-xl px-4.5 py-3 text-sm text-(--fg) outline-none focus:border-(--fg)/30 focus:bg-(--fg)/8 placeholder:text-(--muted)/60 transition-all font-medium"
                  />
                </div>
              </FilterSection>

              {/* Experience */}
              <FilterSection title="Experience Level">
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      label={opt.label}
                      active={local.minExperience === opt.value || (!local.minExperience && opt.value === 0)}
                      onClick={() => update("minExperience", opt.value || undefined)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Rating */}
              <FilterSection title="Minimum Rating">
                <div className="flex flex-wrap gap-2">
                  {RATING_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      label={opt.label}
                      active={local.minRating === opt.value || (!local.minRating && opt.value === 0)}
                      onClick={() => update("minRating", opt.value || undefined)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Language */}
              <FilterSection title="Language">
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <FilterChip
                      key={lang}
                      label={lang}
                      active={local.language === lang}
                      onClick={() => update("language", local.language === lang ? undefined : lang)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Session Type */}
              <FilterSection title="Session Type">
                <div className="flex flex-wrap gap-2">
                  {SESSION_TYPES.map((type) => (
                    <FilterChip
                      key={type}
                      label={type}
                      active={local.sessionType === type}
                      onClick={() => update("sessionType", local.sessionType === type ? undefined : type)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Toggles */}
              <FilterSection title="Quick Filters">
                <div className="flex flex-col gap-3">
                  <Toggle
                    label="Online Now"
                    description="Only show mentors currently online"
                    value={!!local.onlineOnly}
                    onChange={(v) => update("onlineOnly", v || undefined)}
                  />
                  <Toggle
                    label="Verified Only"
                    description="Only verified mentor profiles"
                    value={!!local.verifiedOnly}
                    onChange={(v) => update("verifiedOnly", v || undefined)}
                  />
                  <Toggle
                    label="Free Session Available"
                    description="Mentors offering free first sessions"
                    value={!!local.freeSessionOnly}
                    onChange={(v) => update("freeSessionOnly", v || undefined)}
                  />
                  <Toggle
                    label="Available Today"
                    description="Has open slots for today"
                    value={!!local.availableToday}
                    onChange={(v) => update("availableToday", v || undefined)}
                  />
                </div>
              </FilterSection>

              {/* Search */}
              <FilterSection title="Search">
                <input
                  type="text"
                  placeholder="Search by name, skill, company…"
                  value={local.q ?? ""}
                  onChange={(e) => update("q", e.target.value || undefined)}
                  className="w-full bg-(--fg)/5 border border-(--hairline) rounded-xl px-4 py-3 text-sm text-(--fg) outline-none focus:border-(--fg)/35 placeholder:text-(--muted) transition-all"
                />
              </FilterSection>
            </div>

            {/* Footer */}
            <div 
              className="sticky bottom-0 flex items-center gap-4 px-6 py-4.5 border-t border-(--hairline) backdrop-blur-md"
              style={{ background: "color-mix(in srgb, var(--bg) 95%, transparent)" }}
            >
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-3 text-sm font-bold text-(--muted) hover:text-(--fg) transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <motion.button
                type="button"
                onClick={handleApply}
                whileTap={{ scale: 0.97 }}
                className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-(--fg) text-(--bg) hover:opacity-90 active:scale-97 cursor-pointer"
              >
                Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-(--muted)">{title}</p>
      {children}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border"
      style={{
        background: active ? "var(--fg)" : "transparent",
        borderColor: active ? "var(--fg)" : "var(--hairline)",
        color: active ? "var(--bg)" : "var(--muted)",
      }}
    >
      {label}
    </motion.button>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-(--fg)/5 border border-(--hairline)"
      onClick={() => onChange(!value)}
    >
      <div>
        <p className="text-sm font-medium text-(--fg)">{label}</p>
        <p className="text-xs text-(--muted) mt-0.5">{description}</p>
      </div>
      <div
        className="relative h-6 w-11 rounded-full transition-all flex-shrink-0"
        style={{
          background: value ? "var(--fg)" : "color-mix(in srgb, var(--fg) 15%, transparent)"
        }}
      >
        <motion.div
          animate={{ x: value ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 h-4 w-4 rounded-full shadow-sm"
          style={{ background: "var(--bg)" }}
        />
      </div>
    </div>
  );
}
