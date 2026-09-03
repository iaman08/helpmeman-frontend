"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  { label: "Services", href: "/services" },
  { label: "Mentors", href: "/mentors" },
  { label: "Support", isSupport: true },
  { label: "Pricing", href: "/#pricing", id: "pricing" },
  { label: "Ruth AI", href: "/#about", id: "about" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, mentor, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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

  const handleNavClick = (link: NavLinkItem) => {
    setMobileOpen(false);
    if (link.isSupport) {
      openTawkChat();
      return;
    }
    if (link.id && pathname === "/") {
      document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" });
    } else if (link.href) {
      router.push(link.href);
    }
  };

  const isLoggedIn = !loading && user;

  return (
    <nav className={`landing-nav-capsule ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between relative">
        {/* Left Side: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[15px] tracking-tight text-[var(--fg)] select-none shrink-0 no-underline"
        >
          <img src="/logo.svg" alt="HelpMeMan Logo" className="w-7 h-7 object-contain" />
          <span className="font-bold tracking-tight">HelpMeMan</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div
          className={`hidden lg:flex items-center justify-center flex-1 mx-3 min-w-0 transition-all duration-300 ${scrolled ? "gap-3.5" : "gap-5"
            }`}
        >
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className="nav-link-pill text-[13px] font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors bg-transparent border-none cursor-pointer py-1 whitespace-nowrap"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side: CTA buttons & Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle variant="pill" />

          {!isLoggedIn && (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/?auth=signin"
                className="text-[13px] font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors no-underline px-2.5 py-1 whitespace-nowrap"
              >
                Log in
              </Link>
              <AnimatePresence>
                {scrolled && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.9, width: 0 }}
                    animate={{ opacity: 1, x: 0, scale: 1, width: "auto" }}
                    exit={{ opacity: 0, x: 20, scale: 0.9, width: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden flex items-center"
                  >
                    <Link
                      href="/?auth=signup"
                      className="text-[13px] font-semibold text-white dark:text-black bg-black dark:bg-white px-4 py-1.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all no-underline whitespace-nowrap shadow-sm inline-block"
                    >
                      Join for free
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden bg-transparent border-none cursor-pointer text-[var(--fg)] p-1 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileOpen && (
          <div className="mobile-dropdown-panel lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-left py-2.5 text-[14px] font-medium text-[var(--fg)] bg-transparent border-none cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
            {!isLoggedIn && (
              <div className="border-t border-[var(--hairline)] mt-2 pt-3 flex gap-2">
                <Link
                  href="/?auth=signin"
                  className="flex-1 text-center py-2.5 text-[13px] font-medium text-[var(--fg)] border border-[var(--hairline)] rounded-lg no-underline"
                >
                  Log in
                </Link>
                <Link
                  href="/?auth=signup"
                  className="flex-1 text-center py-2.5 text-[13px] font-semibold text-[var(--bg)] bg-[var(--fg)] rounded-lg no-underline"
                >
                  Join for free
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
