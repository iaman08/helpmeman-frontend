"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
  variant?: "pill" | "icon";
  className?: string;
}

export function ThemeToggle({ variant = "pill", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-14 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`p-2 rounded-full bg-(--fg)/5 border border-(--hairline) text-(--fg) hover:bg-(--fg)/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center ${className}`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 transition-transform duration-300 hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex items-center justify-between w-14 h-8 px-2 rounded-full bg-zinc-200/90 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700/80 transition-colors cursor-pointer select-none focus:outline-none ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Sun className={`w-3.5 h-3.5 z-10 transition-colors duration-200 ${isDark ? "text-zinc-400" : "text-amber-500"}`} />
      <Moon className={`w-3.5 h-3.5 z-10 transition-colors duration-200 ${isDark ? "text-indigo-400" : "text-zinc-400"}`} />
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-950 shadow-sm transition-transform duration-300 ease-out ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
