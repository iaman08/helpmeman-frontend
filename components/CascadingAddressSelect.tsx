import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES, STATES, CITIES, type Country, type State, type City } from "@/lib/geo-data";

interface AddressValue {
  country: string;
  state: string;
  city: string;
  locality: string;
  postalCode: string;
}

interface CascadingAddressSelectProps {
  value: AddressValue;
  onChange: (val: Partial<AddressValue>) => void;
}

interface DropdownItem {
  id: string;
  label: string;
}

export function CascadingAddressSelect({ value, onChange }: CascadingAddressSelectProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Cascading Row: Country, State, City */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">
            Country
          </span>
          <SearchableSelect
            placeholder="Select Country"
            items={COUNTRIES.map(c => ({ id: c.code, label: c.name }))}
            selectedId={COUNTRIES.find(c => c.name.toLowerCase() === value.country.toLowerCase())?.code || ""}
            onSelect={(item) => {
              const countryName = item?.label || "";
              onChange({
                country: countryName,
                state: "",
                city: ""
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">
            State / Province
          </span>
          <SearchableSelect
            placeholder="Select State"
            disabled={!value.country}
            items={
              value.country
                ? STATES.filter(
                    s =>
                      s.countryCode ===
                      COUNTRIES.find(
                        c => c.name.toLowerCase() === value.country.toLowerCase()
                      )?.code
                  ).map(s => ({ id: s.code, label: s.name }))
                : []
            }
            selectedId={
              STATES.find(s => s.name.toLowerCase() === value.state.toLowerCase())?.code || ""
            }
            onSelect={(item) => {
              const stateName = item?.label || "";
              onChange({
                state: stateName,
                city: ""
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">
            City
          </span>
          <SearchableSelect
            placeholder="Select City"
            disabled={!value.state}
            items={
              value.state
                ? CITIES.filter(
                    c =>
                      c.stateCode ===
                      STATES.find(
                        s => s.name.toLowerCase() === value.state.toLowerCase()
                      )?.code
                  ).map(c => ({ id: c.name, label: c.name }))
                : []
            }
            selectedId={value.city}
            onSelect={(item) => {
              onChange({ city: item?.label || "" });
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Polished Searchable Select Sub-component ─── */
interface SearchableSelectProps {
  placeholder: string;
  items: DropdownItem[];
  selectedId: string;
  disabled?: boolean;
  onSelect: (item: DropdownItem | null) => void;
}

function SearchableSelect({ placeholder, items, selectedId, disabled = false, onSelect }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find(item => item.id === selectedId);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset active index when dropdown items or search queries change
  useEffect(() => {
    setActiveIndex(-1);
  }, [search, isOpen]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex(prev => (prev + 1 < filteredItems.length ? prev + 1 : prev));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen) {
        if (activeIndex >= 0 && activeIndex < filteredItems.length) {
          onSelect(filteredItems[activeIndex]);
          setIsOpen(false);
          setSearch("");
        } else if (filteredItems.length === 1) {
          onSelect(filteredItems[0]);
          setIsOpen(false);
          setSearch("");
        }
      } else {
        setIsOpen(true);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full flex items-center justify-between bg-(--fg)/5 border ${
          isOpen ? "border-orange-500/50 ring-2 ring-orange-500/10" : "border-(--fg)/10"
        } rounded-xl px-4 py-3 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className={selectedItem ? "text-(--fg) font-medium" : "text-(--muted)"}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-(--muted) transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-(--bg) border border-(--fg)/15 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Input inside panel */}
          <div className="relative border-b border-(--fg)/10 px-3 py-2.5">
            <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-(--muted)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-(--fg)/5 border border-(--fg)/5 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all placeholder:text-(--muted)"
            />
          </div>

          {/* Items List */}
          <div className="max-h-52 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-3 text-xs text-(--muted) italic text-center">
                No matches found
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = item.id === selectedId;
                const isActive = idx === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between border-b border-(--fg)/5 last:border-0 ${
                      isSelected
                        ? "bg-orange-500/10 text-orange-500 font-bold"
                        : isActive
                        ? "bg-(--fg)/5 text-(--fg)"
                        : "hover:bg-(--fg)/5 text-(--fg)"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
