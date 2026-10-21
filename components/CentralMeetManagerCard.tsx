"use client";

import React, { useState, useEffect } from "react";
import { Video, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { getMeetingServiceStatus, getMeetingAuthUrl } from "@/lib/api";

interface MeetingServiceStatus {
  configured: boolean;
  connected: boolean;
  tokenSource?: string;
  email?: string | null;
  calendarSummary?: string | null;
  error?: string | null;
}

export default function CentralMeetManagerCard() {
  const [status, setStatus] = useState<MeetingServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getMeetingServiceStatus();
      setStatus(data);
    } catch (err: any) {
      setStatus({
        configured: false,
        connected: false,
        error: err.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectCentralAccount = async () => {
    setConnecting(true);
    try {
      const { url } = await getMeetingAuthUrl("/superadmin/settings");
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      alert("Failed to start Google OAuth: " + (err.response?.data?.error || err.message));
      setConnecting(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-6"
      style={{
        border: "1px solid var(--hairline)",
        background: "color-mix(in srgb, var(--fg) 2%, transparent)",
      }}
    >
      <div className="flex items-center justify-between gap-4 pb-4" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl" style={{ color: "var(--fg)" }}>
              Central Google Meet Provisioner
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Automated meeting room generation for clients, mentors, and mentees with zero knocking.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          disabled={loading}
          className="p-2 rounded-xl border border-[var(--hairline)] hover:bg-[var(--fg)]/[0.04] transition-colors cursor-pointer text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-50"
          title="Refresh Status"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-xs text-[var(--muted)]">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Checking Google Calendar API connection…
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Card */}
            <div className="rounded-xl p-4 border border-[var(--hairline)] bg-[var(--fg)]/[0.02] flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Connection Status
              </span>
              <div className="flex items-center gap-2">
                {status?.connected ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-bold text-emerald-500">Active & Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-bold text-amber-500">Re-Auth Required</span>
                  </>
                )}
              </div>
            </div>

            {/* Central Account */}
            <div className="rounded-xl p-4 border border-[var(--hairline)] bg-[var(--fg)]/[0.02] flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Central Google Host
              </span>
              <span className="text-sm font-bold truncate" style={{ color: "var(--fg)" }}>
                {status?.email || "admin.helpmeman@gmail.com"}
              </span>
            </div>

            {/* Token Storage */}
            <div className="rounded-xl p-4 border border-[var(--hairline)] bg-[var(--fg)]/[0.02] flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Token Source
              </span>
              <span className="text-sm font-bold capitalize" style={{ color: "var(--fg)" }}>
                {status?.tokenSource === "database" ? "Database (PlatformSetting)" : status?.tokenSource || "Environment"}
              </span>
            </div>
          </div>

          {status?.error && (
            <div className="rounded-xl p-3.5 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5 opacity-90">{status.error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>OAuth2 Refresh Token auto-refreshes seamlessly in the background.</span>
            </div>

            <button
              type="button"
              onClick={handleConnectCentralAccount}
              disabled={connecting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{status?.connected ? "Re-authorize Central Google Account" : "Connect Central Google Account"}</span>
              <ExternalLink className="h-3 w-3 opacity-70 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
