"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  Star,
  Clock,
  User,
  Sparkles,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import api from "@/lib/api";

const NAV = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/bookings", label: "Sessions", icon: CalendarCheck },
  { href: "/mentor/availability", label: "Availability", icon: Clock },
  { href: "/mentor/earnings", label: "Earnings", icon: DollarSign },
  { href: "/mentor/reviews", label: "Reviews", icon: Star },
  { href: "/mentor/notifications", label: "Notifications", icon: Bell },
  { href: "/mentor/settings", label: "Profile", icon: User },
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

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, mentor, loading, logout, isMentor } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isMentor)) {
      router.replace("/signin");
      return;
    }
    // Redirect non-approved mentors to status page
    // Development mode bypass: Allow all mentors to access the dashboard regardless of approval status
    // if (
    //   !loading &&
    //   isMentor &&
    //   mentor?.approvalStatus !== "APPROVED" &&
    //   pathname !== "/mentor/status"
    // ) {
    //   router.replace("/mentor/status");
    // }
  }, [loading, user, isMentor, mentor, pathname, router]);

  useEffect(() => {
    if (loading || !user || !isMentor || user.id.startsWith("demo_") || pathname === "/mentor/status") return;
    api.get<{ role: string | null; status: string }>("/onboarding/status")
      .then(({ data }) => {
        if (data.role !== "MENTOR" || data.status !== "COMPLETED") router.replace("/onboarding");
      })
      .catch(() => { /* keep the dashboard usable during a transient API outage */ });
  }, [loading, user, isMentor, pathname, router]);

  if (loading || !user || !isMentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-(--fg)/20 border-t-(--fg) animate-spin" />
      </div>
    );
  }

  return (
    <SidebarShell
      navItems={NAV}
      rootPath="/mentor"
      brandLabel="Mentor Panel"
      brandColor="text-amber-500"
      userName={user.name}
      userBadge={
        mentor?.approvalStatus === "APPROVED"
          ? "Verified Mentor"
          : mentor?.approvalStatus
      }
      avatarColor="bg-amber-500/10 text-amber-500"
      notificationsPath="/mentor/notifications"
      onLogout={async () => {
        await logout();
        router.replace("/signin");
      }}
    >
      {children}
    </SidebarShell>
  );
}
