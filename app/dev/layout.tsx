"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarShell } from "@/components/SidebarShell";
import { useAuth } from "@/lib/auth-context";
import { Terminal, Cpu, Database, Mail, ShieldAlert, Layers } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";

const DEV_NAV_ITEMS = [
  { href: "/dev/dashboard", label: "Dev Console", icon: Terminal },
  { href: "/superadmin", label: "Super Admin", icon: ShieldAlert },
  { href: "/admin", label: "Admin Panel", icon: Layers },
];

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Login page (/dev) renders full width without sidebar
  if (pathname === "/dev") {
    return <>{children}</>;
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Skeleton className="h-40 w-96 rounded-2xl bg-slate-900" />
      </div>
    );
  }

  return (
    <SidebarShell
      navItems={DEV_NAV_ITEMS}
      rootPath="/dev"
      brandLabel="DEV CONSOLE"
      brandColor="text-cyan-400 font-mono"
      userName={user?.name || "Developer"}
      userEmail={user?.email || "riturdev@gmail.com"}
      userAvatar={user?.avatar}
      userBadge="DEVELOPER"
      onLogout={logout}
    >
      {children}
    </SidebarShell>
  );
}
