"use client";

import { motion, AnimatePresence } from "motion/react";
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
  MessageCircle,
  Share2,
  Flag,
  CheckCircle2,
  Award,
  Zap,
  Video,
  MessageSquare,
  Target,
  FileText,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import { AIMatchScore } from "./AIMatchScore";
import type { ScoredMentor } from "./useSwipeEngine";
import { PriceDisplay } from "@/components/PriceDisplay";

interface ExpandedMentorPanelProps {
  mentor: ScoredMentor | null;
  onClose: () => void;
  onAction?: (actionType: string) => void;
}

const SESSION_TYPES = [
  { icon: Video, label: "Video Call" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Target, label: "Career Guidance" },
  { icon: Zap, label: "Interview Prep" },
  { icon: FileText, label: "Resume Review" },
];

function InfoChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/60"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <Icon className="h-3 w-3 text-white/40" />
      {label}
    </div>
  );
}

function ReviewCard({ review }: { review: { userName?: string | null; rating: number; comment?: string | null; createdAt: string } }) {
  return (
    <div
      className="flex-shrink-0 w-64 p-4 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
          {(review.userName || "U").charAt(0).toUpperCase()}
        </div>
        <span className="text-xs font-medium text-white/70">{review.userName || "Mentee"}</span>
        <div className="ml-auto flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-2.5 w-2.5"
              style={{ fill: i < review.rating ? "#f59e0b" : "none", stroke: i < review.rating ? "#f59e0b" : "#4b5563" }}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{review.comment}</p>
      )}
    </div>
  );
}

export function ExpandedMentorPanel({ mentor, onClose, onAction }: ExpandedMentorPanelProps) {
  if (!mentor) return null;

  const languages: string[] = Array.isArray(mentor.languages)
    ? mentor.languages
    : typeof mentor.languages === "string"
    ? mentor.languages.split(",").map((l) => l.trim())
    : [];

  const reviews = mentor.reviews ?? [];

  return (
    <AnimatePresence>
      {mentor && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-40 max-h-[92vh] overflow-y-auto no-scrollbar"
            style={{
              background: "linear-gradient(180deg, #141414 0%, #0d0d0d 100%)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1.5rem 1.5rem 0 0",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 z-10"
              style={{ background: "linear-gradient(180deg, #141414 80%, transparent)" }}>
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            {/* Close */}
            <div className="flex justify-end px-5 pb-2 sticky top-5 z-10">
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer backdrop-blur-sm"
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
            </div>

            <div className="px-5 pb-32 -mt-12">
              {/* Hero */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={mentor.avatar || `https://i.pravatar.cc/300?u=${mentor.id}`}
                    alt={mentor.displayName}
                    className="h-20 w-20 rounded-2xl object-cover"
                    style={{ border: "2px solid rgba(255,255,255,0.1)" }}
                  />
                  {mentor.isOnline && (
                    <div
                      className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#141414]"
                      style={{ background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-white leading-tight">{mentor.displayName}</h2>
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    {mentor.rating >= 4.8 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
                        <Award className="h-2.5 w-2.5" />
                        Top Mentor
                      </span>
                    )}
                  </div>
                  {mentor.currentRole && (
                    <p className="text-sm text-white/60 mt-0.5 truncate">{mentor.currentRole}</p>
                  )}
                  {mentor.institutionName && (
                    <p className="text-xs text-indigo-400/80 mt-0.5 truncate">{mentor.institutionName}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-white">{mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}</span>
                      {mentor.totalSessions > 0 && (
                        <span className="text-xs text-white/35">({mentor.totalSessions} sessions)</span>
                      )}
                    </div>
                    {mentor.experienceYears && (
                      <span className="text-xs text-white/40">• {mentor.experienceYears}yr exp</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price + Quick stats */}
              <div
                className="grid grid-cols-3 gap-3 p-4 rounded-2xl mb-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="text-center">
                  <p className="text-lg font-black text-white">
                    <PriceDisplay amountInPaise={mentor.pricePerSession} />
                  </p>
                  <p className="text-[10px] text-white/35 mt-0.5">per session</p>
                </div>
                <div className="text-center border-x border-white/8">
                  <p className="text-lg font-black text-white">{mentor.totalSessions}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{mentor.averageResponseTime || "–"}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">response</p>
                </div>
              </div>

              {/* AI Match Score */}
              <div
                className="p-4 rounded-2xl mb-5"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06))",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <AIMatchScore score={mentor.matchScore} reasons={mentor.matchReasons} />
                <div className="mt-3 p-3 rounded-xl text-xs text-white/50 leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-indigo-400 font-semibold">✦ Why this mentor? </span>
                  Based on your profile, career goals, preferred learning style and budget, this mentor has a high compatibility rating with you.
                </div>
              </div>

              {/* About */}
              {mentor.bio && (
                <Section title="About">
                  <p className="text-sm text-white/55 leading-relaxed">{mentor.bio}</p>
                </Section>
              )}

              {/* Skills / Expertise */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <Section title="Skills & Expertise">
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full text-xs font-medium text-indigo-300"
                        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Session types */}
              <Section title="Session Types">
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_TYPES.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-xs text-white/60"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <Icon className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Quick info chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {mentor.location && <InfoChip icon={MapPin} label={mentor.location} />}
                {mentor.averageResponseTime && <InfoChip icon={Clock} label={mentor.averageResponseTime} />}
                {languages.length > 0 && (
                  <InfoChip icon={Globe} label={languages.slice(0, 2).join(" • ")} />
                )}
                {mentor.experienceYears && (
                  <InfoChip icon={Briefcase} label={`${mentor.experienceYears} years exp`} />
                )}
                {mentor.institutionType && (
                  <InfoChip icon={GraduationCap} label={mentor.institutionType} />
                )}
              </div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <Section title={`Reviews (${reviews.length})`}>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {reviews.slice(0, 5).map((rev) => (
                      <ReviewCard key={rev.id} review={rev} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Links */}
              {(mentor.linkedinUrl) && (
                <Section title="Connect">
                  <div className="flex flex-wrap gap-2">
                    {mentor.linkedinUrl && (
                      <a
                        href={mentor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onAction?.("profile_opened")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                        style={{ border: "1px solid rgba(59,130,246,0.25)" }}
                      >
                        <FaLinkedin className="h-3.5 w-3.5" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    )}
                  </div>
                </Section>
              )}
            </div>

            {/* Sticky CTA */}
            <div
              className="fixed bottom-0 left-0 right-0 z-50 px-5 py-4 flex gap-3"
              style={{
                background: "linear-gradient(0deg, #0d0d0d 70%, transparent)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Link
                href={`/book/${mentor.id}`}
                onClick={() => onAction?.("session_booked")}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-black transition-all hover:opacity-90 active:scale-97"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <BookOpen className="h-4 w-4 text-white" />
                <span className="text-white">Book Session</span>
              </Link>
              <Link
                href={`/mentors/${mentor.id}`}
                onClick={() => onAction?.("profile_opened")}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:bg-white/8"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <ExternalLink className="h-4 w-4" />
                Profile
              </Link>
              <button
                type="button"
                onClick={() => onAction?.("share_clicked")}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm text-white/50 hover:text-white transition-all hover:bg-white/5 cursor-pointer"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-2.5">{title}</p>
      {children}
    </div>
  );
}
