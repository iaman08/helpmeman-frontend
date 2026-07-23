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
  Video,
  Star,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import { PlatformReviewTrigger } from "@/components/PlatformReviewTrigger";
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
    { href: "/dashboard/meetings", label: "Meetings", icon: Video },
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
    {
      onClick: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-platform-review-modal"));
        }
      },
      label: "Rate HelpMeMan",
      icon: Star,
    },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      hasRedirectedRef.current = false;

      if (isMentor) {
        router.replace(mentor?.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status");
      } else if (isAdmin) {
        router.replace("/admin");
      } else if (!user.onboardingRole) {
        router.replace("/onboarding");
      }
      return;
    }

    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/signin");
    }
  }, [loading, user, isMentor, isAdmin, mentor, router]);

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
