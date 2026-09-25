"use client";

import React, { useState, useMemo, useId } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Message01Icon,
  Folder02Icon,
  Add01Icon,
  CircleArrowUpRight02Icon,
  Search01Icon,
  BarChartIcon,
  Tick01Icon,
  Settings02Icon,
  InformationCircleIcon,
  DatabaseIcon,
  Mail01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export interface BentoTabItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  header: string;
  description: string;
  content?: React.ReactNode;
}

const DEFAULT_TABS: BentoTabItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: DashboardSquare01Icon,
    header: "Project Overview",
    description: "Daily summary of your team performance.",
  },
  {
    id: "management",
    label: "Management",
    icon: UserGroupIcon,
    header: "Team Management",
    description: "Manage roles and user permissions.",
    badge: "10",
  },
  {
    id: "threads",
    label: "Threads",
    icon: Message01Icon,
    header: "Communications",
    description: "High-priority team discussions.",
    badge: "12",
  },
  {
    id: "resources",
    label: "Resources",
    icon: Folder02Icon,
    header: "System Assets",
    description: "Shared documentation and media logs.",
  },
];

export interface BentoCardProps {
  badgeTitle?: string;
  title?: string;
  description?: string;
  workspaceLabel?: string;
  tabs?: BentoTabItem[];
  defaultTabId?: string;
  className?: string;
  containerClassName?: string;
  heightClassName?: string;
  layoutGroupId?: string;
}

function TabIcon({ icon, className }: { icon: any; className?: string }) {
  if (!icon) return null;
  if (Array.isArray(icon)) {
    return <HugeiconsIcon icon={icon} size={14} className={className} />;
  }
  const IconComponent = icon;
  return <IconComponent className={cn("size-3.5 shrink-0", className)} />;
}

