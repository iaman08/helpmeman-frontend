"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ExternalLink, UserCheck, AlertTriangle, X } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import type { Mentor } from "@/lib/types";

export default function ApprovalsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = () => {
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
    } catch { alert("Failed to approve application"); }
    finally { setActionId(null); }
  }

  async function reject(id: string) {
    setActionId(id);
    try {
      await api.post(`/admin/mentors/${id}/reject`, { reason: rejectReason });
      setMentors((prev) => prev.filter((m) => m.id !== id));
      setRejectId(null);
      setRejectReason("");
    } catch { alert("Failed to decline application"); }
    finally { setActionId(null); }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Approvals</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Pending mentors.</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Review applications, accept to activate profiles, or decline with feedback.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : mentors.length > 0 ? (
        <div className="flex flex-col gap-4">
          {mentors.map((m) => (
            <div key={m.id} className="rounded-2xl p-6 flex flex-col gap-4 border transition-all"
              style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold shrink-0"
                    style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)", color: "var(--fg)" }}>
                    {m.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg" style={{ color: "var(--fg)" }}>{m.displayName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <InstitutionBadge institutionName={m.institutionName} institutionType={m.institutionType} />
                      {m.category && <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{m.category.name}</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>{m.user?.email || m.institutionEmail}</span>
              </div>

              <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--muted)" }}>{m.bio}</p>

              <div className="flex flex-wrap gap-1.5">
                {m.expertise.map((tag) => (
                  <span key={tag} className="text-[11px] rounded-full px-2.5 py-0.5"
                    style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--muted)" }}>
                    {tag}
                  </span>
                ))}
              </div>

              {m.linkedinUrl && (
                <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                  style={{ color: "var(--muted)" }}>
                  <ExternalLink className="h-3 w-3" /> LinkedIn Profile
                </a>
              )}

              <div className="flex gap-2 pt-2 border-t border-[var(--hairline)]">
                <button type="button" onClick={() => approve(m.id)} disabled={actionId === m.id}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 text-white px-5 py-2.5 text-xs font-semibold hover:bg-emerald-600 cursor-pointer disabled:opacity-50 transition-colors shadow-sm">
                  <CheckCircle className="h-4 w-4" /> Accept & Send Welcome Email
                </button>
                <button type="button" onClick={() => setRejectId(m.id)} disabled={actionId === m.id}
                  className="flex items-center gap-1.5 rounded-xl bg-red-500/10 text-red-600 px-5 py-2.5 text-xs font-semibold hover:bg-red-500/20 cursor-pointer border border-red-500/20 transition-colors">
                  <XCircle className="h-4 w-4" /> Decline Application
                </button>
              </div>
            </div>
          ))}
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
    </div>
  );
}
