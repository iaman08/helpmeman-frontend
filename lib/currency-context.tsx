"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api";
import { useAuth } from "./auth-context";

export const CURRENCY_CONFIGS: Record<string, { symbol: string; locale: string; name: string }> = {
  INR: { symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  USD: { symbol: "$", locale: "en-US", name: "US Dollar" },
  GBP: { symbol: "£", locale: "en-GB", name: "British Pound" },
  EUR: { symbol: "€", locale: "de-DE", name: "Euro" },
  CAD: { symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
  AUD: { symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
  JPY: { symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string, isManual?: boolean) => Promise<void>;
  rates: Record<string, number>;
  loading: boolean;
  formatPrice: (amountInINR: number) => string;
  convertPrice: (amountInINR: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const STORAGE_KEYS = {
  currency: "helpmeman.currency",
  manual: "helpmeman.manual_currency",
  rates: "helpmeman.exchange_rates",
  ratesExpiry: "helpmeman.exchange_rates_expiry",
};

const RATES_CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

// Helper to set cookie
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;expires=${date.toUTCString()};SameSite=Lax`;
}

// Fallback rates if API fails
const DEFAULT_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0093,
  CAD: 0.016,
  AUD: 0.018,
  JPY: 1.85,
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [currency, setCurrencyState] = useState<string>("INR");
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch live exchange rates (relative to INR base currency)
  const fetchExchangeRates = useCallback(async () => {
    try {
      // Check localStorage cache first
      const cached = localStorage.getItem(STORAGE_KEYS.rates);
      const expiry = localStorage.getItem(STORAGE_KEYS.ratesExpiry);
      const now = Date.now();

      if (cached && expiry && now < parseInt(expiry)) {
        setRates(JSON.parse(cached));
        return JSON.parse(cached);
      }

      // Cache expired or missing, fetch live
      const response = await fetch("https://open.er-api.com/v6/latest/INR");
      if (!response.ok) throw new Error("Exchange rate API failed");
      
      const data = await response.json();
      if (data && data.result === "success" && data.rates) {
        localStorage.setItem(STORAGE_KEYS.rates, JSON.stringify(data.rates));
        localStorage.setItem(STORAGE_KEYS.ratesExpiry, (now + RATES_CACHE_DURATION_MS).toString());
        setRates(data.rates);
        return data.rates;
      }
    } catch (error) {
      console.error("[CURRENCY] Failed to fetch live exchange rates, using fallbacks:", error);
    }
    return DEFAULT_RATES;
  }, []);

  // 2. Detect user's local currency based on IP or browser locale
  const detectCurrency = useCallback(async (): Promise<string> => {
    let detected: string | null = null;
    
    try {
      // Call public IP-to-Geo API
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        detected = data.currency;
      }
    } catch {
      // Ignore GeoIP error, fallback to next API
    }

    // Fallback API if ipapi.co fails/rate-limits
    if (!detected) {
      try {
        const res = await fetch("https://ipinfo.io/json");
        if (res.ok) {
          const data = await res.json();
          const country = data.country;
          if (country === "IN") detected = "INR";
          else if (country === "US") detected = "USD";
          else if (country === "GB") detected = "GBP";
          else if (country === "JP") detected = "JPY";
          else if (country === "CA") detected = "CAD";
          else if (country === "AU") detected = "AUD";
          else if (["DE", "FR", "IT", "ES", "NL", "BE", "AT", "IE", "FI", "PT", "GR"].includes(country)) detected = "EUR";
        }
      } catch {
        // Ignore fallback GeoIP errors
      }
    }

    if (detected && CURRENCY_CONFIGS[detected.toUpperCase()]) {
      return detected.toUpperCase();
    }

    // Fallback: Detect via timezone resolved options (most reliable client-side fallback)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const tzLower = tz.toLowerCase();
        if (tzLower.includes("kolkata") || tzLower.includes("calcutta") || tzLower.includes("india")) return "INR";
        if (tzLower.includes("london") || tzLower.includes("europe/london")) return "GBP";
        if (tzLower.includes("tokyo")) return "JPY";
        if (tzLower.includes("toronto") || tzLower.includes("vancouver") || tzLower.includes("montreal")) return "CAD";
        if (tzLower.includes("sydney") || tzLower.includes("melbourne") || tzLower.includes("brisbane") || tzLower.includes("adelaide")) return "AUD";
        if (tzLower.includes("europe") || tzLower.includes("berlin") || tzLower.includes("paris") || tzLower.includes("rome") || tzLower.includes("madrid") || tzLower.includes("brussels") || tzLower.includes("amsterdam")) {
          return "EUR";
        }
      }

      // Check browser locale language
      const locale = navigator.language || "en-US";
      if (locale.includes("IN")) return "INR";
      if (locale.includes("GB")) return "GBP";
      if (locale.includes("JP")) return "JPY";
      if (locale.includes("CA")) return "CAD";
      if (locale.includes("AU")) return "AUD";
    } catch {}

    return "INR"; // Ultimate global fallback (using INR as default)
  }, []);

  // 3. Set Active Currency (manual vs automatic)
  const setCurrency = useCallback(async (newCurrency: string, isManual = true) => {
    const code = newCurrency.toUpperCase();
    if (!CURRENCY_CONFIGS[code]) return;

    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEYS.currency, code);
    setCookie(STORAGE_KEYS.currency, code);

    if (isManual) {
      localStorage.setItem(STORAGE_KEYS.manual, "true");
    }

    // If logged in, sync with database
    if (user && user.currency !== code && isManual) {
      try {
        await api.put("/users/me", { currency: code });
        updateUser({ currency: code });
      } catch (err) {
        console.error("[CURRENCY] Failed to sync preferred currency with database:", err);
      }
    }
  }, [user, updateUser]);

  // 4. Initialize currency, rates, and preferences on mount
  useEffect(() => {
    async function init() {
      setLoading(true);
      await fetchExchangeRates();

      const storedCurrency = localStorage.getItem(STORAGE_KEYS.currency);
      const isManual = localStorage.getItem(STORAGE_KEYS.manual) === "true";

      // Priority 1: Logged-in user's database preference
      if (user && user.currency && CURRENCY_CONFIGS[user.currency.toUpperCase()]) {
        const dbCurrency = user.currency.toUpperCase();
        setCurrencyState(dbCurrency);
        localStorage.setItem(STORAGE_KEYS.currency, dbCurrency);
        setCookie(STORAGE_KEYS.currency, dbCurrency);
      }
      // Priority 2: Stored manual setting from localStorage
      else if (storedCurrency && isManual && CURRENCY_CONFIGS[storedCurrency.toUpperCase()]) {
        setCurrencyState(storedCurrency.toUpperCase());
        setCookie(STORAGE_KEYS.currency, storedCurrency.toUpperCase());
      }
      // Priority 3: Auto-detect based on GeoIP / locale
      else {
        const autoDetected = await detectCurrency();
        setCurrencyState(autoDetected);
        localStorage.setItem(STORAGE_KEYS.currency, autoDetected);
        setCookie(STORAGE_KEYS.currency, autoDetected);
      }
      setLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 5. Raw Currency Conversion Helper
  const convertPrice = useCallback((amountInINR: number): number => {
    const rate = rates[currency] || DEFAULT_RATES[currency] || 1;
    const amountInRupees = amountInINR / 100;
    return amountInRupees * rate;
  }, [rates, currency]);

  // 6. Formatted Price Display Helper
  const formatPrice = useCallback((amountInINR: number): string => {
    const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.INR;
    const converted = convertPrice(amountInINR);

    // Format utilizing browser Intl.NumberFormat
    try {
      const isZeroDecimal = currency === "JPY";
      return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: isZeroDecimal ? 0 : 2,
        maximumFractionDigits: isZeroDecimal ? 0 : 2,
      }).format(converted);
    } catch {
      // Hand-coded fallback representation if Intl breaks
      const isZeroDecimal = currency === "JPY";
      return `${config.symbol}${converted.toFixed(isZeroDecimal ? 0 : 2)}`;
    }
  }, [currency, convertPrice]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, loading, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}

export function formatCurrency(amountInSubunits: number, currencyCode: string): string {
  const code = (currencyCode || "INR").toUpperCase();
  const config = CURRENCY_CONFIGS[code] || { symbol: code + " ", locale: "en-US", name: code };
  const isZeroDecimal = code === "JPY";
  const value = isZeroDecimal ? amountInSubunits : amountInSubunits / 100;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(value);
  } catch {
    return `${config.symbol}${value.toFixed(isZeroDecimal ? 0 : 2)}`;
  }
}
