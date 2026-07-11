"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  MessageCircle,
  Settings,
  Search,
  Sparkles,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import { useUnreadChatCount } from "@/lib/hooks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, mentor, loading, logout, isMentor, isAdmin } = useAuth();
  const router = useRouter();
  const { data: unreadData } = useUnreadChatCount();
  const unreadChatCount = unreadData?.unreadCount ?? 0;

  const NAV = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/dashboard/chat", label: "Chat", icon: MessageCircle, badge: unreadChatCount },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    {
      onClick: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-ai"));
        }
      },
      label: "Ruth",
      icon: Sparkles,
    },
    { href: "/mentors", label: "Browse Mentors", icon: Search },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  // Stable ref to prevent double-redirects during transient state updates.
  // When Supabase fires SIGNED_IN and setUser() is called, there's a brief
  // window where user is being updated. Without this ref, the guard fires
  // on every dependency change, potentially redirecting during that window.
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Don't act while auth is still loading
    if (loading) return;

    // Reset redirect flag when user is confirmed present
    if (user) {
      hasRedirectedRef.current = false;

      // Redirect mentors and admins away from the user dashboard
      if (isMentor) {
        router.replace(mentor?.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status");
      } else if (isAdmin) {
        router.replace("/admin");
      } else if (!user.onboardingRole) {
        router.replace("/onboarding");
      }
      return;
    }

    // user is null and loading is done — genuine unauthenticated state
    // Only redirect once to prevent redirect loops
    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/signin");
    }
  }, [loading, user, isMentor, isAdmin, mentor, router]);


  // Show spinner while auth resolves; render nothing while redirect is in flight
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <SidebarShell
      navItems={NAV}
      rootPath="/dashboard"
      brandLabel="Dashboard"
      userName={user.name}
      userEmail={user.email}
      userAvatar={user.avatar}
      notificationsPath="/dashboard/notifications"
      onLogout={async () => {
        await logout();
      }}
    >
      {children}
    </SidebarShell>
  );
}
