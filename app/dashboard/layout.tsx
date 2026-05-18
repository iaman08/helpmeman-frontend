"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageCircle,
  Settings,
  Search,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const NAV = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/dashboard/chat", label: "Chat", icon: MessageCircle },
    { href: "/mentors", label: "Browse Mentors", icon: Search },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    {
      onClick: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-ai"));
        }
      },
      label: "AI Assistant",
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
      </div>
    );
  }

  return (
    <SidebarShell
      navItems={NAV}
      rootPath="/dashboard"
      brandLabel="Dashboard"
      userName={user.name}
      userEmail={user.email}
      userAvatar={user.avatar}
      onLogout={async () => {
        await logout();
        router.replace("/signin");
      }}
    >
      {children}
    </SidebarShell>
  );
}
