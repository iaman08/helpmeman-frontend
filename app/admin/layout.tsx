"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CalendarCheck,
  FolderTree,
  DollarSign,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: UserCheck },
  { href: "/admin/mentors", label: "All Mentors", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/earnings", label: "Earnings", icon: DollarSign },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/signin");
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
      </div>
    );
  }

  return (
    <SidebarShell
      navItems={NAV}
      rootPath="/admin"
      brandLabel="Admin Panel"
      brandColor="text-red-500"
      userName={user.name}
      userBadge="Administrator"
      avatarColor="bg-red-500/10 text-red-500"
      onLogout={async () => {
        await logout();
        router.replace("/signin");
      }}
    >
      {children}
    </SidebarShell>
  );
}
