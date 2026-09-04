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
        <div className="hidden lg:flex items-center gap-6 xl:gap-7">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className="nav-link-pill text-[14px] font-semibold text-[#141414] dark:text-[#f4f4f5] hover:opacity-75 transition-opacity bg-transparent border-none cursor-pointer p-0 whitespace-nowrap tracking-[-0.01em]"
            >
              {link.label}
            </button>
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

          <AnimatePresence>
            {!isLoggedIn && scrolled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden flex items-center"
              >
                <Link
                  href="/?auth=signup"
                  className="text-[13px] font-semibold text-white dark:text-black bg-[#141414] dark:bg-[#f4f4f5] px-4 py-1.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all no-underline whitespace-nowrap shadow-sm inline-block"
                >
                  Join for free
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <ThemeToggle variant="pill" />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle variant="pill" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="bg-transparent border-none cursor-pointer text-[#141414] dark:text-[#f4f4f5] p-1 flex items-center justify-center"
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
                  className="text-left py-2.5 text-[14px] font-semibold text-[#141414] dark:text-[#f4f4f5] bg-transparent border-none cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>
            {!isLoggedIn && (
              <div className="border-t border-[var(--hairline)] mt-2 pt-3 flex gap-2">
                <Link
                  href="/?auth=signin"
                  className="flex-1 text-center py-2.5 text-[14px] font-semibold text-[#141414] dark:text-[#f4f4f5] border border-[var(--hairline)] rounded-xl no-underline"
                >
                  Log in
                </Link>
                <Link
                  href="/?auth=signup"
                  className="flex-1 text-center py-2.5 text-[14px] font-semibold text-white dark:text-black bg-[#141414] dark:bg-[#f4f4f5] rounded-xl no-underline"
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
