"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, GraduationCap, Check, Search, ChevronDown, Plus } from "lucide-react";
import { OrganizationLogo } from "./OrganizationLogo";
import api from "@/lib/api";
import type { OrganizationBranding } from "@/lib/types";

interface Props {
  value: string;
  onChange: (value: string, org?: OrganizationBranding | null) => void;
  type?: "COMPANY" | "UNIVERSITY";
  placeholder?: string;
  label?: string;
}

export function OrganizationAutocomplete({
  value,
  onChange,
  type = "COMPANY",
  placeholder = type === "COMPANY" ? "e.g. Google, Meta, Microsoft" : "e.g. IIT Delhi, IIT Bombay, NIT Jalandhar",
}: Props) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<OrganizationBranding[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchOrgs = async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/organizations/search`, {
        params: { q: text.trim(), type: type || undefined, limit: 8 },
      });
      setResults(res.data?.organizations || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setQuery(nextVal);
    onChange(nextVal, null);
    setIsOpen(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchOrgs(nextVal);
    }, 250);
  };

  const handleSelect = (org: OrganizationBranding) => {
    setQuery(org.name);
    onChange(org.name, org);
    setIsOpen(false);
  };

  const isEdu = type === "UNIVERSITY";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-[var(--muted)] pointer-events-none">
          {isEdu ? <GraduationCap size={16} /> : <Building2 size={16} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (query) searchOrgs(query);
          }}
          placeholder={placeholder}
          className="w-full rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 3%, transparent)",
            color: "var(--fg)",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("", null);
            }}
            className="absolute right-3 p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 top-full mt-1.5 rounded-2xl shadow-2xl overflow-hidden border border-[var(--hairline)] animate-in fade-in slide-in-from-top-1 duration-150"
          style={{
            background: "var(--bg)",
          }}
        >
          {loading && (
            <div className="px-4 py-3 text-xs text-[var(--muted)] flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin" />
              <span>Searching verified organizations...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="max-h-60 overflow-y-auto divide-y divide-[var(--hairline)]">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] bg-[color:var(--fg)]/[0.02]">
                Verified Organizations
              </div>
              {results.map((org) => {
                const isSelected = query.toLowerCase() === org.name.toLowerCase();
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelect(org)}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between hover:bg-[color:var(--fg)]/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <OrganizationLogo name={org.name} type={org.type} branding={org} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[var(--fg)] truncate">{org.name}</span>
                        {org.domain && (
                          <span className="text-[10px] text-[var(--muted)] truncate">{org.domain}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-blue-500 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-3 text-xs text-[var(--muted)]">
              <p>No verified organization found for &ldquo;{query}&rdquo;.</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-2 text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Use &ldquo;{query}&rdquo; as custom organization</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
