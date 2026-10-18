"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LogOut, ChevronDown, Menu, X, LayoutDashboard } from "lucide-react";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";

function getDashboardPath(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "MENTOR") return "/mentor";
  return "/dashboard";
}

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dashboardPath = getDashboardPath(user?.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-neutral-200/80 dark:border-zinc-800/80 transition-all shadow-xs">
      <nav className="mx-auto flex max-w-[1400px] h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 select-none shrink-0 no-underline group"
          aria-label="HelpMeMan home"
        >
          <img
            src="/logo.svg"
            alt="HelpMeMan Logo"
            className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-display text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            HelpMeMan
          </span>
        </Link>

        {/* Desktop Links — visible at lg: (≥1024px) */}
        <div className="hidden lg:flex items-center gap-6 ml-8 mr-auto">
          <Link
            href="/mentors"
            className="text-sm font-semibold text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white transition-colors no-underline"
          >
            Mentors
          </Link>

          {user?.role !== "MENTOR" &&
            user?.role !== "ADMIN" &&
            user?.role !== "SUPER_ADMIN" && (
              <Link
                href="/apply-mentor"
                className="text-sm font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors no-underline"
              >
                Apply as Mentor
              </Link>
            )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle variant="pill" />

          {/* Auth section */}
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-zinc-800 animate-pulse" />
          ) : user ? (
            /* ─── Logged in ─── */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Avatar name={user.name} url={user.avatar} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-neutral-800 dark:text-neutral-200 max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-neutral-500 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl py-2 shadow-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-zinc-800">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href={dashboardPath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-neutral-500" />
                    Dashboard
                  </Link>

                  <Link
                    href="/mentors"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors no-underline"
                  >
                    Browse Mentors
                  </Link>

                  <div className="my-1 mx-3 h-px bg-neutral-100 dark:bg-zinc-800" />

                  <button
                    type="button"
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ─── Not logged in ─── */
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/signin"
                className="hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger — visible below lg: (<1024px) */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — visible below lg: (<1024px) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 flex flex-col gap-3 shadow-xl">
          <Link
            href="/mentors"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white py-1.5 no-underline"
          >
            Browse Mentors
          </Link>
          {user?.role !== "MENTOR" &&
            user?.role !== "ADMIN" &&
            user?.role !== "SUPER_ADMIN" && (
              <Link
                href="/apply-mentor"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-amber-600 dark:text-amber-400 py-1.5 no-underline"
              >
                Apply as Mentor
              </Link>
            )}

          {!user && (
            <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 flex flex-col gap-2 sm:hidden">
              <Link
                href="/signin"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 py-1.5 no-underline"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
