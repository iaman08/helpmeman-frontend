"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export function PublicThemeManager() {
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    // Keep user's theme selection consistent across all route transitions
    // without forcing conflicting light/dark states on public vs mentor routes.
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [pathname, theme]);

  return null;
}

