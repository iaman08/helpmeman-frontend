"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
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
  brandColor = "text-red-500",
  userName,
  userEmail,
  userAvatar,
  userBadge,
  notificationsPath = "/dashboard/notifications",
  onLogout,
  className,
}: SidebarShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [aiOpen, setAiOpen] = useState(false);

  const isPrivilegedUser =
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    userEmail?.toLowerCase().endsWith("@helpmeman.com") ||
    rootPath === "/admin" ||
    rootPath === "/superadmin" ||
    userBadge?.toLowerCase().includes("admin") ||
    userBadge?.toLowerCase().includes("super");

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
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Brand + bell */}
      <div className="px-6 py-6 flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="font-display text-xl tracking-tight" style={{ color: "var(--fg)" }}>
            HelpMeMan<span style={{ color: "var(--fg)", opacity: 0.35 }}>.</span>
          </Link>
          <p className={`text-[10px] uppercase tracking-[0.22em] mt-1 ${brandColor}`}>
            {brandLabel}
          </p>
        </div>
        <div className="hidden md:block">
          <NotificationBell notificationsPath={notificationsPath} />
        </div>
      </div>

      {/* User info */}
      <div className="px-6 pb-5">
        <div className="flex items-center gap-3">
          <Avatar name={userName} url={userAvatar} size="lg" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate" style={{ color: "var(--fg)" }}>
              {userName}
            </span>
            {userBadge && (
              <span className="text-[11px] truncate" style={{ color: "var(--muted)" }}>
                {userBadge}
              </span>
            )}
            {userEmail && !userBadge && (
              <span className="text-[11px] truncate" style={{ color: "var(--muted)" }}>
                {userEmail}
              </span>
            )}
          </div>
        </div>

        {/* Panel Switcher for Team Members & Admins */}
        {isPrivilegedUser && (
          <div className="mt-3 flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] px-0.5" style={{ color: "var(--muted)" }}>
              View as:
            </span>
            <div
              className="flex items-center gap-1 p-1 rounded-xl"
              style={{
                background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                border: "1px solid var(--hairline)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("hmm.activeRole", "admin");
                  const dest = user?.role === "SUPER_ADMIN" ? "/superadmin" : "/admin";
                  window.location.href = dest;
                }}
                className="flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer text-center"
                style={{
                  background: (rootPath === "/admin" || rootPath === "/superadmin") ? "var(--fg)" : "transparent",
                  color: (rootPath === "/admin" || rootPath === "/superadmin") ? "var(--bg)" : "var(--muted)",
                }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("hmm.activeRole", "mentor");
                  window.location.href = "/mentor";
                }}
                className="flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer text-center"
                style={{
                  background: rootPath === "/mentor" ? "var(--fg)" : "transparent",
                  color: rootPath === "/mentor" ? "var(--bg)" : "var(--muted)",
                }}
              >
                Mentor
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("hmm.activeRole", "mentee");
                  window.location.href = "/dashboard";
                }}
                className="flex-1 py-1 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer text-center"
                style={{
                  background: rootPath === "/dashboard" ? "var(--fg)" : "transparent",
                  color: rootPath === "/dashboard" ? "var(--bg)" : "var(--muted)",
                }}
              >
                Student
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div aria-hidden className="mx-6 h-px" style={{ background: "var(--hairline)" }} />

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto">
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
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors cursor-pointer"
                style={{
                  color: active ? "var(--fg)" : "var(--muted)",
                  background: active ? "color-mix(in srgb, var(--fg) 6%, transparent)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "color-mix(in srgb, var(--fg) 4%, transparent)";
                    e.currentTarget.style.color = "var(--fg)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--muted)";
                  }
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 shrink-0">
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
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
              style={{
                color: active ? "var(--fg)" : "var(--muted)",
                background: active ? "color-mix(in srgb, var(--fg) 6%, transparent)" : "transparent",
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--fg) 4%, transparent)";
                  (e.currentTarget as HTMLElement).style.color = "var(--fg)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                }
              }}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: theme switcher + sign out */}
      <div className="px-4 pb-6 flex flex-col gap-2">
        {/* Theme toggle */}
        <div
          className="flex items-center gap-1 rounded-xl p-1 mb-2"
          style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)" }}
        >
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className="flex-1 h-8 rounded-lg text-[11px] font-medium transition-colors cursor-pointer capitalize"
              style={{
                background: theme === t ? "var(--fg)" : "transparent",
                color: theme === t ? "var(--bg)" : "var(--muted)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors cursor-pointer"
          style={{ color: "var(--muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.background = "rgba(239,68,68,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col"
        style={{
          background: "var(--bg)",
          borderRight: "1px solid var(--hairline)",
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile header bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4"
        style={{
          background: "color-mix(in srgb, var(--bg) 80%, transparent)",
          borderBottom: "1px solid var(--hairline)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="cursor-pointer p-1"
          aria-label="Toggle sidebar"
          style={{ color: "var(--fg)" }}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link
          href="/"
          className="font-display text-lg tracking-tight absolute left-1/2 -translate-x-1/2"
          style={{ color: "var(--fg)" }}
        >
          HelpMeMan<span style={{ color: "var(--fg)", opacity: 0.35 }}>.</span>
        </Link>

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
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside
            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
            style={{
              background: "var(--bg)",
              borderRight: "1px solid var(--hairline)",
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <main
        className="md:ml-64 flex-1 min-h-screen min-w-0"
        style={{ background: "var(--bg)" }}
      >
        <div className={className || "max-w-5xl mx-auto w-full px-6 sm:px-10 py-10 pt-[72px] md:pt-10"}>
          {children}
        </div>
      </main>
    </div>
  );
}
