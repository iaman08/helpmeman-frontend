"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Scale,
  Sparkles,
  ExternalLink,
  Loader2,
  Lock,
  RefreshCw,
  FileText,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface PrivacyPreferences {
  marketingEmails: boolean;
  aiMemoryEnabled: boolean;
  hasStoredAiMemory: boolean;
  analyticsConsent: boolean;
  lastUpdated: string;
}

export function PrivacyDataPanel({ userRole = "STUDENT" }: { userRole?: "STUDENT" | "MENTOR" }) {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState<PrivacyPreferences>({
    marketingEmails: false,
    aiMemoryEnabled: true,
    hasStoredAiMemory: false,
    analyticsConsent: true,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [updatingConsent, setUpdatingConsent] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearingMemory, setClearingMemory] = useState(false);
  const [memoryCleared, setMemoryCleared] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Grievance Modal State
  const [grievanceModalOpen, setGrievanceModalOpen] = useState(false);
  const [grievanceCategory, setGrievanceCategory] = useState("DATA_CORRECTION");
  const [grievanceSubject, setGrievanceSubject] = useState("");
  const [grievanceDescription, setGrievanceDescription] = useState("");
  const [grievanceEmail, setGrievanceEmail] = useState(user?.email || "");
  const [submittingGrievance, setSubmittingGrievance] = useState(false);
  const [grievanceSuccessTicket, setGrievanceSuccessTicket] = useState<string | null>(null);

  // Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const res = await api.get<PrivacyPreferences>("/user/me/privacy-preferences");
      setPrefs(res.data);
    } catch (err: any) {
      console.warn("[Privacy] Failed to load preferences:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMarketing = async (newValue: boolean) => {
    try {
      setUpdatingConsent(true);
      const res = await api.put("/user/me/privacy-preferences", {
        marketingEmails: newValue,
      });
      setPrefs((prev) => ({ ...prev, marketingEmails: res.data.marketingEmails }));
      setFeedbackMsg({ type: "success", text: "Consent preference updated in compliance with DPDP Act Section 6." });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.response?.data?.error || "Failed to update preference." });
    } finally {
      setUpdatingConsent(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const res = await api.get("/user/me/data-export", { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `helpmeman-personal-data-${user?.id?.slice(0, 8) || "export"}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setFeedbackMsg({ type: "success", text: "Data export completed successfully (Section 11, DPDP Act 2023)." });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: "Failed to download personal data export." });
    } finally {
      setExporting(false);
    }
  };

  const handleClearAiMemory = async () => {
    if (!confirm("Are you sure you want to erase your saved AI context and interaction memory? Ruth AI will start fresh without prior memory.")) {
      return;
    }
    try {
      setClearingMemory(true);
      await api.delete("/user/me/ai-memory");
      setMemoryCleared(true);
      setPrefs((prev) => ({ ...prev, hasStoredAiMemory: false }));
      setFeedbackMsg({ type: "success", text: "AI interaction history permanently erased (Section 12, DPDP Act 2023)." });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: "Failed to clear AI memory." });
    } finally {
      setClearingMemory(false);
    }
  };

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceSubject || !grievanceDescription) return;

    try {
      setSubmittingGrievance(true);
      const res = await api.post("/user/me/privacy-grievance", {
        category: grievanceCategory,
        subject: grievanceSubject,
        description: grievanceDescription,
        preferredContactEmail: grievanceEmail,
      });
      setGrievanceSuccessTicket(res.data.ticketNumber);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit grievance. Please try again.");
    } finally {
      setSubmittingGrievance(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmInput !== "DELETE") return;
    try {
      setDeletingAccount(true);
      await api.post("/user/me/delete-account", {
        confirmationText: confirmInput,
        reason: deleteReason,
      });
      alert("Your account and personal data have been permanently erased under DPDP Act 2023 Section 12. Logging out.");
      await logout();
      window.location.href = "/";
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to erase account.");
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Feedback Banner ─── */}
      {feedbackMsg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
          }`}
        >
          {feedbackMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ─── DPDP Statutory Notice Header ─── */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          border: "1px solid var(--hairline)",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--fg) 3%, transparent), color-mix(in srgb, var(--fg) 1%, transparent))",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
                  Digital Personal Data Protection (DPDP Act, 2023)
                </h2>
              </div>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                Your statutory rights as a Data Principal on the HelpMeMan platform.
              </p>
            </div>
          </div>
          <Link
            href="/privacy#dpdp"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto transition-colors"
            style={{
              border: "1px solid var(--hairline)",
              color: "var(--fg)",
              background: "color-mix(in srgb, var(--fg) 4%, transparent)",
            }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Read DPDP Policy</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Under India&apos;s Digital Personal Data Protection Act, 2023, you have the right to access a summary of your personal data,
          correct inaccurate information, withdraw optional processing consent at any time, seek grievance redressal, and request data erasure.
        </p>
      </div>

      {/* ─── Section 11: Right to Access (Download Data) ─── */}
      <div className="rounded-3xl p-6 sm:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-500" />
              <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>
                Right to Access Information (Section 11)
              </h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted)" }}>
              Download an authenticated, machine-readable JSON copy of all personal data held by HelpMeMan, including your profile,
              booking records, reviews, notification preferences, registered devices, and AI interaction metadata.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Format: Standard JSON (RFC 8259 compliant) · Instant Download
          </span>
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer shadow transition-opacity disabled:opacity-50"
            style={{ background: "var(--fg)", color: "var(--bg)" }}
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{exporting ? "Compiling Data Bundle..." : "Download My Data (JSON)"}</span>
          </button>
        </div>
      </div>

      {/* ─── Section 6: Notice & Consent Preferences ─── */}
      <div className="rounded-3xl p-6 sm:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>
            Consent &amp; Processing Preferences (Section 6)
          </h3>
        </div>
        <p className="text-xs sm:text-sm mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
          The DPDP Act guarantees your right to withdraw consent with the same ease as giving it. Customize your optional processing preferences below:
        </p>

        <div className="space-y-4 divide-y divide-[var(--hairline)]">
          {/* Promotional Communications */}
          <div className="flex items-center justify-between gap-4 pt-4 first:pt-0">
            <div>
              <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--fg)" }}>
                Marketing &amp; Promotional Updates
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Receive occasional announcements about new mentors, community webinars, and educational discounts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleMarketing(!prefs.marketingEmails)}
              disabled={updatingConsent}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                prefs.marketingEmails ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  prefs.marketingEmails ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* AI Memory Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--fg)" }}>
                  Ruth AI Memory &amp; Learning Context
                </p>
              </div>
              <p className="text-xs max-w-xl" style={{ color: "var(--muted)" }}>
                Ruth AI remembers key context from your previous questions to deliver tailored mentorship advice. You can erase this memory anytime under Section 12.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearAiMemory}
              disabled={clearingMemory || memoryCleared}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-[var(--hairline)] hover:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
            >
              {clearingMemory ? "Clearing..." : memoryCleared ? "Memory Cleared" : "Clear AI Memory"}
            </button>
          </div>

          {/* Analytics & Platform Quality */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--fg)" }}>
                Essential Operational Analytics
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Aggregated session reliability metrics and error telemetry necessary to maintain video and payment uptime.
              </p>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Active / Essential
            </span>
          </div>
        </div>
      </div>

      {/* ─── Section 13: Grievance Redressal & DPO ─── */}
      <div className="rounded-3xl p-6 sm:p-8" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base sm:text-lg font-bold" style={{ color: "var(--fg)" }}>
                Grievance Redressal Mechanism (Section 13)
              </h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-2xl" style={{ color: "var(--muted)" }}>
              As mandated by the DPDP Act 2023, HelpMeMan maintains a readily accessible grievance mechanism overseen by our designated Grievance Redressal Officer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setGrievanceSuccessTicket(null);
              setGrievanceModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs border border-[var(--hairline)] hover:bg-[var(--fg)]/5 transition-colors cursor-pointer self-start sm:self-auto"
            style={{ color: "var(--fg)" }}
          >
            File Privacy Grievance
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[var(--hairline)]">
          <div className="p-3.5 rounded-2xl bg-[var(--fg)]/2 border border-[var(--hairline)]">
            <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>Grievance Officer</p>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--fg)" }}>Compliance Cell</p>
            <p className="text-[11px] truncate mt-0.5 text-indigo-500">grievance@helpmeman.com</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--fg)]/2 border border-[var(--hairline)]">
            <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>Statutory SLA</p>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--fg)" }}>48 Hours Ack</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>Resolution within 30 days</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--fg)]/2 border border-[var(--hairline)]">
            <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>Appellate Body</p>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--fg)" }}>DPBI (Govt of India)</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>Data Protection Board of India</p>
          </div>
        </div>
      </div>

      {/* ─── Section 12: Right to Erasure (Danger Zone) ─── */}
      <div className="rounded-3xl p-6 sm:p-8 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
              Right to Erasure &amp; Account Deletion (Section 12)
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Permanently scrub your digital personal data from HelpMeMan.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed my-4 text-zinc-600 dark:text-zinc-400">
          Requesting erasure will permanently delete your active sessions, device tokens, AI history, and personal identifiers.
          Statutory financial invoice logs for completed transactions will be anonymized and retained only for the legally mandated tax audit period.
        </p>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
        >
          Erase Personal Data &amp; Delete Account
        </button>
      </div>

      {/* ─── Grievance Submission Modal ─── */}
      {grievanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            style={{ background: "var(--bg)", border: "1px solid var(--hairline)" }}
          >
            <button
              onClick={() => setGrievanceModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-[var(--fg)]/10 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: "var(--muted)" }} />
            </button>

            {grievanceSuccessTicket ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--fg)" }}>
                  Grievance Registered
                </h3>
                <div className="p-4 rounded-2xl bg-[var(--fg)]/5 border border-[var(--hairline)] text-left space-y-2 text-xs">
                  <p><strong>Ticket ID:</strong> <span className="text-indigo-500 font-mono">{grievanceSuccessTicket}</span></p>
                  <p><strong>Statutory SLA:</strong> Acknowledged within 48h · Resolved within 30 days</p>
                  <p><strong>Officer Contact:</strong> grievance@helpmeman.com</p>
                </div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  A confirmation email has been dispatched to your registered address. You retain the right to escalate unresolved matters to the Data Protection Board of India.
                </p>
                <button
                  type="button"
                  onClick={() => setGrievanceModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold"
                  style={{ background: "var(--fg)", color: "var(--bg)" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitGrievance} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>
                    Submit DPDP Privacy Grievance
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    Directly addressed to the Data Protection &amp; Grievance Redressal Officer.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                    Grievance Category
                  </label>
                  <select
                    value={grievanceCategory}
                    onChange={(e) => setGrievanceCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)]"
                    style={{ color: "var(--fg)" }}
                  >
                    <option value="DATA_ACCESS">Right to Access / Data Portability Query</option>
                    <option value="DATA_CORRECTION">Right to Correction of Inaccurate Data</option>
                    <option value="DATA_ERASURE">Right to Erasure / Unfulfilled Deletion</option>
                    <option value="CONSENT_WITHDRAWAL">Consent Withdrawal Enforcement</option>
                    <option value="UNAUTHORIZED_PROCESSING">Report Suspected Unauthorized Processing</option>
                    <option value="OTHER_DPDP">Other DPDP Act Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={grievanceSubject}
                    onChange={(e) => setGrievanceSubject(e.target.value)}
                    placeholder="Brief summary of your grievance"
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)]"
                    style={{ color: "var(--fg)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                    Detailed Grievance
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={grievanceDescription}
                    onChange={(e) => setGrievanceDescription(e.target.value)}
                    placeholder="Please specify the facts, dates, and remediation requested under the DPDP Act 2023..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)]"
                    style={{ color: "var(--fg)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                    Contact Email for Response
                  </label>
                  <input
                    type="email"
                    required
                    value={grievanceEmail}
                    onChange={(e) => setGrievanceEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)]"
                    style={{ color: "var(--fg)" }}
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGrievanceModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--hairline)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGrievance}
                    className="px-5 py-2 text-xs font-semibold rounded-xl disabled:opacity-50"
                    style={{ background: "var(--fg)", color: "var(--bg)" }}
                  >
                    {submittingGrievance ? "Submitting..." : "Submit Grievance"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Deletion Confirmation Modal ─── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-red-500/30"
            style={{ background: "var(--bg)" }}
          >
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-xl hover:bg-[var(--fg)]/10 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: "var(--muted)" }} />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                  Confirm Data Erasure
                </h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
                  This action is permanent and irreversible under Section 12 of the DPDP Act. Your account credentials, active sessions, and personal data will be completely scrubbed.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Tell us why you are leaving"
                  className="w-full text-xs p-2.5 rounded-xl border border-[var(--hairline)] bg-[var(--bg)]"
                  style={{ color: "var(--fg)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                  Type <span className="font-bold text-red-500 font-mono">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full text-xs p-2.5 rounded-xl border border-red-500/30 bg-[var(--bg)] font-mono"
                  style={{ color: "var(--fg)" }}
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-[var(--hairline)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmInput !== "DELETE" || deletingAccount}
                  onClick={handleDeleteAccount}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer"
                >
                  {deletingAccount ? "Erasing..." : "Permanently Erase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
