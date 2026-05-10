"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
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
  userBadge,
  avatarColor = "bg-(--fg)/8 text-(--fg)",
  onLogout,
}: SidebarShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
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
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium shrink-0 ${avatarColor}`}
          >
            {initials}
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
          const active =
            pathname === item.href ||
            (item.href !== rootPath && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
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

      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-(--muted) hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
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
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-(--fg)/[0.02] border-r border-(--hairline)">
        {sidebarContent}
      </aside>

      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-(--bg)/90 border-b border-(--hairline)">
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
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-(--bg) shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="md:ml-64 flex-1 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
