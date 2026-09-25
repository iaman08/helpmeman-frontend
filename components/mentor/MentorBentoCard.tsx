"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { BentoCard, BentoTabItem } from "@/components/bento-card";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import { PriceDisplay } from "@/components/PriceDisplay";
import {
  BarChartIcon,
  CircleArrowUpRight02Icon,
  Settings02Icon,
  UserGroupIcon,
  Tick01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarCheck, Star, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface MentorStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  avgRating: number;
  totalReviews: number;
}

interface UpcomingBooking {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  user: { name: string };
}

interface MentorBentoCardProps {
  stats: MentorStats | null;
  bookings: UpcomingBooking[];
  loading: boolean;
  calendarConnected?: boolean;
  onConnectCalendar?: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MentorBentoCard({
  stats,
  bookings = [],
  loading = false,
  calendarConnected = false,
  onConnectCalendar,
}: MentorBentoCardProps) {
  const tabs: BentoTabItem[] = useMemo(() => [
    {
      id: "performance",
      label: "Performance",
      icon: BarChartIcon,
      header: "Revenue & Mentorship Impact",
      description: "Real-time earnings, completed calls, and overall satisfaction score.",
      content: (
        <div className="flex flex-col gap-3 h-full">
          {/* Revenue Highlight Card */}
          <div className="p-3.5 rounded-xl border border-border/40 bg-linear-to-br from-background via-emerald-500/5 to-muted/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Total Mentorship Earnings
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">
                Verified Payouts
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <PriceDisplay amountInPaise={stats?.totalEarnings ?? 0} />
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
              <span>{stats?.totalBookings ?? 0} Total Sessions</span>
              <span className="text-foreground font-semibold">
                {stats?.completedBookings ?? 0} Completed
              </span>
            </div>
          </div>

          {/* 2-Column Rating & Reviews */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                  Avg Rating
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-base font-bold text-foreground">
                    {loading ? (
                      <Skeleton className="h-4 w-8" />
                    ) : stats?.avgRating && stats.avgRating > 0 ? (
                      stats.avgRating.toFixed(1)
                    ) : (
                      "5.0"
                    )}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase">
                / 5.0
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                  Mentees Guided
                </span>
                <span className="text-base font-bold text-foreground mt-0.5">
                  {loading ? <Skeleton className="h-4 w-8" /> : stats?.totalReviews ?? 0}
                </span>
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase">
                Reviews
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Calendar01Icon,
      badge: bookings.length ? String(bookings.length) : undefined,
      header: "Upcoming Mentorship Sessions",
      description: "Confirmed calls with students and calendar schedules.",
      content: (
        <div className="flex flex-col gap-2 h-full">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
              {bookings.slice(0, 4).map((b) => (
                <Link
                  key={b.id}
                  href="/mentor/bookings"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {b.user?.name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {b.user?.name || "Student"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {formatDate(b.scheduledAt)} at {formatTime(b.scheduledAt)} · {b.durationMinutes}m
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={b.status} />
                    <HugeiconsIcon
                      icon={CircleArrowUpRight02Icon}
                      size={12}
                      className="text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-border/60 text-center">
              <CalendarCheck className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-semibold text-foreground">No upcoming sessions</p>
              <p className="text-[10px] text-muted-foreground max-w-xs mt-0.5 mb-2.5">
                Ensure your weekly availability slots are open so students can book you.
              </p>
              <Link
                href="/mentor/availability"
                className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition-opacity"
              >
                Set Availability
              </Link>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "availability",
      label: "Availability",
      icon: Settings02Icon,
      header: "Schedule & Calendar Integrations",
      description: "Manage automated Google Meet generation and recurring booking hours.",
      content: (
        <div className="flex flex-col gap-2 h-full">
          {/* Calendar Status Card */}
          <div className="p-3 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  calendarConnected
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {calendarConnected ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {calendarConnected ? "Google Calendar Connected" : "Google Calendar Unlinked"}
                </span>
                <span className="text-[9px] text-muted-foreground truncate">
                  {calendarConnected
                    ? "Auto Google Meet links active"
                    : "Connect to generate Google Meet links automatically"}
                </span>
              </div>
            </div>

            {!calendarConnected && onConnectCalendar ? (
              <button
                type="button"
                onClick={onConnectCalendar}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-black text-[10px] font-semibold hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
              >
                Connect
              </button>
            ) : (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
                Synced
              </span>
            )}
          </div>

          {/* Quick links to scheduling pages */}
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <Link
              href="/mentor/availability"
              className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <HugeiconsIcon
                  icon={CircleArrowUpRight02Icon}
                  size={12}
                  className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
                />
              </div>
              <div className="mt-2">
                <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                  Weekly Slots
                </span>
                <span className="text-[9px] text-muted-foreground block mt-0.5">
                  Update working hours
                </span>
              </div>
            </Link>

            <Link
              href="/mentor/settings"
              className="p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <HugeiconsIcon icon={Settings02Icon} size={14} className="text-primary" />
                <HugeiconsIcon
                  icon={CircleArrowUpRight02Icon}
                  size={12}
                  className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all"
                />
              </div>
              <div className="mt-2">
                <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                  Pricing & Rules
                </span>
                <span className="text-[9px] text-muted-foreground block mt-0.5">
                  Session rates & bio
                </span>
              </div>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "reviews",
      label: "Feedback",
      icon: UserGroupIcon,
      badge: stats?.totalReviews ? String(stats.totalReviews) : undefined,
      header: "Student Testimonials & Reviews",
      description: "Mentee ratings, verified feedback, and platform reputation.",
      content: (
        <div className="flex flex-col gap-2 h-full">
          <div className="p-3 rounded-xl border border-border/40 bg-background/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">
                  {stats?.avgRating && stats.avgRating > 0
                    ? `${stats.avgRating.toFixed(1)} Rating Score`
                    : "No Reviews Yet"}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Based on {stats?.totalReviews ?? 0} verified student evaluations
                </span>
              </div>
            </div>
            <Link
              href="/mentor/reviews"
              className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-border/40 text-center">
            <p className="text-[11px] font-medium text-foreground">
              Maintain exceptional mentee satisfaction
            </p>
            <p className="text-[9px] text-muted-foreground max-w-xs mt-0.5">
              High ratings unlock featured placement in the mentor directory.
            </p>
          </div>
        </div>
      ),
    },
  ], [stats, bookings, loading, calendarConnected, onConnectCalendar]);

  return (
    <BentoCard
      badgeTitle="Mentor Console"
      title="Empower the next generation of builders."
      description="Monitor session schedules, track revenue, and keep your Google Calendar synchronized."
      workspaceLabel="Mentor Ops"
      tabs={tabs}
      defaultTabId="performance"
      heightClassName="h-[320px] sm:h-[350px]"
    />
  );
}
