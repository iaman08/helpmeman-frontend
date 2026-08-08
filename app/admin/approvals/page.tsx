"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ExternalLink, UserCheck } from "lucide-react";
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
    api.get("/admin/mentors/pending")
      .then((res) => setMentors(res.data.mentors ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function approve(id: string) {
    setActionId(id);
    try {
      await api.post(`/admin/mentors/${id}/approve`);
      setMentors((prev) => prev.filter((m) => m.id !== id));
    } catch { alert("Failed"); }
    finally { setActionId(null); }
  }

  async function reject(id: string) {
    setActionId(id);
    try {
      await api.post(`/admin/mentors/${id}/reject`, { reason: rejectReason });
      setMentors((prev) => prev.filter((m) => m.id !== id));
      setRejectId(null);
      setRejectReason("");
    } catch { alert("Failed"); }
    finally { setActionId(null); }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Approvals</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Pending mentors.</h1>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : mentors.length > 0 ? (
        <div className="flex flex-col gap-4">
          {mentors.map((m) => (
            <div key={m.id} className="rounded-2xl p-6 flex flex-col gap-4"
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
                      {m.category && <span className="text-xs" style={{ color: "var(--muted)" }}>{m.category.name}</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{m.institutionEmail}</span>
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
                  <ExternalLink className="h-3 w-3" /> LinkedIn
                </a>
              )}

              {rejectId === m.id ? (
                <div className="flex gap-2 items-end">
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..." rows={2}
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)", border: "1px solid var(--hairline)" }} />
                  <button type="button" onClick={() => reject(m.id)} disabled={actionId === m.id}
                    className="rounded-full bg-red-500 text-white px-4 py-2 text-xs cursor-pointer disabled:opacity-50">
                    Reject
                  </button>
                  <button type="button" onClick={() => setRejectId(null)}
                    className="rounded-full px-4 py-2 text-xs cursor-pointer"
                    style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--fg)" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={() => approve(m.id)} disabled={actionId === m.id}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-5 py-2.5 text-xs hover:opacity-90 cursor-pointer disabled:opacity-50">
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button type="button" onClick={() => setRejectId(m.id)}
                    className="flex items-center gap-1.5 rounded-full bg-red-500/10 text-red-600 px-5 py-2.5 text-xs hover:bg-red-500/20 cursor-pointer">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<UserCheck className="h-6 w-6" />} title="All caught up!" description="No pending mentor applications." />
      )}
    </div>
  );
}
