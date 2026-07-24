"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  Clock,
  MapPin,
  Briefcase,
  ExternalLink,
  MessageCircle,
  Share2,
  Globe,
  Languages,
  Zap,
  Award,
  ArrowLeft,
  LayoutDashboard,
  CalendarCheck,
  Settings,
  Search as SearchIcon,
  Sparkles,
  UserCheck,
  Users,
  FolderTree,
  DollarSign,
  Bell,
  User,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { useMentor, useMentorReviews, useUnreadChatCount } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import { Navbar } from "@/components/Navbar";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect } from "react";
import { ShareProfileModal } from "@/components/ShareProfileModal";
import { Avatar } from "@/components/Avatar";
import { ReviewCard } from "@/components/ReviewCard";
import { MentorRatingStatsDisplay } from "@/components/MentorRatingStats";
import { PriceDisplay } from "@/components/PriceDisplay";

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-amber-500 fill-amber-500"
              : "text-(--fg)/15"
          }`}
        />
      ))}
    </div>
  );
}

export default function MentorProfilePage() {
  const { user, logout, isMentor, isAdmin } = useAuth();
  const { data: unreadData } = useUnreadChatCount();
  const unreadChatCount = unreadData?.unreadCount ?? 0;

  const { id } = useParams();
  const { data, isLoading, error } = useMentor(id as string);
  const [reviewPage, setReviewPage] = useState(1);
  const {
    data: reviewData,
    isLoading: reviewsLoading,
  } = useMentorReviews(id as string, reviewPage);
  
  const [isShareOpen, setIsShareOpen] = useState(false);

  const mentor = data?.mentor;

  // Auto-open share modal if ?share=true query param is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("share") === "true") {
        setIsShareOpen(true);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-24 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 pb-6 border-b border-(--hairline)">
          <Skeleton className="h-28 w-28 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-5 w-full rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-24">
        <EmptyState
          icon={<Star className="h-8 w-8 text-red-500" />}
          title="Mentor not found"
          description="The mentor you are looking for does not exist or has deactivated their profile."
          action={
            <Link
              href="/"
              className="rounded-full bg-(--accent) text-(--accent-fg) px-6 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
          }
        />
      </div>
    );
  }

  const content = (
    <div className={`w-full max-w-[1000px] ${user ? 'px-4 sm:px-6 pt-6 sm:pt-8' : 'mx-auto px-5 sm:px-10 pt-24 sm:pt-28'} pb-10`}>
      {/* Back Button */}
      <Link
        href="/mentors"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-(--muted) hover:text-(--fg) mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Explore
      </Link>

      {/* ─── Profile Content ─── */}
      <div className="flex flex-col gap-12 text-(--fg)">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ─── Left: Profile Details ─── */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Profile Info Details Card */}
            <div className="relative border border-(--hairline) rounded-3xl p-6 bg-(--bg) shadow-sm">
              
              {/* Profile Details Container */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar
                    name={mentor.displayName}
                    url={mentor.avatar}
                    size="custom"
                    className="h-24 w-24 md:h-28 md:w-28 rounded-full border border-(--hairline) object-cover bg-(--fg)/5"
                  />
                  {mentor.isOnline && (
                    <span className="absolute bottom-1 right-1 h-4.5 w-4.5 rounded-full bg-emerald-500 border-2 border-(--bg) animate-pulse" />
                  )}
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-(--fg)">
                      {mentor.displayName}
                    </h1>
                    {mentor.isOnline ? (
                      <span className="inline-flex items-center gap-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 text-[9px] font-bold border border-green-500/20 shrink-0">
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-(--muted)/10 text-(--muted) px-2 py-0.5 text-[9px] font-bold border border-(--hairline) shrink-0">
                        Offline
                      </span>
                    )}
                    {mentor.rating >= 4.8 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 shrink-0">
                        <Award className="h-3 w-3" />
                        Top Mentor
                      </span>
                    )}
                  </div>

                  {mentor.currentRole && (
                    <p className="text-sm font-semibold text-(--muted) truncate">
                      {mentor.currentRole} {mentor.company ? `@ ${mentor.company}` : ""}
                    </p>
                  )}
                </div>

                {/* Quick actions block */}
                <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0 md:ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsShareOpen(true)}
                    className="flex items-center gap-1.5 rounded border border-(--hairline) px-3 py-1.5 text-xs font-bold hover:bg-(--fg)/5 transition-colors cursor-pointer text-(--fg)"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Save
                  </button>
                  
                  <Link
                    href={`/dashboard/chat?mentorId=${mentor.id}`}
                    className="flex items-center gap-1.5 rounded bg-(--fg)/5 border border-(--hairline) px-3 py-1.5 text-xs font-bold hover:bg-(--fg)/10 transition-colors text-(--fg)"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Message
                  </Link>

                  {mentor.linkedinUrl && (
                    <a
                      href={mentor.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center h-7 w-7 rounded border border-(--hairline) hover:bg-(--fg)/5 text-(--fg) transition-colors"
                      title="LinkedIn profile"
                    >
                      <FaLinkedin className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 border border-(--hairline) rounded-2xl p-5 bg-(--bg) shadow-sm my-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-(--muted)">From</div>
                <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.location || "Not specified"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-(--muted)">Member Since</div>
                <div className="text-sm font-bold mt-1 text-(--fg)">
                  {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recent"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-(--muted)">Response time</div>
                <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.averageResponseTime || "Not specified"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-(--muted)">Sessions Completed</div>
                <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.totalSessions || 0} sessions</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-(--muted)">Experience</div>
                <div className="text-sm font-bold mt-1 text-(--fg)">{mentor.experienceYears ? `${mentor.experienceYears}+ Years` : "Not specified"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-(--muted)">Languages</div>
                <div className="text-sm font-bold mt-1 text-(--fg) truncate" title={Array.isArray(mentor.languages) ? mentor.languages.join(", ") : mentor.languages || "English"}>
                  {Array.isArray(mentor.languages) ? mentor.languages.join(", ") : mentor.languages || "English"}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[10px] uppercase tracking-[0.22em] font-extrabold text-(--muted)">
                About
              </h2>
              <p className="text-base text-(--fg)/90 leading-relaxed whitespace-pre-line font-sans">
                {mentor.bio}
              </p>
            </div>

            {/* Expertise */}
            {mentor.expertise.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[10px] uppercase tracking-[0.22em] font-extrabold text-(--muted)">
                  Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded bg-(--fg)/5 border border-(--hairline) text-(--fg)"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* LinkedIn Link */}
            {mentor.linkedinUrl && (
              <a
                href={mentor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-(--muted) hover:text-(--fg) transition-colors font-bold"
              >
                <ExternalLink className="h-4 w-4" />
                LinkedIn Profile
              </a>
            )}

          </div>

          {/* ─── Right: Booking Card ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-(--hairline) p-6 flex flex-col gap-5 bg-(--bg) shadow-lg">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-black text-(--fg)">
                  <PriceDisplay amountInPaise={mentor.pricePerSession} />
                </span>
                <span className="text-xs text-(--muted) font-semibold">
                  / {mentor.sessionDuration} min
                </span>
              </div>

              <div
                aria-hidden
                className="h-px w-full bg-(--hairline)"
              />

              <ul className="flex flex-col gap-3 text-sm text-(--fg)/85 font-medium">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--fg)" />
                  1-on-1 video call
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--fg)" />
                  Google Meet link
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--fg)" />
                  Notes & follow-up
                </li>
              </ul>

              <Link
                href={`/book/${mentor.id}`}
                className="text-center rounded-xl bg-(--fg) text-(--bg) px-7 py-3.5 text-sm font-bold hover:opacity-90 active:scale-97 transition-all cursor-pointer"
              >
                Book a session
              </Link>

              <Link
                href={`/dashboard/chat?mentorId=${mentor.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-(--fg)/5 border border-(--hairline) px-7 py-3.5 text-sm font-bold hover:bg-(--fg)/10 transition-colors text-center text-(--fg) cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                Chat first
              </Link>

              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-(--hairline) px-7 py-3.5 text-sm font-bold hover:bg-(--fg)/5 transition-colors cursor-pointer text-(--fg)"
              >
                <Share2 className="h-4 w-4" />
                Share profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {mentor && (
        <ShareProfileModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          mentor={mentor}
        />
      )}
    </div>
  );

  if (user) {
    let NAV: any[] = [];
    let rootPath = "/dashboard";
    let brandLabel = "Dashboard";
    let notificationsPath: string | undefined = "/dashboard/notifications";

    if (isAdmin) {
      rootPath = "/admin";
      brandLabel = "Admin Panel";
      notificationsPath = undefined;
      NAV = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/approvals", label: "Approvals", icon: UserCheck },
        { href: "/admin/mentors", label: "All Mentors", icon: Users },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
        { href: "/admin/categories", label: "Categories", icon: FolderTree },
        { href: "/admin/earnings", label: "Earnings", icon: DollarSign },
        { href: "/admin/reviews", label: "Reviews", icon: Star },
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
    } else if (isMentor) {
      rootPath = "/mentor";
      brandLabel = "Mentor Panel";
      notificationsPath = "/mentor/notifications";
      NAV = [
        { href: "/mentor", label: "Overview", icon: LayoutDashboard },
        { href: "/mentor/bookings", label: "Sessions", icon: CalendarCheck },
        { href: "/mentor/chat", label: "Chat", icon: MessageCircle, badge: unreadChatCount },
        { href: "/mentor/availability", label: "Availability", icon: Clock },
        { href: "/mentor/earnings", label: "Earnings", icon: DollarSign },
        { href: "/mentor/reviews", label: "Reviews", icon: Star },
        { href: "/mentor/notifications", label: "Notifications", icon: Bell },
        { href: "/mentor/settings", label: "Profile", icon: User },
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
    } else {
      brandLabel = "Student Panel";
      NAV = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
        { href: "/dashboard/chat", label: "Chat", icon: MessageCircle, badge: unreadChatCount },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
        {
          onClick: () => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("open-ai"));
            }
          },
          label: "Ruth",
          icon: Sparkles,
        },
        { href: "/mentors", label: "Browse Mentors", icon: SearchIcon },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ];
    }

    return (
      <SidebarShell
        navItems={NAV}
        rootPath={rootPath}
        brandLabel={brandLabel}
        userName={user.name}
        userEmail={user.email}
        userAvatar={user.avatar}
        notificationsPath={notificationsPath}
        className="max-w-[1200px] w-full px-4 sm:px-10 py-10 pt-[72px] md:pt-10"
        onLogout={async () => {
          await logout();
          window.location.href = "/";
        }}
      >
        {content}
      </SidebarShell>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{content}</main>
    </div>
  );
}
