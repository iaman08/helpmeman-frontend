import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

interface LanguageOption {
  value: string;
  label: string;
  popular: boolean;
}

const LANGUAGES_DATA: LanguageOption[] = [
  // Popular Languages First
  { value: "English", label: "English", popular: true },
  { value: "Hindi", label: "Hindi (हिन्दी)", popular: true },
  { value: "Punjabi", label: "Punjabi (ਪੰਜਾਬੀ)", popular: true },
  { value: "Bengali", label: "Bengali (বাংলা)", popular: true },
  { value: "Tamil", label: "Tamil (தமிழ்)", popular: true },
  { value: "Telugu", label: "Telugu (తెలుగు)", popular: true },
  { value: "Marathi", label: "Marathi (मराठी)", popular: true },
  { value: "Gujarati", label: "Gujarati (ગુજરાતી)", popular: true },
  { value: "Kannada", label: "Kannada (ಕನ್ನಡ)", popular: true },
  { value: "Malayalam", label: "Malayalam (മലയാളം)", popular: true },
  { value: "Odia", label: "Odia (ଓଡ଼ିଆ)", popular: true },
  
  // Others
  { value: "Urdu", label: "Urdu (اردو)", popular: false },
  { value: "Sanskrit", label: "Sanskrit (संस्कृत)", popular: false },
  { value: "Assamese", label: "Assamese (অসমীয়া)", popular: false },
  { value: "Spanish", label: "Spanish (Español)", popular: false },
  { value: "French", label: "French (Français)", popular: false },
  { value: "German", label: "German (Deutsch)", popular: false },
  { value: "Japanese", label: "Japanese (日本語)", popular: false },
  { value: "Mandarin", label: "Mandarin (中文)", popular: false },
];

interface LanguageMultiSelectProps {
  selectedLanguages: string[];
  onChange: (langs: string[]) => void;
}

export function LanguageMultiSelect({ selectedLanguages = [], onChange }: LanguageMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter languages by search text
  const filteredOptions = LANGUAGES_DATA.filter(lang =>
    lang.label.toLowerCase().includes(search.toLowerCase()) ||
    lang.value.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle selection
  const toggleLanguage = (langValue: string) => {
    if (selectedLanguages.includes(langValue)) {
      onChange(selectedLanguages.filter(l => l !== langValue));
    } else {
      onChange([...selectedLanguages, langValue]);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setActiveIndex(prev => (prev + 1 < filteredOptions.length ? prev + 1 : prev));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen) {
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          toggleLanguage(filteredOptions[activeIndex].value);
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
      {/* Box container for chips and trigger */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`min-h-[52px] w-full bg-(--fg)/5 border ${
          isOpen ? "border-orange-500/50 ring-2 ring-orange-500/10" : "border-(--fg)/10"
        } rounded-xl p-2 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-orange-500/10 focus-within:border-orange-500/40 transition-all cursor-pointer`}
      >
        {selectedLanguages.length === 0 ? (
          <span className="text-sm text-(--muted) px-2 py-1 select-none">
            Select languages spoken...
          </span>
        ) : (
          selectedLanguages.map(lang => (
            <span
              key={lang}
              onClick={(e) => {
                e.stopPropagation(); // Avoid opening the dropdown
                toggleLanguage(lang);
              }}
              className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 pl-3 pr-2 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-500/20 transition-colors"
            >
              <span>{lang}</span>
              <X size={12} className="hover:text-red-500 cursor-pointer" />
            </span>
          ))
        )}

        {/* Floating trigger caret */}
        <div className="ml-auto pr-2 flex items-center">
          <ChevronDown
            size={15}
            className={`text-(--muted) transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-(--bg) border border-(--fg)/15 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Bar inside panel */}
          <div className="relative border-b border-(--fg)/10 px-3 py-2.5">
            <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-(--muted)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-(--fg)/5 border border-(--fg)/5 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all placeholder:text-(--muted)"
            />
          </div>

          {/* Languages Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-(--muted) italic text-center">
                No matching languages found
              </div>
            ) : (
              <>
                {/* Popular Group */}
                {filteredOptions.some(l => l.popular) && (
                  <div className="px-3 py-1.5 bg-(--fg)/[0.02] border-b border-(--fg)/5 text-[9px] uppercase font-bold tracking-wider text-(--muted)">
                    Popular Languages
                  </div>
                )}
                {filteredOptions
                  .filter(l => l.popular)
                  .map((lang, idx) => {
                    const isSelected = selectedLanguages.includes(lang.value);
                    const isActive = idx === activeIndex;

                    return (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => toggleLanguage(lang.value)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between border-b border-(--fg)/5 last:border-0 ${
                          isSelected
                            ? "bg-orange-500/10 text-orange-500 font-bold"
                            : isActive
                            ? "bg-(--fg)/5 text-(--fg)"
                            : "hover:bg-(--fg)/5 text-(--fg)"
                        }`}
                      >
                        <span>{lang.label}</span>
                        {isSelected ? (
                          <Check size={14} className="text-orange-500" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-(--fg)/10" />
                        )}
                      </button>
                    );
                  })}

                {/* Other Group */}
                {filteredOptions.some(l => !l.popular) && (
                  <div className="px-3 py-1.5 bg-(--fg)/[0.02] border-b border-t border-(--fg)/5 text-[9px] uppercase font-bold tracking-wider text-(--muted)">
                    Other Languages
                  </div>
                )}
                {filteredOptions
                  .filter(l => !l.popular)
                  .map((lang, idx) => {
                    const isSelected = selectedLanguages.includes(lang.value);
                    const popularCount = filteredOptions.filter(l => l.popular).length;
                    const isActive = idx + popularCount === activeIndex;

                    return (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => toggleLanguage(lang.value)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between border-b border-(--fg)/5 last:border-0 ${
                          isSelected
                            ? "bg-orange-500/10 text-orange-500 font-bold"
                            : isActive
                            ? "bg-(--fg)/5 text-(--fg)"
                            : "hover:bg-(--fg)/5 text-(--fg)"
                        }`}
                      >
                        <span>{lang.label}</span>
                        {isSelected ? (
                          <Check size={14} className="text-orange-500" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-(--fg)/10" />
                        )}
                      </button>
                    );
                  })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
