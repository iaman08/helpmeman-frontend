"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  Star,
  Clock,
  User,
  Sparkles,
  Bell,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import api from "@/lib/api";
import { useUnreadChatCount } from "@/lib/hooks";
import { useSocket } from "@/lib/socket-context";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, mentor, loading, logout, isMentor } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { data: unreadData } = useUnreadChatCount();
  const unreadChatCount = unreadData?.unreadCount ?? 0;

  const NAV = [
    { href: "/mentor", label: "Overview", icon: LayoutDashboard },
    { href: "/mentor/bookings", label: "Sessions", icon: CalendarCheck },
    { href: "/mentor/chat", label: "Chat", icon: MessageCircle, badge: unreadChatCount },
    { href: "/mentor/availability", label: "Availability", icon: Clock },
    { href: "/mentor/earnings", label: "Earnings", icon: DollarSign },
    { href: "/mentor/reviews", label: "Reviews", icon: Star },
    { href: "/mentor/calendar", label: "Calendar", icon: Calendar },
    { href: "/mentor/settings", label: "Profile", icon: User },
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

  // Stable ref to prevent double-redirects during transient state updates
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      hasRedirectedRef.current = false;
      if (!user.onboardingRole) {
        router.replace("/onboarding");
      } else if (!isMentor) {
        const dest = user.role === "ADMIN" ? "/admin" : "/dashboard";
        router.replace(dest);
      } else if (
        mentor?.approvalStatus !== "APPROVED" &&
        pathname !== "/mentor/status" &&
        !localStorage.getItem("helpmeman.accessToken")?.startsWith("demo_")
      ) {
        router.replace("/mentor/status");
      }
      return;
    }

    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/signin");
    }
  }, [loading, user, isMentor, mentor, pathname, router]);

  useEffect(() => {
    const isDemo = localStorage.getItem("helpmeman.accessToken")?.startsWith("demo_");
    if (
      loading ||
      !user ||
      !isMentor ||
      isDemo ||
      mentor?.approvalStatus === "APPROVED" ||
      pathname === "/mentor/status"
    )
      return;
    api.get<{ role: string | null; status: string }>("/mentor/onboarding")
      .then(({ data }) => {
        if (data.role !== "MENTOR" || data.status !== "COMPLETED") router.replace("/onboarding");
      })
      .catch(() => { /* keep the dashboard usable during a transient API outage */ });
  }, [loading, user, isMentor, pathname, router]);

  // ─── Real-Time Presence Heartbeat (using global socket) ───
  const { socket } = useSocket();

  useEffect(() => {
    if (!user || !socket) return;

    let lastActivity = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      // Throttle pings to once every 45s to avoid socket spam
      if (now - lastActivity > 45000) {
        lastActivity = now;
        socket.emit("user_activity");
      }
    };

    // Attach interaction listeners
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("focus", handleActivity);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleActivity();
      }
    });

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("focus", handleActivity);
    };
  }, [user, socket]);


  // Show spinner while loading or while redirect is in flight
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
      </div>
    );
  }
  // Non-mentor users are being redirected by the useEffect above — render nothing
  if (!user || !isMentor) return null;

  return (
    <SidebarShell
      navItems={NAV}
      rootPath="/mentor"
      brandLabel="Mentor Panel"
      brandColor="text-amber-500"
      userName={user.name}
      userEmail={user.email}
      userAvatar={user.avatar}
      userBadge={
        mentor?.approvalStatus === "APPROVED"
          ? "Verified Mentor"
          : mentor?.approvalStatus
      }
      avatarColor="bg-amber-500/10 text-amber-500"
      notificationsPath="/mentor/notifications"
      onLogout={async () => {
        await logout();
      }}
    >
      {children}
    </SidebarShell>
  );
}
