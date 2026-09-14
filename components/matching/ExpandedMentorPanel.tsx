"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import {
  X,
  Star,
  MapPin,
  Clock,
  Globe,
  Briefcase,
  GraduationCap,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Award,
  Zap,
  Video,
  MessageSquare,
  Target,
  FileText,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { AIMatchScore } from "./AIMatchScore";
import type { ScoredMentor } from "./useSwipeEngine";
import { PriceDisplay } from "@/components/PriceDisplay";

interface ExpandedMentorPanelProps {
  mentor: ScoredMentor | null;
  onClose: () => void;
  isInterested?: boolean;
  onSwipeAction?: (action: "skip" | "interested" | "priority") => void;
  onAction?: (actionType: string) => void;
}

const SESSION_TYPES = [
  { icon: Video, label: "1-on-1 Video Call", desc: "Live consultation & strategy" },
  { icon: MessageSquare, label: "Chat Consultation", desc: "Asynchronous Q&A" },
  { icon: Target, label: "Career Roadmap", desc: "Goal setting & planning" },
  { icon: Zap, label: "Interview Mock Prep", desc: "Real questions & live feedback" },
  { icon: FileText, label: "Resume & Portfolio", desc: "Detailed line-by-line review" },
];

function InfoChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--fg)]/5 border border-[var(--hairline)] text-[var(--fg)] shadow-xs">
      <Icon className="h-3.5 w-3.5 text-[var(--fg)]/60" />
      <span>{label}</span>
    </div>
  );
}

