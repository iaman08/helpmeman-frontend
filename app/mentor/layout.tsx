"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  Star,
  Clock,
  User,
  Bot,
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
  const [access, setAccess] = useState<{ key: string; status: 'allowed' | 'error' } | null>(null);
  const accessKey = `${user?.id}:${pathname}`;
  const [retry, setRetry] = useState(0);
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
      icon: Bot,
    },
  ];

  // Stable ref to prevent double-redirects during transient state updates
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      hasRedirectedRef.current = false;
      const isTeam = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
      if (isTeam || localStorage.getItem("helpmeman.accessToken")?.startsWith("demo_")) {
        return;
      }
      if (!isMentor) {
        router.replace("/dashboard");
        return;
      }

      let cancelled = false;
      api.get<{ status: string; mentor: { approvalStatus: string } | null }>("/mentor/onboarding", { timeout: 15_000 })
        .then(({ data }) => {
          if (cancelled) return;
          if (data.status !== "COMPLETED" && pathname !== "/mentor/status") {
            router.replace("/onboarding?role=mentor");
          } else if (data.mentor?.approvalStatus !== "APPROVED" && pathname !== "/mentor/status") {
            router.replace("/mentor/status");
          } else {
            setAccess({ key: accessKey, status: 'allowed' });
          }
        })
        .catch(() => { if (!cancelled) setAccess({ key: accessKey, status: 'error' }); });
      return () => { cancelled = true; };
    }

    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/signin");
    }
  }, [loading, user, isMentor, pathname, router, retry, accessKey]);

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
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleActivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("focus", handleActivity);
    };
  }, [user, socket]);


  const isTeam = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isDemo = typeof window !== 'undefined' && localStorage.getItem('helpmeman.accessToken')?.startsWith('demo_');
  if (loading || (user && !isTeam && !isDemo && access?.key !== accessKey)) return (
    <main role="status" className="flex min-h-screen items-center justify-center bg-bg px-5 text-center text-fg">
      <p>Checking your mentor application…</p>
    </main>
  );
  if (!isTeam && !isDemo && access?.key === accessKey && access.status === 'error') return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-5 text-center text-fg">
      <p>We couldn&apos;t check your application status. Please try again.</p>
      <button onClick={() => { setAccess(null); setRetry(value => value + 1); }} className="rounded-full bg-fg px-5 py-3 text-sm text-bg">Retry</button>
    </main>
  );
  if (!user || (!isMentor && !isTeam)) return null;

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
