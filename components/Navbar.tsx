"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme, type Theme, THEMES } from "./ThemeProvider";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, LogOut, ChevronDown, Menu, X } from "lucide-react";

const links: { id: string; label: string }[] = [];

const themeLabels: Record<Theme, string> = {
  light: "Light",
  yellow: "Sun",
  dark: "Night",
};

function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getDashboardPath(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "MENTOR") return "/mentor";
  return "/dashboard";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
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

  const dashboardPath = getDashboardPath(user?.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-(--bg)/70">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-10 py-5">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollToId("hero")}
          className="font-display text-2xl tracking-tight cursor-pointer"
          aria-label="HelpMeMan home"
        >
          HelpMeMan<span className="text-(--muted)">.</span>
        </button>


        {/* Right side */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Auth section */}
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-(--fg)/5 animate-pulse" />
          ) : user ? (
            /* ─── Logged in: Avatar dropdown ─── */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--fg)/8 text-[11px] font-medium overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <span className="hidden sm:block text-sm max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-(--muted) transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl py-2 shadow-lg border border-(--hairline)"
                  style={{ background: "var(--bg)" }}
                >
                  <div className="px-4 py-2 border-b border-(--hairline)">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-[11px] text-(--muted) truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href={dashboardPath}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-(--fg)/80 hover:bg-(--fg)/5 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <Link
                    href="/mentors"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-(--fg)/80 hover:bg-(--fg)/5 transition-colors"
                  >
                    Browse Mentors
                  </Link>

                  <div
                    aria-hidden
                    className="my-1 mx-4 h-px"
                    style={{ background: "var(--hairline)" }}
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                      window.location.href = "/";
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ─── Not logged in ─── */
            <>
              <Link
                href="/signin"
                className="hidden sm:block text-sm text-(--fg)/80 hover:text-(--fg) transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm rounded-full bg-(--accent) text-(--accent-fg) px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-(--hairline) px-6 py-4 flex flex-col gap-3"
          style={{ background: "var(--bg)" }}
        >


          {!user && (
            <Link
              href="/signin"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-(--fg)/80 hover:text-(--fg) py-1 sm:hidden"
            >
              Sign in
            </Link>
          )}

        </div>
      )}
    </header>
  );
}
