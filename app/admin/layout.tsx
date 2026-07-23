"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CalendarCheck,
  FolderTree,
  DollarSign,
  Star,
  Sparkles,
  UserCog,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import { useMemo } from "react";

const BASE_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: UserCheck },
  { href: "/admin/mentors", label: "All Mentors", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/team", label: "Team Management", icon: UserCog },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/earnings", label: "Earnings", icon: DollarSign },
  { href: "/admin/reviews", label: "Session Reviews", icon: Star },
  { href: "/admin/platform-reviews", label: "Platform Reviews", icon: Star },
  {
    onClick: () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("open-ai"));
      }
    },
    label: "Ruth",
    icon: Sparkles,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, mentor, loading, logout, isMentor, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  // Stable ref to prevent double-redirects during transient state updates
  const hasRedirectedRef = useRef(false);
  // [DEBUG] Log what user value AdminLayout receives on its very first render.
  const mountLoggedRef = useRef(false);
  if (!mountLoggedRef.current) {
    mountLoggedRef.current = true;
    console.log(`[ADMIN:mount] AdminLayout first render — loading=${loading}, user=${user ? user.email : "null"}`);
  }

  useEffect(() => {
    if (loading) return;

    if (user) {
      hasRedirectedRef.current = false;
      if (!isAdmin) {
        const dest = isMentor
          ? (mentor?.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status")
          : "/dashboard";
        router.replace(dest);
      }
      return;
    }

    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/signin");
    }
  }, [loading, user, isAdmin, isMentor, mentor, router]);

  // Construct dynamic navItems menu
  const navItems = useMemo(() => {
    if (isSuperAdmin) {
      // Add Audit Logs for Super Admin
      return [
        ...BASE_NAV.slice(0, 5), // Insert before categories
        { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
        ...BASE_NAV.slice(5),
      ];
    }
    return BASE_NAV;
  }, [isSuperAdmin]);

  // Show spinner while auth resolves; render nothing while redirect is in flight
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
      </div>
    );
  }
  if (!user || !isAdmin) return null;

  return (
    <SidebarShell
      navItems={navItems}
      rootPath="/admin"
      brandLabel="Admin Panel"
      brandColor="text-red-500"
      userName={user.name}
      userAvatar={user.avatar}
      userBadge={isSuperAdmin ? "Super Admin" : "Administrator"}
      avatarColor="bg-red-500/10 text-red-500"
      onLogout={async () => {
        await logout();
      }}
    >
      {children}
    </SidebarShell>
  );
}
