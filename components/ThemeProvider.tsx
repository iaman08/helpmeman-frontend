"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Theme = "light" | "dark";
export const THEMES: Theme[] = ["light", "dark"];
const STORAGE_KEY = "helpmeman.theme";
const CHANGE_EVENT = "helpmeman-theme-change";
type Ctx = { theme: Theme; setTheme: (theme: Theme) => void };
const ThemeCtx = createContext<Ctx | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light");
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setTheme(theme: Theme) {
  applyTheme(theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* A preference still works for this visit when storage is unavailable. */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The head bootstrap applies the saved preference before first paint. Reading
  // that same DOM value avoids an effect overwriting it with the SSR default.
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light" as Theme);
  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeCtx);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
