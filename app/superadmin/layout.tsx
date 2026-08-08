"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  DollarSign,
  BarChart3,
  ShieldCheck,
  ScrollText,
  Settings,
  Activity,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";

const NAV_ITEMS = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superadmin/users", label: "Users", icon: Users },
  { href: "/superadmin/mentors", label: "Mentors", icon: GraduationCap },
  { href: "/superadmin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/superadmin/finance", label: "Finance", icon: DollarSign },
  { href: "/superadmin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/superadmin/admin-management", label: "Admin Management", icon: ShieldCheck },
  { href: "/superadmin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/superadmin/settings", label: "Settings", icon: Settings },
  { href: "/superadmin/system-health", label: "System Health", icon: Activity },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, mentor, loading, logout, isMentor, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      hasRedirectedRef.current = false;
      if (!isSuperAdmin) {
        if (isAdmin) {
          router.replace("/admin");
        } else if (isMentor) {
          const dest = mentor?.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
          router.replace(dest);
        } else {
          router.replace("/dashboard");
        }
      }
      return;
    }

    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/signin");
    }
  }, [loading, user, isAdmin, isSuperAdmin, isMentor, mentor, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="h-6 w-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--hairline)", borderTopColor: "var(--fg)" }} />
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  return (
    <SidebarShell
      navItems={NAV_ITEMS}
      rootPath="/superadmin"
      brandLabel="Super Admin"
      brandColor="text-rose-500"
      userName={user.name}
      userAvatar={user.avatar}
      userBadge="Super Admin"
      avatarColor="bg-rose-500/10 text-rose-500"
      onLogout={async () => {
        await logout();
      }}
    >
      <div className="relative min-h-[calc(100vh-80px)]">
        {/* Red Wine Ambient Background Glare (Super Admin Executive Theme) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
          <div
            className="absolute -top-[10%] left-[-10%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full opacity-35 dark:opacity-50 blur-[130px] transition-all duration-700"
            style={{
              background: "radial-gradient(circle, #800f2f 0%, #4a0418 55%, transparent 100%)",
            }}
          />
          <div
            className="absolute top-[30%] right-[-15%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full opacity-25 dark:opacity-40 blur-[140px] transition-all duration-700"
            style={{
              background: "radial-gradient(circle, #a4133c 0%, #590d22 60%, transparent 100%)",
            }}
          />
          <div
            className="absolute -bottom-[15%] left-[20%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full opacity-20 dark:opacity-35 blur-[140px] transition-all duration-700"
            style={{
              background: "radial-gradient(circle, #c9184a 0%, #38040e 65%, transparent 100%)",
            }}
          />
        </div>

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </SidebarShell>
  );
}
