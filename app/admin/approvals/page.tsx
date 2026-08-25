"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ExternalLink, UserCheck, Eye, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { MentorApplicationModal } from "@/components/MentorApplicationModal";
import type { Mentor } from "@/lib/types";

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
      alert("Failed to approve mentor");
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
      alert("Failed to reject mentor");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Approvals</p>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Pending mentors.</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Review candidate applications, AI onboarding questionnaires, and credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {mentors.length} Pending Application{mentors.length !== 1 ? "s" : ""}
          </span>
        </div>
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
                        {m.category && <span className="text-xs" style={{ color: "var(--muted)" }}>{m.category.name}</span>}
                        {answerCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                            <Sparkles className="h-3 w-3" /> {answerCount} AI answers
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>{m.institutionEmail || m.user?.email}</span>
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

                  {rejectId === m.id ? (
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="flex-1 sm:w-64 rounded-xl px-3 py-2 text-xs outline-none"
                        style={{
                          background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                          color: "var(--fg)",
                          border: "1px solid var(--hairline)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => reject(m.id)}
                        disabled={actionId === m.id || !rejectReason.trim()}
                        className="rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRejectId(null); setRejectReason(""); }}
                        className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
                        style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectId(m.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-red-500/10 text-red-600 px-4 py-2 text-xs font-semibold hover:bg-red-500/20 cursor-pointer transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(m.id)}
                        disabled={actionId === m.id}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/10"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<UserCheck className="h-6 w-6" />} title="All caught up!" description="No pending mentor applications." />
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

