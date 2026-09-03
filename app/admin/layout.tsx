"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CalendarCheck,
  FolderTree,
  DollarSign,
  Star,
  Sparkles,
  UserCog,
  ShieldAlert,
  ShieldCheck,
  Bug,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import { useMemo } from "react";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { TeamRoleModal } from "@/components/TeamRoleModal";
import TwoFactorModal from "@/components/TwoFactorModal";

const BASE_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: UserCheck },
  { href: "/admin/mentors", label: "All Mentors", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bugs", label: "Bug Reports", icon: Bug },
  { href: "/admin/team", label: "Team Management", icon: UserCog },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/earnings", label: "Earnings", icon: DollarSign },
  { href: "/admin/reviews", label: "Session Reviews", icon: Star },
  { href: "/admin/platform-reviews", label: "Platform Reviews", icon: Star },
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

const SESSION_KEY = "hmm.roleSelected";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, mentor, loading, logout, isMentor, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);

  // Stable ref to prevent double-redirects during transient state updates
  const hasRedirectedRef = useRef(false);
  const mountLoggedRef = useRef(false);
  if (!mountLoggedRef.current) {
    mountLoggedRef.current = true;
    console.log(`[ADMIN:mount] AdminLayout first render — loading=${loading}, user=${user ? user.email : "null"}`);
  }

  useEffect(() => {
    if (loading) return;

    if (user) {
      hasRedirectedRef.current = false;

      const activeRole = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("hmm.activeRole") : null;
      if (activeRole === "mentor") {
        router.replace(isMentor && mentor?.approvalStatus !== "APPROVED" ? "/mentor/status" : "/mentor");
        return;
      }
      if (activeRole === "mentee") {
        router.replace("/dashboard");
        return;
      }

      if (!isAdmin) {
        const dest = isMentor
          ? (mentor?.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status")
          : "/dashboard";
        router.replace(dest);
      }
      return;
    }

    if (!hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/signin");
    }
  }, [loading, user, isAdmin, isMentor, mentor, router]);

  // Mandatory 2FA Setup enforcement for Admin & Super Admin accounts
  const is2FAMandatory = (isAdmin || isSuperAdmin) && !user?.twoFactorEnabled;

  useEffect(() => {
    if (user && is2FAMandatory && !user.mustChangePassword) {
      setTwoFactorSetupOpen(true);
    }
  }, [user?.id, is2FAMandatory, user?.mustChangePassword]);

  // Show the role-selection modal for team members once per session,
  // but only AFTER they've set their permanent password.
  useEffect(() => {
    if (!user) return;
    if (user.mustChangePassword) return;              // Still on forced-change flow
    if (!isAdmin && !isSuperAdmin) return;            // Only show for admin/superadmin roles
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;  // Already chose this session

    setShowRoleModal(true);
  }, [user?.id, user?.mustChangePassword, isAdmin, isSuperAdmin]);

  // Construct dynamic navItems menu
  const navItems = useMemo(() => {
    const items = isSuperAdmin
      ? [
          ...BASE_NAV.slice(0, 5),
          { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
          ...BASE_NAV.slice(5),
        ]
      : [...BASE_NAV];

    items.push({
      onClick: () => setTwoFactorSetupOpen(true),
      label: "2FA Protection",
      icon: ShieldCheck,
    });

    return items;
  }, [isSuperAdmin]);

  if (loading) return null;
  if (!user || !isAdmin) return null;

  return (
    <SidebarShell
      navItems={navItems}
      rootPath="/admin"
      brandLabel="Admin Panel"
      brandColor="text-red-500"
      userName={user.name}
      userAvatar={user.avatar}
      userBadge={isSuperAdmin ? "Super Admin" : "Administrator"}
      avatarColor="bg-red-500/10 text-red-500"
      onLogout={async () => {
        // Clear the session flag so the modal shows again on next login
        sessionStorage.removeItem(SESSION_KEY);
        await logout();
      }}
    >
      {children}

      {/* Force-password-change modal — shown when account was provisioned with a temp password */}
      {user.mustChangePassword && (
        <ChangePasswordModal
          onSuccess={() => {
            // No-op: the modal has already swapped tokens and called updateUser()
            // to clear mustChangePassword in React state, which unmounts this modal.
          }}
        />
      )}

      {/* Role selection modal — shown to team members on first load each session */}
      {showRoleModal && !user.mustChangePassword && (
        <TeamRoleModal onClose={() => setShowRoleModal(false)} />
      )}

      {/* Google Authenticator 2FA Setup Modal */}
      <TwoFactorModal
        isOpen={twoFactorSetupOpen}
        onClose={() => setTwoFactorSetupOpen(false)}
        mode="setup"
        isMandatory={is2FAMandatory}
      />
    </SidebarShell>
  );
}

