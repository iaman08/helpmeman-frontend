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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import { useMemo } from "react";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { TeamRoleModal } from "@/components/TeamRoleModal";

const BASE_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: UserCheck },
  { href: "/admin/mentors", label: "All Mentors", icon: Users },
  { href: "/admin/users", label: "Users", icon: Users },
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

/** Emails that belong to the HelpMeMan internal team */
const TEAM_EMAILS = new Set([
  "dilkhush@helpmeman.com",
  "aman@helpmeman.com",
  "akash@helpmeman.com",
  "sriman@helpmeman.com",
  "omi@helpmeman.com",
  "roshan@helpmeman.com",
  "rishav@helpmeman.com",
  "egamberdi@helpmeman.com",
]);

const SESSION_KEY = "hmm.roleSelected";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, mentor, loading, logout, isMentor, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);

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

  // Show the role-selection modal for team members once per session,
  // but only AFTER they've set their permanent password.
  useEffect(() => {
    if (!user) return;
    if (user.mustChangePassword) return;              // Still on forced-change flow
    if (!TEAM_EMAILS.has(user.email?.toLowerCase())) return;  // Not a team account
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;  // Already chose this session

    setShowRoleModal(true);
  }, [user?.id, user?.mustChangePassword, user?.email]);

  // Construct dynamic navItems menu
  const navItems = useMemo(() => {
    if (isSuperAdmin) {
      return [
        ...BASE_NAV.slice(0, 5),
        { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldAlert },
        ...BASE_NAV.slice(5),
      ];
    }
    return BASE_NAV;
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[var()]/20 border-t-[var()] animate-spin" />
      </div>
    );
  }
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
    </SidebarShell>
  );
}

