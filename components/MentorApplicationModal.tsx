"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  ExternalLink,
  Building2,
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Award,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { StatusBadge } from "@/components/StatusBadge";
import api from "@/lib/api";
import type { Mentor } from "@/lib/types";

interface Props {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string, reason: string) => Promise<void> | void;
}

export function MentorApplicationModal({
  mentor,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [activeTab, setActiveTab] = useState<"answers" | "profile" | "ai" | "docs">("answers");
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !mentor) return null;

  const displayName = mentor.displayName || mentor.user?.name || "Mentor";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userProfile = mentor.user?.mentorProfile;
  const userOnboarding = mentor.user?.mentorOnboarding;
  const answers = userOnboarding?.answers || [];
  const docs = mentor.verificationDocs || [];
  const expertise = Array.isArray(mentor.expertise) ? mentor.expertise : [];

  const handleApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve ${displayName}?`)) return;
    setActionLoading(true);
    try {
      if (onApprove) {
        await onApprove(mentor.id);
      } else {
        await api.post(`/admin/mentors/${mentor.id}/approve`);
      }
      onClose();
    } catch {
      alert("Failed to approve mentor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      if (onReject) {
        await onReject(mentor.id, rejectReason.trim());
      } else {
        await api.post(`/admin/mentors/${mentor.id}/reject`, { reason: rejectReason.trim() });
      }
      setRejecting(false);
      setRejectReason("");
      onClose();
    } catch {
      alert("Failed to reject mentor");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline)",
          color: "var(--fg)",
        }}
      >
        {/* Header */}
        <div
          className="p-6 flex items-start justify-between gap-4 border-b shrink-0"
          style={{
            borderColor: "var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold shrink-0 shadow-inner"
              style={{
                background: "color-mix(in srgb, var(--fg) 8%, transparent)",
                color: "var(--fg)",
                border: "1px solid var(--hairline)",
              }}
            >
              {mentor.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mentor.avatar}
                  alt={displayName}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold font-display" style={{ color: "var(--fg)" }}>
                  {displayName}
                </h2>
                <StatusBadge status={mentor.approvalStatus} />
                {mentor.isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--muted)" }}>
                {mentor.user?.name && mentor.user.name !== displayName && (
                  <span>Account: {mentor.user.name}</span>
                )}
                <span>{mentor.institutionEmail || mentor.user?.email}</span>
                {mentor.category && (
                  <span className="px-2 py-0.5 rounded-md" style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)" }}>
                    {mentor.category.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:opacity-70 cursor-pointer"
            style={{
              background: "color-mix(in srgb, var(--fg) 5%, transparent)",
              color: "var(--muted)",
            }}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex border-b px-6 gap-2 text-xs font-semibold overflow-x-auto shrink-0"
          style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}
        >
          <button
            onClick={() => setActiveTab("answers")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "answers"
                ? "border-amber-500 text-amber-500 font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Application Q&A ({answers.length})
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "border-amber-500 text-amber-500 font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Professional Details
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "ai"
                ? "border-amber-500 text-amber-500 font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Profile & Synthesis
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "docs"
                ? "border-amber-500 text-amber-500 font-bold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Verification Docs ({docs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Tab 1: Application Q&A */}
          {activeTab === "answers" && (
            <div className="flex flex-col gap-4">
              <div
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Onboarding completed with Ruth AI assistant</span>
                </div>
                <span className="text-xs font-semibold">
                  {userOnboarding?.completed ? "Completed 100%" : "In Progress"}
                </span>
              </div>

              {answers.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {answers.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl flex flex-col gap-2 transition-all"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                        border: "1px solid var(--hairline)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500">
                          {item.questionKey?.replace(/_/g, " ") || `Question ${idx + 1}`}
                        </span>
                        {item.skipped && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            Skipped
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                        {item.question || "Ruth AI Prompt"}
                      </p>
                      <div
                        className="p-3 rounded-lg text-sm leading-relaxed"
                        style={{
                          background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                          color: "var(--fg)",
                        }}
                      >
                        {item.answer || <span className="italic text-zinc-500">No answer provided</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="p-8 text-center rounded-2xl flex flex-col items-center gap-2"
                  style={{
                    border: "1px dashed var(--hairline)",
                    color: "var(--muted)",
                  }}
                >
                  <MessageSquare className="h-8 w-8 text-zinc-500" />
                  <p className="text-sm font-medium">No direct onboarding conversation logged.</p>
                  <p className="text-xs max-w-sm">
                    This mentor profile was either registered directly or via admin preview. Check the Professional Details tab for their full information.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Professional Details */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              {/* Bio */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                  Biography & Summary
                </h3>
                <div
                  className="p-4 rounded-xl text-sm leading-relaxed"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  {mentor.bio || <span className="text-zinc-500 italic">No biography provided.</span>}
                </div>
              </div>

              {/* Institution & Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl flex flex-col gap-3"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    <Building2 className="h-4 w-4 text-amber-500" />
                    <span>Institution / Workplace</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{mentor.institutionName}</span>
                      <InstitutionBadge institutionName={mentor.institutionName} institutionType={mentor.institutionType} />
                    </div>
                    <div className="text-xs flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                      <Mail className="h-3.5 w-3.5" />
                      <span>{mentor.institutionEmail}</span>
                    </div>
                    {mentor.department && (
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        Department: <span className="font-medium text-white">{mentor.department}</span>
                      </div>
                    )}
                    {mentor.graduationYear && (
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        Graduation Year: <span className="font-medium text-white">{mentor.graduationYear}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl flex flex-col gap-3"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>Role & Experience</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Current Role: </span>
                      <span className="font-medium">{mentor.currentRole || "Mentor"}</span>
                      {mentor.company && <span> at <strong>{mentor.company}</strong></span>}
                    </div>
                    {mentor.experienceYears !== undefined && mentor.experienceYears !== null && (
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        Experience: <span className="font-medium text-white">{mentor.experienceYears} years</span>
                      </div>
                    )}
                    {mentor.linkedinUrl && (
                      <a
                        href={mentor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline pt-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Expertise & Skills */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                  Expertise Areas & Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expertise.length > 0 ? (
                    expertise.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{
                          background: "color-mix(in srgb, var(--fg) 6%, transparent)",
                          border: "1px solid var(--hairline)",
                          color: "var(--fg)",
                        }}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500 italic">No expertise tags specified.</span>
                  )}
                </div>
              </div>

              {/* Location & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="p-3.5 rounded-xl flex flex-col gap-1"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" /> Location
                  </span>
                  <span className="text-xs font-medium">
                    {[mentor.city, mentor.state, mentor.country].filter(Boolean).join(", ") || mentor.location || "Remote / Unspecified"}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl flex flex-col gap-1"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-amber-500" /> Pricing
                  </span>
                  <span className="text-xs font-medium">
                    {mentor.pricePerSession ? `₹${(mentor.pricePerSession / 100).toFixed(0)}` : "Free / Trial"}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl flex flex-col gap-1"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" /> Session Length
                  </span>
                  <span className="text-xs font-medium">
                    {mentor.sessionDuration || 30} minutes
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: AI Insights & Personality */}
          {activeTab === "ai" && (
            <div className="flex flex-col gap-4">
              {userProfile ? (
                <div className="flex flex-col gap-4">
                  {userProfile.summary && (
                    <div
                      className="p-4 rounded-xl flex flex-col gap-2"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                        border: "1px solid var(--hairline)",
                      }}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        AI Executive Summary
                      </span>
                      <p className="text-sm leading-relaxed">{userProfile.summary}</p>
                    </div>
                  )}

                  {userProfile.goals && (
                    <div
                      className="p-4 rounded-xl flex flex-col gap-2"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                        border: "1px solid var(--hairline)",
                      }}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Mentorship Goals & Motivations
                      </span>
                      <p className="text-sm leading-relaxed">{userProfile.goals}</p>
                    </div>
                  )}

                  {userProfile.personality && (
                    <div
                      className="p-4 rounded-xl flex flex-col gap-3"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                        border: "1px solid var(--hairline)",
                      }}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Personality & Communication Trait Analysis
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {Object.entries(userProfile.personality).map(([key, val]) => (
                          <div
                            key={key}
                            className="p-2.5 rounded-lg flex flex-col gap-0.5"
                            style={{ background: "color-mix(in srgb, var(--fg) 4%, transparent)" }}
                          >
                            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="font-medium text-white">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="p-8 text-center rounded-2xl flex flex-col items-center gap-2"
                  style={{
                    border: "1px dashed var(--hairline)",
                    color: "var(--muted)",
                  }}
                >
                  <Sparkles className="h-8 w-8 text-amber-400" />
                  <p className="text-sm font-medium">AI profile synthesis not available yet.</p>
                  <p className="text-xs max-w-sm">
                    Ruth AI creates synthesized profiles automatically upon completing the conversational questionnaire.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Verification Docs */}
          {activeTab === "docs" && (
            <div className="flex flex-col gap-4">
              {docs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl flex items-center justify-between"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                        border: "1px solid var(--hairline)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{doc.docType || "Verification Document"}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        style={{
                          background: "color-mix(in srgb, var(--fg) 8%, transparent)",
                          color: "var(--fg)",
                        }}
                      >
                        <span>View Document</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="p-8 text-center rounded-2xl flex flex-col items-center gap-2"
                  style={{
                    border: "1px dashed var(--hairline)",
                    color: "var(--muted)",
                  }}
                >
                  <ShieldCheck className="h-8 w-8 text-zinc-500" />
                  <p className="text-sm font-medium">No external verification documents uploaded.</p>
                  <p className="text-xs max-w-sm">
                    Verification was authenticated via institutional email ({mentor.institutionEmail}).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0"
          style={{
            borderColor: "var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
          }}
        >
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Application submitted on {new Date(mentor.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {rejecting ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="Rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl flex-1 outline-none border"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                    borderColor: "var(--hairline)",
                    color: "var(--fg)",
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "Rejecting..." : "Confirm Reject"}
                  </button>
                  <button
                    onClick={() => setRejecting(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium cursor-pointer"
                    style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {mentor.approvalStatus === "PENDING" && (
                  <>
                    <button
                      onClick={() => setRejecting(true)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {actionLoading ? "Approving..." : "Approve Mentor"}
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 6%, transparent)",
                    color: "var(--fg)",
                  }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
