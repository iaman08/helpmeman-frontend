"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Moon, Sun, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTheme, THEMES } from "./ThemeProvider";

interface NavItem {
  href?: string;
  onClick?: () => void;
  label: string;
  icon: LucideIcon;
}

interface SidebarShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  rootPath: string;
  brandLabel: string;
  brandColor?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string | null;
  userBadge?: string;
  avatarColor?: string;
  onLogout: () => void;
}

export function SidebarShell({
  children,
  navItems,
  rootPath,
  brandLabel,
  brandColor = "text-(--muted)",
  userName,
  userEmail,
  userAvatar,
  userBadge,
  avatarColor = "bg-(--fg)/8 text-(--fg)",
  onLogout,
}: SidebarShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setAiOpen(true);
    const handleClose = () => setAiOpen(false);
    if (typeof window !== "undefined") {
      window.addEventListener("open-ai", handleOpen);
      window.addEventListener("close-ai", handleClose);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-ai", handleOpen);
        window.removeEventListener("close-ai", handleClose);
      }
    };
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setAiOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <>
      <div className="px-6 py-6">
        <Link href="/" className="font-display text-xl tracking-tight">
          HelpMeMan<span className="text-(--muted)">.</span>
        </Link>
        <p className={`text-[10px] uppercase tracking-[0.22em] mt-1 ${brandColor}`}>
          {brandLabel}
        </p>
      </div>

      <div className="px-6 pb-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full overflow-hidden text-xs font-medium shrink-0 ${avatarColor}`}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{userName}</span>
            {userBadge && (
              <span className="text-[11px] text-(--muted) truncate">
                {userBadge}
              </span>
            )}
            {userEmail && !userBadge && (
              <span className="text-[11px] text-(--muted) truncate">
                {userEmail}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="mx-6 h-px"
        style={{ background: "var(--hairline)" }}
      />

      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          if (item.onClick) {
            const active = item.label === "AI Assistant" && aiOpen;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick?.();
                  if (mobileOpen) setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? "bg-(--fg)/8 text-(--fg)"
                    : "text-(--muted) hover:text-(--fg) hover:bg-(--fg)/4"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          }

          const active =
            !aiOpen &&
            item.href &&
            (pathname === item.href ||
              (item.href !== rootPath && pathname.startsWith(item.href)));
          return (
            <Link
              key={item.href || item.label}
              href={item.href!}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-(--fg)/8 text-(--fg)"
                  : "text-(--muted) hover:text-(--fg) hover:bg-(--fg)/4"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6 flex flex-col gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-(--fg)/5 p-1 mb-2">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`flex-1 h-8 rounded-lg text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                theme === t
                  ? "bg-(--accent) text-(--accent-fg)"
                  : "text-(--muted) hover:text-(--fg)"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--muted) hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-(--bg) border-r border-(--hairline)">
        {sidebarContent}
      </aside>

      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-(--bg)/80 border-b border-(--hairline)">
        <Link href="/" className="font-display text-lg tracking-tight">
          HelpMeMan<span className="text-(--muted)">.</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="cursor-pointer p-1"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full overflow-hidden ${avatarColor} flex items-center justify-center text-[10px]`}>
                 {userAvatar ? <img src={userAvatar} className="h-full w-full object-cover" /> : initials}
              </div>
              <Menu className="h-5 w-5" />
            </div>
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-(--bg) shadow-2xl animate-in slide-in-from-left duration-300 border-r border-(--hairline)">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="md:ml-64 flex-1 min-h-screen min-w-0">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-10 py-10 pt-24 md:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}

