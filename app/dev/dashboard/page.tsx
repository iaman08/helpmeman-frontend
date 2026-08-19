"use client";

import { useEffect, useState } from "react";
import {
  Terminal,
  Cpu,
  Database,
  Mail,
  Zap,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Server,
  Activity,
  ShieldAlert,
  Layers,
  Clock,
  UserCheck,
  FileCode2,
} from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";

interface DevStats {
  runtime: {
    nodeEnv: string;
    uptimeSeconds: number;
    memoryUsageMb: { rss: number; heapTotal: number; heapUsed: number };
  };
  counts: {
    users: number;
    mentors: number;
    bookings: number;
    reviews: number;
    chatThreads: number;
    auditLogs: number;
    failedEmails: number;
  };
  services: {
    resendConfigured: boolean;
    gmailConfigured: boolean;
    smtpConfigured: boolean;
    googleCalendarConfigured: boolean;
  };
  recentAuditLogs: any[];
  recentEmailLogs: any[];
}

function formatUptime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h ${mins % 60}m`;
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m ${seconds % 60}s`;
}

export default function DevDashboardPage() {
  const [stats, setStats] = useState<DevStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Email Test state
  const [testEmailAddress, setTestEmailAddress] = useState("riturdev@gmail.com");
  const [testEmailType, setTestEmailType] = useState<"otp" | "approval" | "rejection" | "account_hold">("otp");
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<any>(null);

  // Job trigger state
  const [jobLoading, setJobLoading] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<any>(null);

  useEffect(() => {
    fetchDevStats();
  }, []);

  const fetchDevStats = async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/dev/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dev stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailResult(null);
    try {
      const res = await api.post("/dev/test-email", {
        toEmail: testEmailAddress,
        type: testEmailType,
      });
      setTestEmailResult({ success: true, data: res.data });
      fetchDevStats();
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        error: err.response?.data?.error || err.message || "Failed to send test email",
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleTriggerJob = async (jobName: "session_reminders" | "email_retries") => {
    setJobLoading(jobName);
    setJobResult(null);
    try {
      const res = await api.post("/dev/trigger-job", { jobName });
      setJobResult({ success: true, job: jobName, data: res.data });
      fetchDevStats();
    } catch (err: any) {
      setJobResult({
        success: false,
        job: jobName,
        error: err.response?.data?.error || err.message || "Job execution failed",
      });
    } finally {
      setJobLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Top Header & Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.22em] font-mono" style={{ color: "var(--muted)" }}>Developer Console</p>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
              {stats?.runtime?.nodeEnv || "DEVELOPMENT"} MODE
            </span>
          </div>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>System Telemetry & Sandbox.</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Developer Portal for <strong className="text-[var(--fg)]">riturdev@gmail.com</strong> — live metrics, database controls & API sandbox
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDevStats}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          style={{
            borderColor: "var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 3%, transparent)",
            color: "var(--fg)",
          }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-cyan-500" : ""}`} />
          {refreshing ? "Syncing..." : "Refresh Metrics"}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Section 1: System Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Server Runtime Card */}
            <div className="rounded-2xl p-5 border flex flex-col justify-between gap-4" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <Server className="h-4 w-4 text-cyan-500" /> Runtime
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[var(--fg)]">{formatUptime(stats?.runtime?.uptimeSeconds || 0)}</p>
                <p className="text-xs text-[var(--muted)] mt-1 font-mono">Process Uptime</p>
              </div>
              <div className="text-[11px] font-mono text-[var(--muted)] pt-3 border-t border-[var(--hairline)] flex items-center justify-between">
                <span>Node.js v24.15.0</span>
                <span>RSS: {stats?.runtime?.memoryUsageMb?.rss || 0} MB</span>
              </div>
            </div>

            {/* Database Telemetry */}
            <div className="rounded-2xl p-5 border flex flex-col justify-between gap-4" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-purple-500" /> Database
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">CONNECTED</span>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[var(--fg)]">{stats?.counts?.users || 0} Users</p>
                <p className="text-xs text-[var(--muted)] mt-1">{stats?.counts?.mentors || 0} Mentors • {stats?.counts?.bookings || 0} Bookings</p>
              </div>
              <div className="text-[11px] font-mono text-[var(--muted)] pt-3 border-t border-[var(--hairline)] flex items-center justify-between">
                <span>Prisma ORM PostgreSQL</span>
                <span>Supabase Pool</span>
              </div>
            </div>

            {/* Email Dispatch Services */}
            <div className="rounded-2xl p-5 border flex flex-col justify-between gap-4" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-amber-500" /> Email Services
                </span>
                {stats?.services?.resendConfigured || stats?.services?.gmailConfigured ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">READY</span>
                ) : (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">WARN</span>
                )}
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[var(--fg)]">
                  {stats?.services?.resendConfigured ? "Resend API" : stats?.services?.gmailConfigured ? "Gmail SMTP" : "Fallback SMTP"}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">{stats?.counts?.failedEmails || 0} failed retry logs</p>
              </div>
              <div className="text-[11px] font-mono text-[var(--muted)] pt-3 border-t border-[var(--hairline)] flex items-center justify-between">
                <span>Resend: {stats?.services?.resendConfigured ? "✓" : "—"}</span>
                <span>Gmail: {stats?.services?.gmailConfigured ? "✓" : "—"}</span>
              </div>
            </div>

            {/* Audit & Logs */}
            <div className="rounded-2xl p-5 border flex flex-col justify-between gap-4" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-cyan-500" /> Audit Stream
                </span>
                <span className="text-xs font-semibold text-cyan-600 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">LOGGING</span>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[var(--fg)]">{stats?.counts?.auditLogs || 0} Events</p>
                <p className="text-xs text-[var(--muted)] mt-1">{stats?.counts?.chatThreads || 0} Active Chat Threads</p>
              </div>
              <div className="text-[11px] font-mono text-[var(--muted)] pt-3 border-t border-[var(--hairline)] flex items-center justify-between">
                <span>AuditLog table synced</span>
                <span>{stats?.recentAuditLogs?.length || 0} recent</span>
              </div>
            </div>
          </div>

          {/* Section 2: Developer Test Sandbox Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Test Runner */}
            <div className="rounded-2xl p-6 border flex flex-col gap-5" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 1.5%, transparent)" }}>
              <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-cyan-500" />
                  <h3 className="font-bold text-lg text-[var(--fg)]">Transactional Email Test Studio</h3>
                </div>
                <span className="text-[11px] font-mono text-[var(--muted)]">API Dispatch Test</span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Recipient Email Address:</label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="w-full rounded-xl p-3 text-sm font-mono outline-none"
                    style={{
                      border: "1px solid var(--hairline)",
                      background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                      color: "var(--fg)",
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Select Email Template Type:</label>
                  <select
                    value={testEmailType}
                    onChange={(e: any) => setTestEmailType(e.target.value)}
                    className="w-full rounded-xl p-3 text-sm font-mono outline-none cursor-pointer"
                    style={{
                      border: "1px solid var(--hairline)",
                      background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                      color: "var(--fg)",
                    }}
                  >
                    <option value="otp" style={{ background: "var(--bg)" }}>🔐 OTP Verification Code Email</option>
                    <option value="approval" style={{ background: "var(--bg)" }}>🎉 Mentor Application Approved Email</option>
                    <option value="rejection" style={{ background: "var(--bg)" }}>📋 Mentor Application Decline Email</option>
                    <option value="account_hold" style={{ background: "var(--bg)" }}>⚠️ Account On Hold Notification Email</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testEmailLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-600/20"
                >
                  <Send className="h-4 w-4" />
                  {testEmailLoading ? "Dispatching Email..." : "Send Test Email"}
                </button>

                {testEmailResult && (
                  <div className={`p-4 rounded-xl text-xs font-mono border ${testEmailResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-red-500/10 border-red-500/30 text-red-600"}`}>
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      {testEmailResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      {testEmailResult.success ? "Email Dispatched Successfully!" : "Email Dispatch Failed"}
                    </p>
                    <pre className="overflow-x-auto text-[11px] opacity-80 mt-1">{JSON.stringify(testEmailResult.data || testEmailResult.error, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Background Jobs Runner */}
            <div className="rounded-2xl p-6 border flex flex-col gap-5" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 1.5%, transparent)" }}>
              <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-lg text-[var(--fg)]">Background Job Trigger Studio</h3>
                </div>
                <span className="text-[11px] font-mono text-[var(--muted)]">Cron & Queue Trigger</span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)" }}>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[var(--fg)]">Session Intake Reminder Check</span>
                    <span className="text-xs text-[var(--muted)]">Triggers 2h intake reminder notification for upcoming bookings</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerJob("session_reminders")}
                    disabled={jobLoading === "session_reminders"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {jobLoading === "session_reminders" ? "Running..." : "Run Job"}
                  </button>
                </div>

                <div className="p-4 rounded-xl border flex items-center justify-between" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)" }}>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[var(--fg)]">Failed Email Retry Sweep</span>
                    <span className="text-xs text-[var(--muted)]">Retries queued failed email delivery log items</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerJob("email_retries")}
                    disabled={jobLoading === "email_retries"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border border-purple-500/20 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {jobLoading === "email_retries" ? "Retrying..." : "Run Sweep"}
                  </button>
                </div>

                {jobResult && (
                  <div className={`p-4 rounded-xl text-xs font-mono border ${jobResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-red-500/10 border-red-500/30 text-red-600"}`}>
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      {jobResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      Job {jobResult.job} executed
                    </p>
                    <pre className="overflow-x-auto text-[11px] opacity-80 mt-1">{JSON.stringify(jobResult.data || jobResult.error, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Live System Audit Log Stream */}
          <div className="rounded-2xl p-6 border flex flex-col gap-4" style={{ borderColor: "var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
            <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-5 w-5 text-cyan-500" />
                <h3 className="font-bold text-lg text-[var(--fg)]">Recent System Audit Event Log</h3>
              </div>
              <span className="text-xs text-[var(--muted)] font-mono">Last 10 recorded actions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hairline)", color: "var(--muted)" }} className="uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Endpoint</th>
                    <th className="py-3 px-4">Target ID</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentAuditLogs?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[var(--muted)] font-sans">No audit events logged yet.</td>
                    </tr>
                  ) : (
                    stats?.recentAuditLogs?.map((log: any, idx: number) => (
                      <tr key={log.id || idx} style={{ borderBottom: "1px solid var(--hairline)" }} className="hover:bg-cyan-500/5 transition-colors">
                        <td className="py-3 px-4 text-[var(--muted)]">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-cyan-500">{log.action}</td>
                        <td className="py-3 px-4 text-[var(--fg)]">{log.endpoint || "—"}</td>
                        <td className="py-3 px-4 text-[var(--muted)]">{log.targetId || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
