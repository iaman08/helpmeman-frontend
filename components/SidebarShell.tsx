"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, Moon, Sun, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTheme, THEMES } from "./ThemeProvider";
import { NotificationBell } from "./NotificationBell";
import { Avatar } from "./Avatar";

interface NavItem {
  href?: string;
  onClick?: () => void;
  label: string;
  icon: LucideIcon;
  badge?: number;
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
  notificationsPath?: string;
  onLogout: () => void;
  className?: string;
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
  notificationsPath = "/dashboard/notifications",
  onLogout,
  className,
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
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("close-ai"));
    }
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

  const sidebarContent = (
    <>
      <div className="px-6 py-6 flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="font-display text-xl tracking-tight">
            HelpMeMan<span className="text-(--muted)">.</span>
          </Link>
          <p className={`text-[10px] uppercase tracking-[0.22em] mt-1 ${brandColor}`}>
            {brandLabel}
          </p>
        </div>
        <div className="hidden md:block">
          <NotificationBell notificationsPath={notificationsPath} />
        </div>
      </div>

      <div className="px-6 pb-5">
        <div className="flex items-center gap-3">
          <Avatar name={userName} url={userAvatar} size="lg" />
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
            const active = item.label === "Ruth" && aiOpen;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.onClick?.();
                  if (mobileOpen) setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors cursor-pointer ${active
                    ? "bg-(--fg)/8 text-(--fg)"
                    : "text-(--muted) hover:text-(--fg) hover:bg-(--fg)/4"
                  }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 shrink-0 animate-in zoom-in duration-200">
                    {item.badge}
                  </span>
                )}
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
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("close-ai"));
                }
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active
                  ? "bg-(--fg)/8 text-(--fg)"
                  : "text-(--muted) hover:text-(--fg) hover:bg-(--fg)/4"
                }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 shrink-0 animate-in zoom-in duration-200">
                  {item.badge}
                </span>
              )}
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
              className={`flex-1 h-8 rounded-lg text-[11px] font-medium transition-colors cursor-pointer capitalize ${theme === t
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 backdrop-blur-xl bg-(--bg)/80 border-b border-(--hairline)">
        {/* Left: hamburger / close only */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="cursor-pointer p-1"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Center: brand */}
        <Link href="/" className="font-display text-lg tracking-tight absolute left-1/2 -translate-x-1/2">
          HelpMeMan<span className="text-(--muted)">.</span>
        </Link>

        {/* Right: avatar + notification bell */}
        <div className="flex items-center gap-2">
          <NotificationBell notificationsPath={notificationsPath} />
          <Link
            href={rootPath === "/admin" ? "/dashboard/settings" : `${rootPath}/settings`}
            className="cursor-pointer"
            aria-label="View profile"
          >
            <Avatar name={userName} url={userAvatar} size="sm" />
          </Link>
        </div>
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
        <div className={className || "max-w-5xl mx-auto w-full px-4 sm:px-10 py-10 pt-[72px] md:pt-10"}>
          {children}
        </div>
      </main>
    </div>
  );
}

