"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
  variant?: "pill" | "icon";
  className?: string;
}

export function ThemeToggle({ variant = "pill", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`p-2 rounded-full transition-transform duration-150 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 cursor-pointer flex items-center justify-center ${className}`}
        style={{
          border: "1px solid var(--hairline)",
          background: "color-mix(in srgb, var(--fg) 5%, transparent)",
          color: "var(--fg)",
        }}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 " />
        ) : (
          <Moon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 " />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex items-center justify-between w-14 h-8 px-2 rounded-full bg-zinc-200/90 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700/80 transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <Sun className={`w-3.5 h-3.5 z-10 transition-colors duration-200 ${isDark ? "text-zinc-400" : "text-amber-500"}`} />
      <Moon className={`w-3.5 h-3.5 z-10 transition-colors duration-200 ${isDark ? "text-indigo-400" : "text-zinc-400"}`} />
      <span
        className={`absolute top-[3px] left-[3px] w-6 h-6 rounded-full bg-white dark:bg-zinc-950 shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
