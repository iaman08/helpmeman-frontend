"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ExternalLink, UserCheck, X, Clock, Flame, AlertCircle, Eye, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { MentorApplicationModal } from "@/components/MentorApplicationModal";
import type { Mentor } from "@/lib/types";

interface SLATimerProps {
  createdAt: string;
}

function Application24hTimer({ createdAt }: SLATimerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const createdTime = new Date(createdAt).getTime();
  const deadline = createdTime + 24 * 60 * 60 * 1000;
  const diffMs = deadline - now;
  const total24hMs = 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, now - createdTime);
  const percentElapsed = Math.min(100, Math.round((elapsedMs / total24hMs) * 100));

  if (diffMs <= 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
    const overdueMinutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
    const overdueSeconds = Math.floor((overdueMs % (1000 * 60)) / 1000);

    return (
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-red-500">
            <AlertCircle className="w-4 h-4 animate-bounce shrink-0" />
            24h SLA Breached
          </span>
          <span className="font-mono text-[11px] text-red-500 font-semibold">
            +{overdueHours}h {overdueMinutes}m {overdueSeconds}s
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-red-500/20 overflow-hidden">
          <div className="h-full bg-red-500 rounded-full w-full" />
        </div>
      </div>
    );
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secsLeft = Math.floor((diffMs % (1000 * 60)) / 1000);
  const isUrgent = hoursLeft < 6;

  return (
    <div className="flex flex-col gap-1.5 min-w-[200px]">
      <div className="flex items-center justify-between text-xs">
        <span
          className={`flex items-center gap-1.5 font-semibold ${
            isUrgent ? "text-amber-500" : "text-emerald-500 dark:text-emerald-400"
          }`}
        >
          {isUrgent ? (
            <Flame className="w-3.5 h-3.5 animate-pulse text-amber-500 shrink-0" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          )}
          {isUrgent ? "Urgent Review" : "24h SLA Timer"}
        </span>
        <span
          className={`font-mono text-[11px] font-semibold ${
            isUrgent ? "text-amber-500" : "text-stone-600 dark:text-zinc-300"
          }`}
        >
          {hoursLeft}h {minsLeft}m {secsLeft}s left
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? "bg-amber-500" : "bg-emerald-500"
          }`}
          style={{ width: `${percentElapsed}%` }}
        />
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    fetchPendingMentors();
  }, []);

  const fetchPendingMentors = () => {
    setLoading(true);
    api.get("/admin/mentors/pending")
      .then((res) => setMentors(res.data.mentors ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  async function approve(id: string) {
    setActionId(id);
    try {
      await api.post(`/admin/mentors/${id}/approve`);
      setMentors((prev) => prev.filter((m) => m.id !== id));
      if (selectedMentor?.id === id) setSelectedMentor(null);
    } catch {
      alert("Failed to approve mentor application");
    } finally {
      setActionId(null);
    }
  }

  async function reject(id: string, reasonOverride?: string) {
    const finalReason = reasonOverride || rejectReason;
    if (!finalReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActionId(id);
    try {
      await api.post(`/admin/mentors/${id}/reject`, { reason: finalReason.trim() });
      setMentors((prev) => prev.filter((m) => m.id !== id));
      setRejectId(null);
      setRejectReason("");
      if (selectedMentor?.id === id) setSelectedMentor(null);
    } catch {
      alert("Failed to decline application");
    } finally {
      setActionId(null);
    }
  }

  // SLA Summary Metrics
  const nowMs = Date.now();
  const overdueCount = mentors.filter(
    (m) => nowMs > new Date(m.createdAt).getTime() + 24 * 60 * 60 * 1000
  ).length;
  const urgentCount = mentors.filter((m) => {
    const diff = new Date(m.createdAt).getTime() + 24 * 60 * 60 * 1000 - nowMs;
    return diff > 0 && diff < 6 * 60 * 60 * 1000;
  }).length;
  const onTrackCount = mentors.length - overdueCount - urgentCount;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Approvals</p>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Pending mentors.</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Review candidate applications, Ruth AI onboarding transcripts, and credentials within the 24-hour response window.
          </p>
        </div>

        {/* SLA Status Bar */}
        {mentors.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-[var(--hairline)] bg-[var(--bg)] shadow-sm text-xs flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{onTrackCount} In SLA</span>
            </div>
            {urgentCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{urgentCount} Urgent (&lt;6h)</span>
              </div>
            )}
            {overdueCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{overdueCount} Overdue</span>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
        </div>
      ) : mentors.length > 0 ? (
        <div className="flex flex-col gap-4">
          {mentors.map((m) => {
            const displayName = m.displayName || m.user?.name || "Mentor";
            const initials = displayName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const expertise = Array.isArray(m.expertise) ? m.expertise : [];
            const answerCount = m.user?.mentorOnboarding?.answers?.length || 0;

            return (
              <div
                key={m.id}
                className="rounded-2xl p-6 flex flex-col gap-4 transition-all"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold shrink-0"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 8%, transparent)",
                        color: "var(--fg)",
                        border: "1px solid var(--hairline)",
                      }}
                    >
                      {m.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.avatar}
                          alt={displayName}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg" style={{ color: "var(--fg)" }}>{displayName}</h3>
                        {m.currentRole && (
                          <span className="text-xs" style={{ color: "var(--muted)" }}>
                            • {m.currentRole}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <InstitutionBadge institutionName={m.institutionName} institutionType={m.institutionType} />
                        {m.category && <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{m.category.name}</span>}
                        {answerCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                            <Sparkles className="h-3 w-3" /> {answerCount} AI answers
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>{m.institutionEmail || m.user?.email}</span>
                    {m.createdAt && (
                      <div className="mt-1">
                        <Application24hTimer createdAt={m.createdAt} />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
                  {m.bio || "No biography provided."}
                </p>

                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {expertise.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] rounded-lg px-2.5 py-1 font-medium"
                        style={{
                          background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                          color: "var(--muted)",
                          border: "1px solid var(--hairline)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-3" style={{ borderColor: "var(--hairline)" }}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMentor(m)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer hover:opacity-80"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 8%, transparent)",
                        color: "var(--fg)",
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-400" />
                      View Full Application
                    </button>

                    {m.linkedinUrl && (
                      <a
                        href={m.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                        style={{ color: "var(--muted)" }}
                      >
                        <ExternalLink className="h-3 w-3" /> LinkedIn
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectId(m.id)}
                      disabled={actionId === m.id}
                      className="flex items-center gap-1.5 rounded-xl bg-red-500/10 text-red-600 px-4 py-2 text-xs font-semibold hover:bg-red-500/20 cursor-pointer border border-red-500/20 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Decline Application
                    </button>
                    <button
                      type="button"
                      onClick={() => approve(m.id)}
                      disabled={actionId === m.id}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/10"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Accept & Send Welcome Email
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<UserCheck className="h-6 w-6" />} title="All caught up!" description="No pending mentor applications awaiting approval." />
      )}

      {/* Decline Reason Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border" style={{ background: "var(--bg)", borderColor: "var(--hairline)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--fg)]">Decline Mentor Application</h3>
              <button type="button" onClick={() => setRejectId(null)} className="text-[var(--muted)] hover:text-[var(--fg)] p-1 bg-transparent border-none cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Provide specific feedback or reason for declining. An email notification will be sent to the applicant with instructions on how to re-apply if appropriate.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please verify your LinkedIn link, complete expertise tags, or update institution credentials..."
              className="w-full rounded-xl p-3 text-sm outline-none resize-none"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--fg)" }}
            />
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={() => setRejectId(null)} className="px-4 py-2 text-xs font-semibold rounded-xl text-[var(--fg)] border border-[var(--hairline)] bg-transparent cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={() => reject(rejectId)} disabled={actionId === rejectId} className="px-5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white cursor-pointer disabled:opacity-50">
                {actionId === rejectId ? "Sending..." : "Confirm Decline & Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Application Detail Modal */}
      {selectedMentor && (
        <MentorApplicationModal
          mentor={selectedMentor}
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onApprove={(id) => approve(id)}
          onReject={(id, reason) => reject(id, reason)}
        />
      )}
    </div>
  );
}

