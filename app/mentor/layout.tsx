"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  Star,
  Clock,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";

const NAV = [
  { href: "/mentor", label: "Overview", icon: LayoutDashboard },
  { href: "/mentor/bookings", label: "Sessions", icon: CalendarCheck },
  { href: "/mentor/availability", label: "Availability", icon: Clock },
  { href: "/mentor/earnings", label: "Earnings", icon: DollarSign },
  { href: "/mentor/reviews", label: "Reviews", icon: Star },
  { href: "/mentor/settings", label: "Profile", icon: Settings },
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
    if (
      !loading &&
      isMentor &&
      mentor?.approvalStatus !== "APPROVED" &&
      pathname !== "/mentor/status"
    ) {
      router.replace("/mentor/status");
    }
  }, [loading, user, isMentor, mentor, pathname, router]);

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
      onLogout={async () => {
        await logout();
        router.replace("/signin");
      }}
    >
      {children}
    </SidebarShell>
  );
}