export function BentoCard({
  badgeTitle = "Project Dashboard",
  title = "High-performance analytics and team collaboration tools in one place.",
  description,
  workspaceLabel = "Workspace",
  tabs = DEFAULT_TABS,
  defaultTabId,
  className,
  containerClassName,
  heightClassName = "h-[320px] sm:h-[350px]",
  layoutGroupId,
}: BentoCardProps) {
  const generatedId = useId();
  const groupScope = layoutGroupId || generatedId;

  const initialTab = useMemo(() => {
    if (defaultTabId) {
      const found = tabs.find((t) => t.id === defaultTabId);
      if (found) return found;
    }
    return tabs[0] || DEFAULT_TABS[0];
  }, [tabs, defaultTabId]);

  const [activeTab, setActiveTab] = useState<BentoTabItem>(initialTab);

  // Sync if tabs change
  React.useEffect(() => {
    if (!tabs.some((t) => t.id === activeTab.id) && tabs.length > 0) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab.id]);

  const activeContent = useMemo(() => {
    if (activeTab.content) {
      return activeTab.content;
    }
    // Fallback for default demo tabs
    switch (activeTab.id) {
      case "dashboard":
        return <OverviewDashboard />;
      case "management":
        return <ManagementDashboard />;
      case "threads":
        return <ThreadsDashboard />;
      case "resources":
        return <ResourcesDashboard />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className={cn("flex items-center justify-center w-full antialiased", containerClassName)}>
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-3xl sm:rounded-4xl border bg-card shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10 m-0",
          className,
        )}
      >
        <div className="p-4 sm:p-6 space-y-1.5 z-10 relative">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {badgeTitle}
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-medium text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </div>
          </div>
          <p className="text-base sm:text-xl md:text-2xl text-foreground font-semibold leading-snug max-w-2xl">
            {title}
          </p>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-normal max-w-xl">
              {description}
            </p>
          )}
        </div>

        <div className={cn("relative w-full overflow-hidden rounded-2xl sm:rounded-[2rem]", heightClassName)}>
          {/* Subtle 3D background depth card */}
          <div className="absolute top-10 sm:top-14 left-8 sm:left-14 w-full h-full bg-muted/60 rounded-3xl border border-border/40 opacity-70" />

          {/* Main floating app window */}
          <div className="absolute top-5 sm:top-6 left-3 sm:left-10 md:left-14 right-0 bottom-0 bg-background rounded-tl-2xl sm:rounded-tl-3xl shadow-xl flex flex-col overflow-hidden ring-4 sm:ring-6 ring-border/80">
            {/* Window header */}
            <div className="px-4 sm:px-5 py-3 rounded-tl-2xl sm:rounded-tl-3xl border-b border-border/70 flex items-center justify-between relative backdrop-blur-sm bg-background/80 shrink-0">
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted/40 border border-border/40">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {workspaceLabel}
                </span>
              </div>
              <div className="w-10" />
            </div>

            {/* Window body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-28 sm:w-36 md:w-40 border-r border-border/40 p-1.5 sm:p-2 flex flex-col gap-1 pt-3 sm:pt-4 bg-muted/15 shrink-0 overflow-y-auto">
                <LayoutGroup id={groupScope}>
                  {tabs.map((tab) => {
                    const isActive = activeTab.id === tab.id;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "relative flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl text-[11px] sm:text-xs transition-colors cursor-pointer text-left w-full",
                          isActive
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground font-medium",
                        )}
                      >
                        <TabIcon
                          icon={Icon}
                          className="z-20 shrink-0 relative"
                        />
                        <span className="truncate z-20 relative">
                          {tab.label}
                        </span>
                        {tab.badge !== undefined && (
                          <span
                            className={cn(
                              "ml-auto text-[8px] sm:text-[9px] leading-none py-0.5 px-1 sm:px-1.5 rounded-md tabular-nums transition-all z-20 relative font-bold",
                              isActive
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-muted text-muted-foreground border border-transparent",
                            )}
                          >
                            {tab.badge}
                          </span>
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="sidebar-pill"
                            className="absolute left-0 w-[2.5px] h-4 rounded-full bg-primary z-30"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.45,
                            }}
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="backgroundIndicator"
                            className="absolute inset-0 rounded-lg bg-background border border-border/60 shadow-xs"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.45,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </LayoutGroup>
              </div>

              {/* Main Tab Content Panel */}
              <div className="flex-1 bg-background p-3.5 sm:p-5 flex flex-col gap-3 overflow-hidden relative">
                <header className="flex flex-col gap-0.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground tracking-tight line-clamp-1 uppercase opacity-75">
                      {activeTab.header}
                    </h3>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground font-normal leading-tight line-clamp-1">
                    {activeTab.description}
                  </p>
                </header>

                <div className="flex-1 overflow-y-auto pr-1 pb-4">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={activeTab.id}
                      initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                      className="h-full"
                    >
                      {activeContent}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-background to-transparent pointer-events-none z-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BentoCard;

const OverviewDashboard = () => (
  <div className="flex flex-col gap-3 h-full">
    <div className="relative p-3.5 rounded-xl border border-border/40 bg-linear-to-br from-background to-muted/20 overflow-hidden">
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-medium text-muted-foreground">
            Team Performance
          </span>
          <HugeiconsIcon
            icon={CircleArrowUpRight02Icon}
            size={12}
            className="text-primary"
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-medium tracking-tight text-foreground">
            94.2%
          </span>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94.2%" }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground">
          Score for Search & Delivery campaigns
        </span>
      </div>
      <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12">
        <HugeiconsIcon icon={BarChartIcon} size={64} />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="p-3 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-foreground">1,070</span>
          <span className="text-[8px] text-muted-foreground uppercase font-medium">
            Keywords
          </span>
        </div>
        <HugeiconsIcon icon={Search01Icon} size={14} className="opacity-20" />
      </div>
      <div className="p-3 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-foreground">2.3M</span>
          <span className="text-[8px] text-muted-foreground uppercase font-medium">
            Credits
          </span>
        </div>
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={14}
          className="opacity-20"
        />
      </div>
    </div>
  </div>
);

