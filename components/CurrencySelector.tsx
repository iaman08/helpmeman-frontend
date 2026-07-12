"use client";

import { useCurrency, CURRENCY_CONFIGS } from "@/lib/currency-context";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CurrencySelectorProps {
  align?: "left" | "right";
  className?: string;
}

export function CurrencySelector({ align = "right", className = "" }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setCurrency(code, true);
    setIsOpen(false);
  };

  const activeConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--hairline) hover:border-(--fg)/30 hover:bg-(--fg)/5 transition-all text-xs font-semibold cursor-pointer text-(--fg)"
        type="button"
      >
        <Globe size={13} className="text-(--muted)" />
        <span>{currency} ({activeConfig.symbol})</span>
        <ChevronDown size={12} className={`text-(--muted) transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} bottom-full mb-2 sm:top-full sm:bottom-auto sm:mt-2 w-48 rounded-xl py-1.5 shadow-xl border border-(--hairline) z-[999] overflow-hidden`}
          style={{ background: "var(--bg)" }}
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-(--muted) font-bold border-b border-(--hairline) mb-1 select-none">
            Select Currency
          </div>
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(CURRENCY_CONFIGS).map(([code, config]) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-(--fg)/5 transition-colors cursor-pointer ${
                  currency === code ? "font-bold text-(--fg) bg-(--fg)/5" : "text-(--muted) hover:text-(--fg)"
                }`}
                type="button"
              >
                <span>{config.name}</span>
                <span className="text-[10px] bg-(--fg)/10 px-1.5 py-0.5 rounded font-mono font-normal">
                  {code} ({config.symbol})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;
