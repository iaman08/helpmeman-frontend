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
  Tick01Icon,
  UserGroupIcon,
  Folder02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Users, CalendarCheck, UserCheck, ShieldAlert, ArrowRight, Tag, Star } from "lucide-react";

interface DashboardData {
  totalUsers: number;
  totalMentors: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  recentBookings: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    user: { name: string };
    mentor: { displayName: string };
  }>;
}

interface AdminBentoCardProps {
  data: DashboardData | null;
  loading: boolean;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function statusStyle(status: string) {
  if (status === "CONFIRMED") return { background: "rgba(34,197,94,0.1)", color: "#16a34a" };
  if (status === "PENDING") return { background: "rgba(245,158,11,0.1)", color: "#d97706" };
  if (status === "CANCELLED") return { background: "rgba(239,68,68,0.1)", color: "#dc2626" };
  return { background: "rgba(100,116,139,0.1)", color: "var(--muted)" };
}

export function AdminBentoCard({ data, loading }: AdminBentoCardProps) {
  const tabs: BentoTabItem[] = useMemo(() => [
    {
      id: "platform",
      label: "Platform",
      icon: BarChartIcon,
      header: "Platform Throughput & Volume",
      description: "Aggregated user growth, active mentors, and gross booking revenue.",
      content: (
        <div className="flex flex-col gap-3 h-full">
          {/* Revenue Highlight Card */}
          <div className="p-3.5 rounded-xl border border-border/40 bg-linear-to-br from-background via-muted/15 to-primary/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Gross Platform Revenue
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                Live Ledger
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {loading ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <PriceDisplay amountInPaise={data?.totalRevenue ?? 0} />
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
              <span>{data?.totalBookings ?? 0} Total Bookings</span>
              <span className="text-foreground font-semibold">
                {data?.totalMentors ?? 0} Active Mentors
              </span>
            </div>
          </div>

          {/* 2-Column User Distribution */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                  Registered Users
                </span>
                <span className="text-base font-bold text-foreground mt-0.5">
                  {loading ? <Skeleton className="h-4 w-10" /> : data?.totalUsers ?? 0}
                </span>
              </div>
              <Users className="w-4 h-4 text-muted-foreground/40" />
            </div>

            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                  Verified Mentors
                </span>
                <span className="text-base font-bold text-foreground mt-0.5">
                  {loading ? <Skeleton className="h-4 w-10" /> : data?.totalMentors ?? 0}
                </span>
              </div>
              <UserCheck className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "approvals",
      label: "Approvals",
      icon: Tick01Icon,
      badge: data?.pendingApprovals ? String(data.pendingApprovals) : undefined,
      header: "Mentor Application Review Queue",
      description: "Candidates awaiting background review, credential check, and approval.",
      content: (
        <div className="flex flex-col gap-2.5 h-full">
          {(data?.pendingApprovals ?? 0) > 0 ? (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col justify-between gap-3 flex-1">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    {data?.pendingApprovals} Mentor Application{data?.pendingApprovals !== 1 ? "s" : ""} Pending
                  </span>
                  <span className="text-[10px] text-amber-600/90 dark:text-amber-400/80 mt-0.5">
                    Platform 24-hour review SLA is active. Prompt evaluation maintains candidate conversion.
                  </span>
                </div>
              </div>

              <Link
                href="/admin/approvals"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow transition-colors"
              >
                Review Applications <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border/60 text-center">
              <UserCheck className="w-8 h-8 text-emerald-500/60 mb-2" />
              <p className="text-xs font-semibold text-foreground">All queues cleared</p>
              <p className="text-[10px] text-muted-foreground max-w-xs mt-0.5 mb-2">
                No mentor applications are waiting in the review pipeline.
              </p>
              <Link
                href="/admin/approvals"
                className="text-[10px] font-semibold text-primary hover:underline"
              >
                View Approval History →
              </Link>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: Calendar01Icon,
      header: "Live Booking Stream",
      description: "Recent session appointments and live status transitions.",
      content: (
        <div className="flex flex-col gap-2 h-full">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : data?.recentBookings && data.recentBookings.length > 0 ? (
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
              {data.recentBookings.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">
                      {b.user?.name || "Student"}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">→</span>
                    <span className="text-xs font-medium text-foreground/80 truncate max-w-[90px]">
                      {b.mentor?.displayName || "Mentor"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatDate(b.scheduledAt)}
                    </span>
                    <span
                      className="text-[9px] rounded-full px-2 py-0.5 font-semibold"
                      style={statusStyle(b.status)}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border/60 text-center">
              <CalendarCheck className="w-8 h-8 text-muted-foreground/40 mb-1" />
              <p className="text-xs font-semibold text-foreground">No bookings recorded</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "operations",
      label: "Operations",
      icon: Settings02Icon,
      header: "Platform Controls & Directory",
      description: "Quick access to manage categories, reviews, users, and permissions.",
      content: (
        <div className="grid grid-cols-2 gap-2 h-full">
          <Link
            href="/admin/users"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                User Directory
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                Profiles & roles
              </span>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Categories
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                Domains & tags
              </span>
            </div>
          </Link>

          <Link
            href="/admin/platform-reviews"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Platform Reviews
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                Ratings moderation
              </span>
            </div>
          </Link>

          <Link
            href="/admin/team"
            className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <HugeiconsIcon icon={UserGroupIcon} size={14} className="text-purple-500" />
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Internal Team
              </span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">
                Staff & admin access
              </span>
            </div>
          </Link>
        </div>
      ),
    },
  ], [data, loading]);

  return (
    <BentoCard
      badgeTitle="Admin Operations"
      title="Platform oversight and operational velocity."
      description="Monitor booking velocity, review pending applications, and manage platform taxonomy."
      workspaceLabel="Admin Desk"
      tabs={tabs}
      defaultTabId="platform"
      heightClassName="h-[320px] sm:h-[350px]"
    />
  );
}
