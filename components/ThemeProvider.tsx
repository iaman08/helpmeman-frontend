"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { usePathname } from "next/navigation";

export type Theme = "light" | "dark";
export const THEMES: Theme[] = ["light", "dark"];

const STORAGE_KEY = "helpmeman.theme";

type Ctx = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const isDashboardRoute =
      pathname && (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/mentor") ||
        pathname.startsWith("/admin")
      );

    if (isDashboardRoute) {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && THEMES.includes(stored)) {
        setThemeState(stored);
      }
    } else {
      setThemeState("light");
    }
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