function ReviewCard({
  review,
}: {
  review: {
    userName?: string | null;
    rating: number;
    comment?: string | null;
    createdAt: string;
  };
}) {
  return (
    <div className="flex-shrink-0 w-72 p-4 rounded-2xl bg-[var(--fg)]/4 border border-[var(--hairline)] flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {(review.userName || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--fg)] truncate">{review.userName || "Mentee"}</p>
            <p className="text-[10px] text-[var(--fg)]/60">Verified Session</p>
          </div>
          <div className="ml-auto flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3"
                style={{
                  fill: i < review.rating ? "#f59e0b" : "none",
                  stroke: i < review.rating ? "#f59e0b" : "var(--muted)",
                }}
              />
            ))}
          </div>
        </div>
        {review.comment && (
          <p className="text-xs text-[var(--fg)]/85 leading-relaxed line-clamp-3 italic">
            &ldquo;{review.comment}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

export function ExpandedMentorPanel({
  mentor,
  onClose,
  isInterested = false,
  onSwipeAction,
  onAction,
}: ExpandedMentorPanelProps) {
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = mentor?.avatar || mentor?.user?.avatar;
  const displayName = mentor?.displayName || mentor?.user?.name || "Mentor";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setAvatarError(false);
  }, [mentor]);

  const languages: string[] = Array.isArray(mentor?.languages)
    ? mentor.languages
    : typeof mentor?.languages === "string"
    ? mentor.languages.split(",").map((l) => l.trim())
    : [];

  const reviews = mentor?.reviews ?? [];

  const uniquePanelReviews = useMemo(() => {
    const seen = new Set<string>();
    return reviews.filter((r: any) => {
      const name = r.userName || r.user?.name || "Mentee";
      const key = r.id || r.comment || `${name}-${r.createdAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [reviews]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {mentor && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
          />

          {/* Slide-over Drawer / Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:bottom-3 rounded-t-3xl md:rounded-3xl z-50 max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl border-t md:border border-[var(--hairline)] will-change-transform"
            style={{
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          >
            {/* Grab Handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 z-20 bg-[var(--fg)]/90 backdrop-blur-md cursor-grab active:cursor-grabbing">
              <div className="h-1.5 w-12 rounded-full bg-[var(--fg)]/25" />
            </div>

            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-2 sticky top-5 z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]/60 flex items-center gap-1.5">
                  {isInterested && <Heart className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />}
                  {isInterested ? "Liked Profile" : "Mentor Details"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--fg)]/8 hover:bg-[var(--fg)]/15 transition-colors cursor-pointer text-[var(--fg)]"
                >
                  <span>Next Mentor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-[var(--fg)]/8 hover:bg-[var(--fg)]/15 transition-colors cursor-pointer text-[var(--fg)]"
                  aria-label="Close mentor preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-6 pt-2 pb-32 flex flex-col gap-5">
              {/* Liked Banner if opened via interested swipe */}
              {isInterested && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/20">
                    <Heart className="h-4 w-4 fill-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      Saved to your Interested List!
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Explore availability below or book an introductory session.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Hero Banner with Avatar */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--fg)]/3 border border-[var(--hairline)]">
                <div className="relative flex-shrink-0">
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-20 w-20 rounded-2xl object-cover border border-[var(--hairline)] shadow-md"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold font-display shrink-0 shadow-inner"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 8%, transparent)",
                        color: "var(--fg)",
                        border: "1px solid var(--hairline)",
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  {mentor.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[var(--bg)] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black font-display text-[var(--fg)] leading-tight">
                      {mentor.displayName}
                    </h2>
                    <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    {mentor.rating >= 4.8 && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Award className="h-3 w-3" />
                        Top Mentor
                      </span>
                    )}
                  </div>
                  {mentor.currentRole && (
                    <p className="text-xs sm:text-sm text-[var(--fg)]/80 mt-1 font-medium">
                      {mentor.currentRole}
                      {mentor.institutionName && (
                        <span className="font-bold text-[var(--fg)]"> @ {mentor.institutionName}</span>
                      )}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-[var(--fg)]">
                        {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}
                      </span>
                      {mentor.totalSessions > 0 && (
                        <span className="text-[var(--fg)]/60">({mentor.totalSessions} sessions)</span>
                      )}
                    </div>
                    {mentor.experienceYears !== undefined && (
                      <span className="text-[var(--fg)]/60">• {mentor.experienceYears}y exp</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Key Metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--fg)]/4 border border-[var(--hairline)] text-center">
                <div>
                  <p className="text-lg sm:text-xl font-black font-display text-[var(--fg)]">
                    {mentor.pricePerSession === 0 ? (
                      <span className="text-emerald-500">Free</span>
                    ) : (
                      <PriceDisplay amountInPaise={mentor.pricePerSession} />
                    )}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--fg)]/60 mt-0.5">
                    per session
                  </p>
                </div>
                <div className="border-x border-[var(--hairline)]">
                  <p className="text-lg sm:text-xl font-black font-display text-[var(--fg)]">
                    {mentor.totalSessions}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--fg)]/60 mt-0.5">
                    sessions
                  </p>
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-[var(--fg)]">
                    {mentor.averageResponseTime || "Fast"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--fg)]/60 mt-0.5">
                    response
                  </p>
                </div>
              </div>

              {/* AI Match Breakdown Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20">
                <AIMatchScore score={mentor.matchScore} reasons={mentor.matchReasons} />
              </div>

              {/* Bio / About */}
              {mentor.bio && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--fg)]/60 mb-2">
                    About Mentor
                  </p>
                  <p className="text-sm text-[var(--fg)]/85 leading-relaxed bg-[var(--fg)]/3 p-4 rounded-2xl border border-[var(--hairline)]">
                    {mentor.bio}
                  </p>
                </div>
              )}

              {/* Expertise Skills */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--fg)]/60 mb-2">
                    Skills & Areas of Expertise
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--fg)]/5 text-[var(--fg)] border border-[var(--hairline)] shadow-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Types Provided */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--fg)]/60 mb-2">
                  Session Formats Available
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SESSION_TYPES.map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--fg)]/3 border border-[var(--hairline)]"
                    >
                      <Icon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-[var(--fg)]">{label}</p>
                        <p className="text-[10px] text-[var(--fg)]/60">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Chips */}
              <div className="flex flex-wrap gap-2">
                {mentor.location && <InfoChip icon={MapPin} label={mentor.location} />}
                {mentor.averageResponseTime && (
                  <InfoChip icon={Clock} label={`Replies: ${mentor.averageResponseTime}`} />
                )}
                {languages.length > 0 && (
                  <InfoChip icon={Globe} label={`Speaks ${languages.join(", ")}`} />
                )}
                {mentor.experienceYears !== undefined && (
                  <InfoChip icon={Briefcase} label={`${mentor.experienceYears} Years Experience`} />
                )}
                {mentor.institutionType && (
                  <InfoChip icon={GraduationCap} label={mentor.institutionType} />
                )}
              </div>

              {/* Mentee Reviews */}
              {uniquePanelReviews.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--fg)]/60 mb-2.5">
                    Recent Mentee Feedback ({uniquePanelReviews.length})
                  </p>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {uniquePanelReviews.slice(0, 5).map((rev: any) => {
                      const mappedRev = {
                        ...rev,
                        userName: rev.userName || rev.user?.name || "Mentee",
                      };
                      return (
                        <ReviewCard
                          key={rev.id || rev.comment || `${mappedRev.userName}-${rev.createdAt}`}
                          review={mappedRev}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LinkedIn & Socials */}
              {mentor.linkedinUrl && (
                <div className="flex items-center gap-3">
                  <a
                    href={mentor.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onAction?.("profile_opened")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-500 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                  >
                    <FaLinkedin className="h-4 w-4" />
                    <span>View LinkedIn Profile</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl px-6 py-4 flex items-center gap-3 border-t border-[var(--hairline)] bg-[var(--fg)]/95 backdrop-blur-md z-30">
              <Link
                href={`/book/${mentor.id}`}
                onClick={() => {
                  onAction?.("session_booked");
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-[var(--fg)] text-[var(--bg)] hover:opacity-90 active:scale-98 transition-all shadow-md"
              >
                <BookOpen className="h-4 w-4" />
                <span>Book 1-on-1 Session</span>
              </Link>

              <Link
                href={`/dashboard/chat?mentorId=${mentor.id}`}
                onClick={() => {
                  onAction?.("chat_opened");
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl font-bold text-xs bg-[var(--fg)]/5 border border-[var(--hairline)] text-[var(--fg)] hover:bg-[var(--fg)]/10 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Link>

              <Link
                href={`/mentors/${mentor.id}`}
                onClick={() => {
                  onAction?.("profile_opened");
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl font-bold text-xs bg-[var(--fg)]/5 border border-[var(--hairline)] text-[var(--fg)] hover:bg-[var(--fg)]/10 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
