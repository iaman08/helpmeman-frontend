"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
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
  Bot,
  UserCheck,
  Users,
  FolderTree,
  DollarSign,
  Bell,
  User,
  CheckCircle2,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { useMentor, useMentorReviews, useUnreadChatCount } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { SidebarShell } from "@/components/SidebarShell";
import { Navbar } from "@/components/Navbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useState, useEffect, useMemo } from "react";
import { ShareProfileModal } from "@/components/ShareProfileModal";
import { Avatar } from "@/components/Avatar";
import { ReviewCard } from "@/components/ReviewCard";
import { MentorRatingStatsDisplay } from "@/components/MentorRatingStats";
import { PriceDisplay } from "@/components/PriceDisplay";
import { getComputedBanner } from "@/lib/banner-generator";
import { OrganizationLogo } from "@/components/OrganizationLogo";
import { BrandBanner } from "@/components/BrandBanner";
import { GoldenVerifiedBadge } from "@/components/GoldenVerifiedBadge";

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
          className={`h-4 w-4 ${star <= rating
              ? "text-amber-500 fill-amber-500"
              : "text-[var(--fg)]/15"
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
  const searchParams = useSearchParams();
  const fromDiscover = searchParams.get("from") === "discover";
  const backHref = fromDiscover ? "/mentors?tab=discover" : "/mentors";
  const backLabel = fromDiscover ? "Back to Discover" : "Back to Explore";

  const { data, isLoading, error } = useMentor(id as string);
  const [reviewPage, setReviewPage] = useState(1);
  const {
    data: reviewData,
    isLoading: reviewsLoading,
  } = useMentorReviews(id as string, reviewPage);

  const uniqueReviews = useMemo(() => {
    const seen = new Set<string>();
    return (reviewData?.reviews ?? []).filter((r: any) => {
      if (!r.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [reviewData?.reviews]);

  const [isShareOpen, setIsShareOpen] = useState(false);

  const mentor = data?.mentor;

  const computedBanner = useMemo(() => {
    if (!mentor) return { isImage: false, gradientClass: "from-zinc-900 to-zinc-950", bannerImageUrl: null, bannerPosition: "50% 50%" };
    return getComputedBanner({
      bannerImageUrl: mentor.bannerImageUrl || mentor.user?.bannerImageUrl,
      bannerPosition: mentor.bannerPosition || mentor.user?.bannerPosition,
      profession: mentor.headline || mentor.currentRole || "Mentor",
      company: mentor.company || mentor.user?.currentCompany,
      university: mentor.user?.university,
    });
  }, [mentor]);

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
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 pb-6 border-b border-[var(--hairline)]">
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
              className="rounded-full bg-[var(--fg)] text-[var(--bg)] px-6 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
          }
        />
      </div>
    );
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-[1000px] ${user ? 'px-4 sm:px-6 pt-6 sm:pt-8' : 'mx-auto px-5 sm:px-10 pt-24 sm:pt-28'} pb-10`}
    >
      {/* Back Button */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--fg)] hover:text-[var(--fg)] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      {/* ─── Profile Content ─── */}
      <div className="flex flex-col gap-12 text-[var(--fg)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ─── Left: Profile Details ─── */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Premium Profile Header Card with Banner & Overlapping Avatar */}
            <div className="relative border border-[var(--hairline)] rounded-3xl bg-[var(--bg)] shadow-md overflow-hidden">
              {/* Official Corporate / Collegiate Brand Banner */}
              <div className="relative w-full h-40 sm:h-52 overflow-hidden bg-zinc-950">
                <BrandBanner
                  customBannerUrl={mentor.bannerImageUrl}
                  bannerPosition={mentor.bannerPosition}
                  organization={mentor.company || mentor.institutionName}
                  institutionType={mentor.institutionType}
                />
              </div>

              {/* Overlapping Avatar + Quick Action Bar */}
              <div className="px-5 sm:px-8 pb-6 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                  {/* Circular Overlapping Avatar */}
                  <div className="relative shrink-0">
                    <Avatar
                      name={mentor.displayName}
                      url={mentor.avatar || mentor.user?.avatar}
                      size="custom"
                      className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-[var(--bg)] shadow-xl object-cover bg-zinc-900"
                    />
                    {mentor.isOnline && (
                      <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-[var(--bg)] animate-pulse" />
                    )}
                  </div>

                  {/* Actions Group */}
                  <div className="flex flex-wrap items-center gap-2 sm:self-end">

                    <Link
                      href={`/dashboard/chat?mentorId=${mentor.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-[var(--fg)]/5 border border-[var(--hairline)] px-3.5 py-2 text-xs font-bold hover:bg-[var(--fg)]/10 transition-colors text-[var(--fg)]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Message
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsShareOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--hairline)] px-3.5 py-2 text-xs font-bold hover:bg-[var(--fg)]/5 transition-colors cursor-pointer text-[var(--fg)]"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </button>

                    {mentor.linkedinUrl && (
                      <a
                        href={mentor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-8 w-8 rounded-xl border border-[var(--hairline)] hover:bg-[var(--fg)]/5 text-[var(--fg)] transition-colors"
                        title="LinkedIn profile"
                      >
                        <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Name, Headline, Org Badge, Social Metrics */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--fg)]">
                      {mentor.displayName}
                    </h1>
                    <GoldenVerifiedBadge size={22} className="h-5 w-5" />
                    {mentor.isOnline ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fg)]/5 text-[var(--muted)] px-2.5 py-0.5 text-[10px] font-medium border border-[var(--hairline)]">
                        Offline
                      </span>
                    )}
                    {mentor.rating >= 4.8 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
                        <Award className="h-3 w-3" />
                        Top Mentor
                      </span>
                    )}
                  </div>

                  {/* Professional Headline */}
                  {(mentor.headline || mentor.currentRole) && (
                    <p className="text-sm sm:text-base font-semibold text-[var(--fg)]/90 leading-snug">
                      {mentor.headline || mentor.currentRole}
                    </p>
                  )}

                  {/* Organization Branding Badge */}
                  {(mentor.companyBranding || mentor.universityBranding || mentor.company || mentor.institutionName) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {mentor.companyBranding ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--fg)]/[0.03]">
                          <OrganizationLogo branding={mentor.companyBranding} size="sm" />
                          <div className="text-xs">
                            <span className="font-semibold text-[var(--fg)]">{mentor.companyBranding.name}</span>
                            {mentor.currentRole && (
                              <span className="text-[var(--muted)] font-normal ml-1.5">· {mentor.currentRole}</span>
                            )}
                          </div>
                        </div>
                      ) : mentor.company ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--fg)]/[0.03] text-xs font-semibold text-[var(--fg)]">
                          <Briefcase className="h-3.5 w-3.5 text-[var(--muted)]" />
                          <span>{mentor.company}</span>
                        </div>
                      ) : null}

                      {mentor.universityBranding && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--hairline)] bg-[var(--fg)]/[0.03]">
                          <OrganizationLogo branding={mentor.universityBranding} size="sm" />
                          <span className="text-xs font-semibold text-[var(--fg)]">{mentor.universityBranding.name}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {mentor.location && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)] pt-2 border-t border-[var(--hairline)]/60 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[var(--muted)]" />
                        <span>{mentor.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 border border-[var(--hairline)] rounded-2xl p-5 bg-[var(--bg)] shadow-sm my-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--fg)]">From</div>
                <div className="text-sm font-bold mt-1 text-[var(--fg)]">{mentor.location || "Not specified"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--fg)]">Member Since</div>
                <div className="text-sm font-bold mt-1 text-[var(--fg)]">
                  {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recent"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--fg)]">Response time</div>
                <div className="text-sm font-bold mt-1 text-[var(--fg)]">{mentor.averageResponseTime || "Not specified"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--fg)]">Sessions Completed</div>
                <div className="text-sm font-bold mt-1 text-[var(--fg)]">{mentor.totalSessions || 0} sessions</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--fg)]">Experience</div>
                <div className="text-sm font-bold mt-1 text-[var(--fg)]">{mentor.experienceYears ? `${mentor.experienceYears}+ Years` : "Not specified"}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--fg)]">Languages</div>
                <div className="text-sm font-bold mt-1 text-[var(--fg)] truncate" title={Array.isArray(mentor.languages) ? mentor.languages.join(", ") : mentor.languages || "English"}>
                  {Array.isArray(mentor.languages) ? mentor.languages.join(", ") : mentor.languages || "English"}
                </div>
              </div>
            </div>

            {/* Languages Spoken (Section 11) */}
            {((mentor.user?.languages && mentor.user.languages.length > 0) || (Array.isArray(mentor.languages) && mentor.languages.length > 0)) && (
              <div className="rounded-2xl border border-[var(--hairline)] p-5 bg-[var(--bg)] shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-[var(--fg)]">
                    Languages Spoken
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mentor.user?.languages && mentor.user.languages.length > 0
                    ? mentor.user.languages.map((l: any) => (
                        <div
                          key={l.id || l.languageName}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--hairline)] bg-[var(--fg)]/[0.04] text-[var(--fg)]"
                        >
                          <span className="font-semibold">{l.languageName}</span>
                          <span className="text-[10px] text-[var(--muted)]">· {l.proficiency}</span>
                        </div>
                      ))
                    : Array.isArray(mentor.languages)
                    ? mentor.languages.map((lang: string) => (
                        <div
                          key={lang}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--hairline)] bg-[var(--fg)]/[0.04] text-[var(--fg)]"
                        >
                          <span className="font-semibold">{lang}</span>
                          <span className="text-[10px] text-[var(--muted)]">· Fluent</span>
                        </div>
                      ))
                    : null}
                </div>
              </div>
            )}

            {/* Bio */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[10px] uppercase tracking-[0.22em] font-extrabold text-[var(--fg)]">
                About
              </h2>
              <p className="text-base text-[var(--fg)]/90 leading-relaxed whitespace-pre-line font-sans">
                {mentor.bio}
              </p>
            </div>

            {/* Expertise */}
            {mentor.expertise.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[10px] uppercase tracking-[0.22em] font-extrabold text-[var(--fg)]">
                  Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[var(--fg)]/5 border border-[var(--hairline)] text-[var(--fg)]"
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
                className="inline-flex items-center gap-2 text-sm text-[var(--fg)] hover:text-[var(--fg)] transition-colors font-bold mb-4 block w-fit"
              >
                <ExternalLink className="h-4 w-4" />
                LinkedIn Profile
              </a>
            )}

            {/* Reviews Section */}
            <div className="flex flex-col gap-6 pt-8 border-t border-[var(--hairline)] mt-6">
              <h2 className="text-[10px] uppercase tracking-[0.22em] font-extrabold text-[var(--fg)]">
                Student Reviews ({reviewData?.total ?? 0})
              </h2>

              {/* Rating Stats Display */}
              {reviewData && (reviewData.total ?? 0) > 0 && (
                <MentorRatingStatsDisplay
                  stats={{
                    avgRating: mentor.rating,
                    totalReviews: reviewData.total,
                    distribution: mentor.ratingDistribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
                  }}
                />
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Skeleton className="h-32 rounded-2xl" />
                  <Skeleton className="h-32 rounded-2xl" />
                </div>
              ) : uniqueReviews.length > 0 ? (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    {uniqueReviews.map((rev: any) => (
                      <ReviewCard key={rev.id} review={rev} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {reviewData && reviewData.totalPages > 1 && (
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      {Array.from({ length: reviewData.totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setReviewPage(i + 1)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${reviewPage === i + 1
                              ? "bg-[var(--bg)] text-[var(--fg)] border-[var(--hairline)]"
                              : "bg-[var(--bg)] text-[var(--fg)] border-[var(--hairline)] hover:bg-[var(--fg)]/5"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<Star className="h-6 w-6 text-[var(--fg)]" />}
                  title="No reviews yet"
                  description="This mentor has not received any session reviews yet."
                />
              )}
            </div>

          </div>

          {/* ─── Right: Booking Card ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-[var(--hairline)] p-6 flex flex-col gap-5 bg-[var(--bg)] shadow-lg">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-black text-[var(--fg)]">
                  <PriceDisplay amountInPaise={mentor.pricePerSession} />
                </span>
                <span className="text-xs text-[var(--fg)] font-semibold">
                  / {mentor.sessionDuration} min
                </span>
              </div>

              <div
                aria-hidden
                className="h-px w-full bg-[var(--hairline)]"
              />

              <ul className="flex flex-col gap-3 text-sm text-[var(--fg)]/85 font-medium">
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg)]" />
                  1-on-1 video call
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg)]" />
                  Google Meet link
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg)]" />
                  Notes & follow-up
                </li>
              </ul>

              <Link
                href={`/book/${mentor.id}`}
                className="text-center rounded-xl bg-[var(--fg)] text-[var(--bg)] px-7 py-3.5 text-sm font-bold hover:opacity-90 active:scale-97 transition-all cursor-pointer shadow-sm"
              >
                Book a session
              </Link>

              <Link
                href={`/dashboard/chat?mentorId=${mentor.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--fg)]/5 border border-[var(--hairline)] px-7 py-3.5 text-sm font-bold hover:bg-[var(--fg)]/10 transition-colors text-center text-[var(--fg)] cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                Chat first
              </Link>

              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-[var(--hairline)] px-7 py-3.5 text-sm font-bold hover:bg-[var(--fg)]/5 transition-colors cursor-pointer text-[var(--fg)]"
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
    </motion.div>
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
          icon: Bot,
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
          icon: Bot,
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
          icon: Bot,
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
    <div className="landing-page min-h-screen flex flex-col" style={{ background: "#0B0B0C" }}>
      <div
        className="relative z-10 flex-1 rounded-b-[40px] md:rounded-b-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border-b border-[var(--hairline)] overflow-hidden flex flex-col bg-[var(--bg)]"
      >
        <Navbar />
        <main className="flex-1">{content}</main>
      </div>
      <div className="sticky bottom-0 z-0">
        <FooterSection />
      </div>
    </div>
  );
}
