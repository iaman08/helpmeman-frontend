"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { BentoCard, BentoTabItem } from "@/components/bento-card";
import { Skeleton } from "@/components/Skeleton";
import { PriceDisplay } from "@/components/PriceDisplay";
import {
  BarChartIcon,
  CircleArrowUpRight02Icon,
  Settings02Icon,
  DatabaseIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShieldCheck,
  Activity,
  Users,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  UserPlus,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  actor: { name: string; email: string };
  createdAt: string;
  target?: string;
}

interface SuperAdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalAdmins: number;
  totalBookings: number;
  platformRevenue: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  recentActivities: AuditLog[];
}

interface SuperAdminBentoCardProps {
  data: SuperAdminDashboardData | null;
  loading: boolean;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SuperAdminBentoCard({ data, loading }: SuperAdminBentoCardProps) {
  const tabs: BentoTabItem[] = useMemo(() => [
    {
      id: "telemetry",
      label: "Telemetry",
      icon: BarChartIcon,
      header: "System Telemetry & Platform Velocity",
      description: "Aggregated gross platform revenue, monthly run rate, and user distribution.",
      content: (
        <div className="flex flex-col gap-3 h-full">
          {/* Revenue Highlight Card */}
          <div className="p-3.5 rounded-xl border border-border/40 bg-linear-to-br from-background via-violet-500/5 to-muted/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Gross Platform Revenue
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 font-semibold border border-violet-500/20">
                Root Ledger
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-foreground">
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <PriceDisplay amountInPaise={data?.platformRevenue ?? 0} />
                )}
              </div>
              <div className="text-right">
                <span className="text-[9px] text-muted-foreground uppercase font-semibold block">Monthly</span>
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {loading ? <Skeleton className="h-4 w-16" /> : <PriceDisplay amountInPaise={data?.monthlyRevenue ?? 0} />}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
              <span>{data?.totalBookings ?? 0} Bookings Completed</span>
              <span className="text-foreground font-semibold">
                {data?.totalUsers ?? 0} Global Accounts
              </span>
            </div>
          </div>

          {/* User breakdown */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">Students</span>
              <span className="text-base font-bold text-foreground mt-0.5">
                {loading ? <Skeleton className="h-4 w-8" /> : data?.totalStudents ?? 0}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">Mentors</span>
              <span className="text-base font-bold text-foreground mt-0.5">
                {loading ? <Skeleton className="h-4 w-8" /> : data?.totalMentors ?? 0}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">Admins</span>
              <span className="text-base font-bold text-violet-600 mt-0.5">
                {loading ? <Skeleton className="h-4 w-8" /> : data?.totalAdmins ?? 0}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      label: "Audit Logs",
      icon: DatabaseIcon,
      badge: data?.recentActivities?.length ? String(data.recentActivities.length) : undefined,
      header: "Real-Time Security & Action Trail",
      description: "Audited administrative operations, role changes, and system events.",
      content: (
        <div className="flex flex-col gap-2 h-full">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : data?.recentActivities && data.recentActivities.length > 0 ? (
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
              {data.recentActivities.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                      {log.actor.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-foreground/80 font-mono">
                      {log.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border/60 text-center">
              <Activity className="w-8 h-8 text-muted-foreground/40 mb-1" />
              <p className="text-xs font-semibold text-foreground">No recent audit logs</p>
            </div>
          )}
          <div className="mt-auto pt-1 flex justify-end">
            <Link
              href="/superadmin/audit-logs"
              className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Full Audit Trail <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "governance",
      label: "Governance",
      icon: ShieldCheck,
      header: "Access Delegation & Queue Health",
      description: "Privileged administrator assignments and mentor screening status.",
      content: (
        <div className="flex flex-col gap-2 h-full">
          {/* Admin Management Row */}
          <div className="p-3 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  Administrator Access
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {data?.totalAdmins ?? 0} active administrative operators
                </span>
              </div>
            </div>
            <Link
              href="/superadmin/admin-management"
              className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-semibold shadow transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> Manage
            </Link>
          </div>

          {/* Pending Approvals */}
          <div className="p-3 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">
                  Mentor Verifications
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {data?.pendingApprovals ?? 0} applications in review
                </span>
              </div>
            </div>
            <Link
              href="/superadmin/mentors"
              className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-[10px] font-semibold transition-colors"
            >
              Inspect
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "system",
      label: "System",
      icon: Settings02Icon,
      header: "Root Control & Platform Infrastructure",
      description: "Direct shortcuts to platform diagnostics, financials, and deletion requests.",
      content: (
        <div className="grid grid-cols-2 gap-2 h-full">
          <Link
            href="/superadmin/system-health"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                System Health
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                Uptime & API status
              </span>
            </div>
          </Link>

          <Link
            href="/superadmin/finance"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Finance & Payouts
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                Ledger reconciliation
              </span>
            </div>
          </Link>

          <Link
            href="/superadmin/deletion-requests"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Deletion Requests
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                GDPR & privacy
              </span>
            </div>
          </Link>

          <Link
            href="/superadmin/settings"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <HugeiconsIcon icon={Settings02Icon} size={14} className="text-indigo-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Master Settings
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                Global configurations
              </span>
            </div>
          </Link>
        </div>
      ),
    },
  ], [data, loading]);

  return (
    <BentoCard
      badgeTitle="Super Admin Console"
      title="Root platform command and ecosystem telemetry."
      description="Manage administrative privileges, review audit activities, and oversee platform financials."
      workspaceLabel="Root Center"
      tabs={tabs}
      defaultTabId="telemetry"
      heightClassName="h-[320px] sm:h-[350px]"
    />
  );
}