const ManagementDashboard = () => (
  <div className="flex flex-col h-full not-prose">
    <div className="rounded-xl border border-border/40 overflow-hidden flex flex-col h-full bg-background/50">
      <div className="bg-muted/30 px-3 py-2 border-b border-border/40 flex items-center justify-between">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
          Active Users
        </span>
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-background border border-border/40">
          <HugeiconsIcon
            icon={Search01Icon}
            size={10}
            className="text-muted-foreground/50"
          />
          <span className="text-[8px] text-muted-foreground font-medium">
            Search
          </span>
        </div>
      </div>
      <div className="p-1 flex flex-col gap-0.5">
        {[
          {
            name: "Anthony Dionne",
            role: "Pending admin approval",
            status: "Waitlist",
            color: "bg-amber-400",
          },
          {
            name: "Nick Yahodin",
            role: "Dealership group admin",
            status: "Active",
            color: "bg-emerald-400",
          },
          {
            name: "Mujeeb Aimaq",
            role: "Dealership group user",
            status: "Active",
            color: "bg-emerald-400",
          },
        ].map((user, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
          >
            <div className="w-6 h-6 rounded-full bg-muted border border-border/40 flex items-center justify-center relative">
              <HugeiconsIcon
                icon={UserIcon}
                size={10}
                className="text-muted-foreground"
              />
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                  user.color,
                )}
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-medium text-foreground truncate">
                {user.name}
              </span>
              <span className="text-[8px] text-muted-foreground truncate">
                {user.role}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <HugeiconsIcon
                icon={Settings02Icon}
                size={12}
                className="text-muted-foreground"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ThreadsDashboard = () => (
  <div className="flex flex-col gap-3 h-full">
    <div className="grid grid-cols-2 gap-3">
      {[
        {
          title: "Create a Page",
          desc: "Build your project base.",
          icon: Folder02Icon,
        },
        {
          title: "Create a Task",
          desc: "Organize with team.",
          icon: Tick01Icon,
        },
      ].map((card, i) => (
        <div
          key={i}
          className="p-3.5 rounded-xl border border-border/40 bg-background/50 flex flex-col gap-3 relative overflow-hidden group"
        >
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[12px] font-medium text-foreground leading-tight">
              {card.title}
            </span>
            <span className="text-[9px] text-muted-foreground leading-tight">
              {card.desc}
            </span>
          </div>
          <button className="w-fit flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground text-background text-[8px] font-semibold transition-transform active:scale-95 group-hover:bg-primary z-10">
            <HugeiconsIcon icon={Add01Icon} size={8} strokeWidth={3} />
            Create
          </button>
        </div>
      ))}
    </div>

    <div className="mt-auto p-3 rounded-xl bg-muted/20 border border-border/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1 px-1.5 rounded-md bg-background border border-border/40">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={10}
            className="text-muted-foreground"
          />
        </div>
        <span className="text-[9px] text-muted-foreground font-medium">
          Pin a new item
        </span>
      </div>
      <HugeiconsIcon
        icon={Add01Icon}
        size={12}
        className="text-muted-foreground/50"
      />
    </div>
  </div>
);

const ResourcesDashboard = () => (
  <div className="flex flex-col gap-3 h-full overflow-hidden">
    <div className="flex-1 rounded-xl border border-border/40 flex flex-col bg-background/50 overflow-hidden">
      <div className="bg-muted/30 px-3 py-2 border-b border-border/40 flex items-center justify-between">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
          Archives & Logs
        </span>
        <HugeiconsIcon
          icon={DatabaseIcon}
          size={12}
          className="text-muted-foreground/30"
        />
      </div>
      <div className="flex-1 p-1 overflow-y-auto scrollbar-hide">
        {[
          {
            file: "design_spec_v2.pdf",
            size: "2.4 MB",
            type: "PDF",
            icon: Mail01Icon,
          },
          {
            file: "q4_performance.xls",
            size: "1.1 MB",
            type: "XLS",
            icon: BarChartIcon,
          },
          {
            file: "branding_assets.zip",
            size: "48 MB",
            type: "ZIP",
            icon: Folder02Icon,
          },
          {
            file: "system_logs.json",
            size: "4 KB",
            type: "JSON",
            icon: Folder02Icon,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-md bg-muted/50 border border-border/40 flex items-center justify-center text-muted-foreground/60 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
              <HugeiconsIcon icon={item.icon} size={12} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-medium text-foreground truncate">
                {item.file}
              </span>
              <span className="text-[8px] text-muted-foreground tabular-nums uppercase">
                {item.size} • {item.type}
              </span>
            </div>
            <HugeiconsIcon
              icon={CircleArrowUpRight02Icon}
              size={10}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);
