"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { BentoCard, BentoTabItem } from "@/components/bento-card";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/Skeleton";
import {
  DashboardSquare01Icon,
  Folder02Icon,
  CircleArrowUpRight02Icon,
  Message01Icon,
  Add01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarCheck, Clock, FileText, ArrowRight, Sparkles } from "lucide-react";
import type { Booking } from "@/lib/types";

interface MenteeBentoCardProps {
  userName?: string;
  totalBookings?: number;
  upcomingBookings: Booking[];
  unreadMessages?: number;
  isLoading?: boolean;
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

export function MenteeBentoCard({
  userName,
  totalBookings = 0,
  upcomingBookings = [],
  unreadMessages = 0,
  isLoading = false,
}: MenteeBentoCardProps) {
  const nextSession = upcomingBookings[0];

  const tabs: BentoTabItem[] = useMemo(() => [
    {
      id: "overview",
      label: "My Journey",
      icon: DashboardSquare01Icon,
      header: "Session Analytics & Status",
      description: "Live progress across your 1-on-1 mentorship bookings.",
      content: (
        <div className="flex flex-col gap-3 h-full">
          {/* Top highlight card */}
          <div className="p-3.5 rounded-xl border border-border/40 bg-linear-to-br from-background via-muted/10 to-primary/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {nextSession ? "Next Scheduled Call" : "Mentorship Status"}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {upcomingBookings.length} Active
              </span>
            </div>

            {nextSession ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-foreground truncate">
                    1-on-1 with {nextSession.mentor?.displayName || "Mentor"}
                  </span>
                  <Link
                    href={`/dashboard/bookings/${nextSession.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {formatDate(nextSession.scheduledAt)} at {formatTime(nextSession.scheduledAt)} · {nextSession.durationMinutes} min
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Ready to level up your career? Schedule your next call with top tech mentors.
                </p>
                <Link
                  href="/mentors"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition-opacity shrink-0"
                >
                  Find a Mentor <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                Total Calls
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-5 w-6" /> : totalBookings}
                </span>
                <span className="text-[9px] text-muted-foreground">sessions</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                Upcoming
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold text-emerald-500">
                  {isLoading ? <Skeleton className="h-5 w-6" /> : upcomingBookings.length}
                </span>
                <span className="text-[9px] text-emerald-600/80">booked</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-border/40 bg-background/60 flex flex-col justify-between">
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                Messages
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold text-indigo-500">
                  {isLoading ? <Skeleton className="h-5 w-6" /> : unreadMessages}
                </span>
                <span className="text-[9px] text-indigo-600/80">unread</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: CalendarCheck,
      badge: upcomingBookings.length ? String(upcomingBookings.length) : undefined,
      header: "Upcoming Mentorship Sessions",
      description: "Confirmed calls with your industry guides and calendar invites.",
      content: (
        <div className="flex flex-col gap-2 h-full">
          {upcomingBookings.length > 0 ? (
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5">
              {upcomingBookings.slice(0, 4).map((b) => (
                <Link
                  key={b.id}
                  href={`/dashboard/bookings/${b.id}`}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {b.mentor?.displayName?.[0] || "M"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {b.mentor?.displayName || "Mentor"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {formatDate(b.scheduledAt)} · {formatTime(b.scheduledAt)}
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
                Schedule a 1-on-1 session to get career direction, mock interviews, or code reviews.
              </p>
              <Link
                href="/mentors"
                className="px-3 py-1.5 rounded-lg bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Mentors
              </Link>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      label: "Launchpad",
      icon: Add01Icon,
      header: "Quick Platform Actions",
      description: "Jump straight into high-impact tools and career accelerators.",
      content: (
        <div className="grid grid-cols-2 gap-2 h-full">
          <Link
            href="/mentors"
            className="p-3 rounded-xl border border-border/40 bg-background/60 hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <HugeiconsIcon icon={UserIcon} size={14} />
              </div>
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Book a Session
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight block mt-0.5">
                Browse verified senior mentors
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/chat"
            className="p-3 rounded-xl border border-border/40 bg-background/60 hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <HugeiconsIcon icon={Message01Icon} size={14} />
              </div>
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Messages
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight block mt-0.5">
                Chat with booked mentors
              </span>
            </div>
          </Link>

          <Link
            href="/resume-roast"
            className="p-3 rounded-xl border border-border/40 bg-background/60 hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Resume Roast
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight block mt-0.5">
                Instant AI ATS feedback
              </span>
            </div>
          </Link>

          <Link
            href="/aptitude-test"
            className="p-3 rounded-xl border border-border/40 bg-background/60 hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <HugeiconsIcon
                icon={CircleArrowUpRight02Icon}
                size={12}
                className="text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors">
                Skill Tests
              </span>
              <span className="text-[9px] text-muted-foreground leading-tight block mt-0.5">
                Aptitude & CP assessments
              </span>
            </div>
          </Link>
        </div>
      ),
    },
    {
      id: "resources",
      label: "Resources",
      icon: Folder02Icon,
      header: "Guidelines & Support",
      description: "Mentee toolkit, session protocols, and platform assistance.",
      content: (
        <div className="flex flex-col gap-1.5 h-full overflow-y-auto pr-0.5">
          {[
            {
              title: "Mentee Code of Conduct",
              desc: "Ethical guidelines & meeting rules",
              href: "/code-of-conduct",
              tag: "Guide",
            },
            {
              title: "Help & FAQ Center",
              desc: "Answers to scheduling and calls",
              href: "/help",
              tag: "Support",
            },
            {
              title: "Refund Policy",
              desc: "100% satisfaction commitment",
              href: "/refund-policy",
              tag: "Policy",
            },
            {
              title: "Become a Mentor",
              desc: "Apply to mentor fellow engineers",
              href: "/become-a-mentor",
              tag: "Opportunity",
            },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center justify-between p-2 rounded-xl border border-border/40 bg-background/60 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                <span className="text-[9px] text-muted-foreground truncate">
                  {item.desc}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">
                  {item.tag}
                </span>
                <HugeiconsIcon
                  icon={CircleArrowUpRight02Icon}
                  size={12}
                  className="text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      ),
    },
  ], [totalBookings, upcomingBookings, unreadMessages, isLoading, nextSession]);

  return (
    <BentoCard
      badgeTitle="Student Console"
      title={`Accelerate your career, ${userName || "Dilkhush"}.`}
      description="Track upcoming sessions, jump into live chats, and explore vetted mentors in one command center."
      workspaceLabel="Mentee Hub"
      tabs={tabs}
      defaultTabId="overview"
      heightClassName="h-[320px] sm:h-[350px]"
    />
  );
}
