"use client";

import { useState, useEffect, useMemo, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Popover } from "@base-ui/react/popover";
import styles from "./LandingNavbar.module.css";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { openTawkChat } from "@/components/TawkToScript";

type NavLinkItem = {
  label: string;
  href?: string;
  id?: string;
  isSupport?: boolean;
};

const navLinks: NavLinkItem[] = [
  { label: "Pricing", href: "/#pricing", id: "pricing" },
  { label: "Mentors", href: "/mentors" },
  { label: "Services", href: "/services" },
  { label: "Ruth AI", href: "/#about", id: "about" },
  { label: "Support", isSupport: true },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, mentor, loading } = useAuth();
  const pathname = usePathname();
  const [menuKeyboard, setMenuKeyboard] = useState(false);

  /** Compute the correct dashboard path for the current user */
  const dashboardPath = useMemo(() => {
    if (!user) return "/dashboard";
    if (user.role === "SUPER_ADMIN") return "/superadmin";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "MENTOR" && mentor) {
      return mentor.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
    }
    return "/dashboard";
  }, [user, mentor]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", handleBreakpoint);
    return () => desktop.removeEventListener("change", handleBreakpoint);
  }, []);

  const handleNavLink = (event: MouseEvent<HTMLAnchorElement>, link: NavLinkItem) => {
    setMobileOpen(false);
    if (!link.id || pathname !== "/" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(link.id);
    if (!target) return;
    event.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced || event.detail === 0 ? "instant" : "smooth" });
    window.history.pushState(null, "", link.href);
  };

  const handleSupport = () => {
    setMobileOpen(false);
    openTawkChat();
  };

  const isLoggedIn = !loading && user;

  return (
    <nav className={`landing-nav-capsule ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="px-5 sm:px-6 py-2.5 flex items-center justify-between relative">
        {/* Left Side: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 select-none shrink-0 no-underline"
        >
          <img src="/logo.svg" alt="HelpMeMan Logo" className="w-6.5 h-6.5 object-contain" />
          <span className="font-bold tracking-tight text-[15px] text-[#141414] dark:text-[#f4f4f5]">HelpMeMan</span>
        </Link>

        {/* Right Side: Desktop Navigation Links & Actions (matching reference) */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-5">
          {navLinks.map((link) => link.isSupport ? (
            <button key={link.label} onClick={handleSupport} className={styles.desktopLink}>{link.label}</button>
          ) : (
            <Link key={link.label} href={link.href!} onClick={(event) => handleNavLink(event, link)} className={styles.desktopLink}>{link.label}</Link>
          ))}

          {!isLoggedIn ? (
            <Link
              href="/?auth=signin"
              className="text-[14px] font-semibold text-[#141414] dark:text-[#f4f4f5] hover:opacity-75 transition-opacity no-underline p-0 whitespace-nowrap tracking-[-0.01em]"
            >
              Log in
            </Link>
          ) : (
            <Link
              href={dashboardPath}
              className="text-[14px] font-semibold text-[#141414] dark:text-[#f4f4f5] hover:opacity-75 transition-opacity no-underline p-0 whitespace-nowrap tracking-[-0.01em]"
            >
              Dashboard
            </Link>
          )}

          {!isLoggedIn && <Link href="/?auth=signup" className={styles.guestAction}>Join for free</Link>}

          <ThemeToggle variant="pill" />
        </div>

        {/* Base UI owns dismissal, focus return and transition lifetime. */}
        <Popover.Root open={mobileOpen} onOpenChange={(open, details) => {
          setMenuKeyboard(details.event.type.startsWith("key") || (details.event.type === "click" && "detail" in details.event && details.event.detail === 0));
          setMobileOpen(open);
        }}>
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle variant="pill" />
            <Popover.Trigger className={styles.menuTrigger} aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Popover.Trigger>
          </div>
          <Popover.Portal>
            <Popover.Positioner side="bottom" align="end" sideOffset={16} collisionPadding={16} positionMethod="fixed" className={styles.positioner}>
              <Popover.Popup className={styles.popup} data-keyboard={menuKeyboard}>
                <Popover.Title className="sr-only">Main navigation</Popover.Title>
                <div className={styles.menuItems}>
                  {navLinks.map((link) => link.isSupport ? (
                    <button key={link.label} onClick={handleSupport} className={styles.menuLink}>{link.label}</button>
                  ) : (
                    <Link key={link.label} href={link.href!} onClick={(event) => handleNavLink(event, link)} className={styles.menuLink}>{link.label}</Link>
                  ))}
                </div>
                <div className={styles.menuFooter}>
                  {!isLoggedIn ? <>
                    <Link href="/?auth=signin" onClick={() => setMobileOpen(false)} className={styles.menuAction}>Log in</Link>
                    <Link href="/?auth=signup" onClick={() => setMobileOpen(false)} className={`${styles.menuAction} ${styles.menuPrimary}`}>Join for free</Link>
                  </> : <Link href={dashboardPath} onClick={() => setMobileOpen(false)} className={`${styles.menuAction} ${styles.menuPrimary}`}>Go to Dashboard</Link>}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </nav>
  );
}
