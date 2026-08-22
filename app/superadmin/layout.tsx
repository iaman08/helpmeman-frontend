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
import { useState } from "react";
import TwoFactorModal from "@/components/TwoFactorModal";
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
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);

  const is2FAMandatory = (isAdmin || isSuperAdmin) && !user?.twoFactorEnabled;

  useEffect(() => {
    if (user && is2FAMandatory) {
      setTwoFactorSetupOpen(true);
    }
  }, [user?.id, is2FAMandatory]);

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

  if (loading) return null;

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
        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>

      {/* Mandatory Google Authenticator 2FA Setup Modal */}
      <TwoFactorModal
        isOpen={twoFactorSetupOpen}
        onClose={() => setTwoFactorSetupOpen(false)}
        mode="setup"
        isMandatory={is2FAMandatory}
      />
    </SidebarShell>
  );
}
