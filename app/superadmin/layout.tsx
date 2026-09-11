"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  UserX,
  GraduationCap,
  CalendarCheck,
  DollarSign,
  BarChart3,
  ShieldCheck,
  ScrollText,
  Settings,
  Activity,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState, useMemo } from "react";
import api from "@/lib/api";
import TwoFactorModal from "@/components/TwoFactorModal";
import { SidebarShell } from "@/components/SidebarShell";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, mentor, loading, logout, isMentor, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [pendingDeletionCount, setPendingDeletionCount] = useState(0);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const fetchCount = () => {
      api.get("/super-admin/deletion-requests/pending-count")
        .then((res) => setPendingDeletionCount(res.data.count || 0))
        .catch(() => {});
    };
    fetchCount();
    const timer = setInterval(fetchCount, 30_000);
    return () => clearInterval(timer);
  }, [isSuperAdmin]);

  const navItems = useMemo(() => [
    { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/superadmin/users", label: "Users", icon: Users },
    {
      href: "/superadmin/deletion-requests",
      label: "Deletion Requests",
      icon: UserX,
      badge: pendingDeletionCount,
    },
    { href: "/superadmin/mentors", label: "Mentors", icon: GraduationCap },
    { href: "/superadmin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/superadmin/finance", label: "Finance", icon: DollarSign },
    { href: "/superadmin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/superadmin/admin-management", label: "Admin Management", icon: ShieldCheck },
    { href: "/superadmin/audit-logs", label: "Audit Logs", icon: ScrollText },
    { href: "/superadmin/settings", label: "Settings", icon: Settings },
    { href: "/superadmin/system-health", label: "System Health", icon: Activity },
    {
      onClick: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-ai"));
        }
      },
      label: "Ruth",
      icon: Sparkles,
    },
  ], [pendingDeletionCount]);

  const is2FAMandatory = (isAdmin || isSuperAdmin) && !user?.twoFactorEnabled;

  useEffect(() => {
    if (user && is2FAMandatory && !user.mustChangePassword) {
      setTwoFactorSetupOpen(true);
    }
  }, [user?.id, is2FAMandatory, user?.mustChangePassword]);

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
      navItems={navItems}
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

      {/* Force-password-change modal — shown when account was provisioned with a temp password */}
      {user.mustChangePassword && (
        <ChangePasswordModal
          onSuccess={() => {
            // Modal updates React state when done
          }}
        />
      )}

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
