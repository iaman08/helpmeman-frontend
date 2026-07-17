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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: UserCheck },
  { href: "/admin/mentors", label: "All Mentors", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/team", label: "Team Management", icon: UserCog },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/earnings", label: "Earnings", icon: DollarSign },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
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
  const { user, mentor, loading, logout, isMentor, isAdmin } = useAuth();
  const router = useRouter();

  // Stable ref to prevent double-redirects during transient state updates
  const hasRedirectedRef = useRef(false);

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
      navItems={NAV}
      rootPath="/admin"
      brandLabel="Admin Panel"
      brandColor="text-red-500"
      userName={user.name}
      userAvatar={user.avatar}
      userBadge="Administrator"
      avatarColor="bg-red-500/10 text-red-500"
      onLogout={async () => {
        await logout();
      }}
    >
      {children}
    </SidebarShell>
  );
}
