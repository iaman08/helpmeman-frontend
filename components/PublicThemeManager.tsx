"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "./ThemeProvider";

export function PublicThemeManager() {
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    const isDashboardRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/mentor") ||
      pathname.startsWith("/admin");

    if (!isDashboardRoute) {
      // Force light theme on all public routes
      document.documentElement.dataset.theme = "light";
      document.documentElement.classList.remove("dark");
    } else {
      // Restore user theme preference inside dashboard
      document.documentElement.dataset.theme = theme;
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [pathname, theme]);

  return null;
}
