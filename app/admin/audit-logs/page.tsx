"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import {
  Shield,
  Search,
  ArrowRight,
  Activity,
  Calendar,
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  Globe,
  AlertTriangle,
  Lock,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actor?: { id: string; name: string; email: string | null; role?: string } | null;
  targetId: string | null;
  target?: { id: string; name: string; email: string | null } | null;
  oldValue: string | null;
  newValue: string | null;
  endpoint: string | null;
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  metadata: {
    browser?: string;
    os?: string;
    deviceType?: string;
    deviceModel?: string;
    language?: string;
    country?: string;
    isSuspicious?: boolean;
    flagReason?: string;
    attemptedEmail?: string;
    actorEmail?: string;
    [key: string]: any;
  } | null;
  createdAt: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getDeviceIcon(deviceType?: string, isBot?: boolean) {
  if (isBot || deviceType === "Bot") return <Bot className="h-3.5 w-3.5 text-amber-500" />;
  if (deviceType === "Mobile") return <Smartphone className="h-3.5 w-3.5 text-sky-500" />;
  if (deviceType === "Tablet") return <Tablet className="h-3.5 w-3.5 text-purple-500" />;
  return <Laptop className="h-3.5 w-3.5 text-emerald-500" />;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filterTab, setFilterTab] = useState<"ALL" | "THREATS" | "AUTH" | "ROLES">("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    api
      .get("/admin/audit-logs", { params: { limit: 100 } })
      .then((res) => {
        setLogs(res.data.logs ?? []);
      })
      .catch(() => {
        // Fallback to super-admin endpoint if needed
        api
          .get("/super-admin/audit-logs", { params: { limit: 100 } })
          .then((res) => setLogs(res.data.logs ?? []))
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  };

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const actorName = log.actor?.name?.toLowerCase() || "";
    const actorEmail = log.actor?.email?.toLowerCase() || log.metadata?.actorEmail?.toLowerCase() || "";
    const browser = log.metadata?.browser?.toLowerCase() || "";
    const os = log.metadata?.os?.toLowerCase() || "";

    const matchesSearch =
      log.action.toLowerCase().includes(term) ||
      log.actorId.toLowerCase().includes(term) ||
      actorName.includes(term) ||
      actorEmail.includes(term) ||
      browser.includes(term) ||
      os.includes(term) ||
      (log.targetId && log.targetId.toLowerCase().includes(term)) ||
      (log.ip && log.ip.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterTab === "THREATS") {
      return (
        log.metadata?.isSuspicious ||
        log.action.includes("FAILED") ||
        log.action.includes("UNAUTHORIZED") ||
        log.action.includes("REJECT")
      );
    }
    if (filterTab === "AUTH") {
      return log.action.includes("LOGIN") || log.action.includes("SIGNUP") || log.action.includes("PASSWORD");
    }
    if (filterTab === "ROLES") {
      return log.action.includes("ROLE") || log.action.includes("ADMIN") || log.action.includes("STATUS");
    }

    return true;
  });

  const threatCount = logs.filter(
    (l) => l.metadata?.isSuspicious || l.action.includes("UNAUTHORIZED") || l.action.includes("FAILED")
  ).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em] flex items-center gap-2" style={{ color: "var(--muted)" }}>
            <Shield className="h-4 w-4 text-red-500" />
            Security & Device Telemetry
          </p>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>
            Security Audit Logs.
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Real-time client telemetry, IP address, device fingerprints, and unauthorized access detection.
          </p>
        </div>

        {/* Action / Search Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl transition-colors hover:bg-white/5"
            style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
            title="Refresh logs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search action, user, IP, browser..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
              style={{
                border: "1px solid var(--hairline)",
                background: "color-mix(in srgb, var(--fg) 2%, transparent)",
                color: "var(--fg)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Security Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            filterTab === "ALL"
              ? "bg-red-500/15 text-red-500 border border-red-500/30"
              : "border border-[var(--hairline)] hover:bg-white/5 text-[var(--muted)]"
          }`}
        >
          All Activity ({logs.length})
        </button>
        <button
          onClick={() => setFilterTab("THREATS")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
            filterTab === "THREATS"
              ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20"
              : "border border-[var(--hairline)] text-red-400 hover:bg-red-500/10"
          }`}
        >
          <AlertTriangle className="h-3 w-3" />
          Security Flags ({threatCount})
        </button>
        <button
          onClick={() => setFilterTab("AUTH")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
            filterTab === "AUTH"
              ? "bg-blue-500/15 text-blue-500 border border-blue-500/30 font-semibold"
              : "border border-[var(--hairline)] hover:bg-white/5 text-[var(--muted)]"
          }`}
        >
          <Lock className="h-3 w-3" />
          Logins & Sessions
        </button>
        <button
          onClick={() => setFilterTab("ROLES")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
            filterTab === "ROLES"
              ? "bg-purple-500/15 text-purple-500 border border-purple-500/30 font-semibold"
              : "border border-[var(--hairline)] hover:bg-white/5 text-[var(--muted)]"
          }`}
        >
          <Shield className="h-3 w-3" />
          Privileged Actions
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Logs Table List */}
          <div className="flex-1 overflow-x-auto pb-2">
            <div className="min-w-[760px] flex flex-col gap-2">
              <div
                className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.22em] font-semibold"
                style={{ color: "var(--muted)" }}
              >
                <span className="col-span-3">Event / Status</span>
                <span className="col-span-3">Actor & Identity</span>
                <span className="col-span-4">Device & Client Telemetry</span>
                <span className="col-span-2 text-right">Time (IST)</span>
              </div>

              {filteredLogs.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 rounded-2xl text-center gap-2"
                  style={{
                    border: "1px dashed var(--hairline)",
                    background: "color-mix(in srgb, var(--fg) 1%, transparent)",
                  }}
                >
                  <Activity className="h-8 w-8" style={{ color: "var(--muted)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    No audit records match your criteria
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Try searching for another user, action, or clearing your filter
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isThreat =
                    log.metadata?.isSuspicious ||
                    log.action.includes("UNAUTHORIZED") ||
                    log.action.includes("FAILED");

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                      className="grid grid-cols-12 gap-4 items-center rounded-xl px-5 py-3.5 text-sm cursor-pointer transition-all"
                      style={{
                        border:
                          selectedLog?.id === log.id
                            ? "1px solid rgba(239, 68, 68, 0.5)"
                            : isThreat
                            ? "1px solid rgba(239, 68, 68, 0.25)"
                            : "1px solid var(--hairline)",
                        background:
                          selectedLog?.id === log.id
                            ? "rgba(239, 68, 68, 0.08)"
                            : isThreat
                            ? "rgba(239, 68, 68, 0.03)"
                            : "color-mix(in srgb, var(--fg) 1%, transparent)",
                      }}
                    >
                      {/* Action & Threat Flag */}
                      <div className="col-span-3 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[11px] font-semibold rounded-md px-2 py-0.5 inline-flex items-center gap-1 ${
                              isThreat
                                ? "bg-red-500/15 text-red-500 border border-red-500/20"
                                : log.action.includes("LOGIN")
                                ? "bg-emerald-500/10 text-emerald-500"
                                : log.action.includes("UPGRADE") || log.action.includes("APPROVE")
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-gray-500/10 text-gray-400"
                            }`}
                          >
                            {isThreat && <AlertTriangle className="h-3 w-3 shrink-0" />}
                            {log.action}
                          </span>
                        </div>
                        {log.metadata?.flagReason && (
                          <span className="text-[10px] text-red-400 truncate" title={log.metadata.flagReason}>
                            ⚠️ {log.metadata.flagReason}
                          </span>
                        )}
                      </div>

                      {/* Actor & Identity */}
                      <div className="col-span-3 flex flex-col gap-0.5 truncate">
                        <span className="font-medium text-xs truncate" style={{ color: "var(--fg)" }}>
                          {log.actor?.name || log.actor?.email || log.actorId}
                        </span>
                        <span className="text-[10px] truncate" style={{ color: "var(--muted)" }}>
                          {log.actor?.email || log.metadata?.actorEmail || log.metadata?.attemptedEmail || "System Event"}
                        </span>
                      </div>

                      {/* Device & Client Telemetry */}
                      <div className="col-span-4 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs truncate" style={{ color: "var(--fg)" }}>
                          {getDeviceIcon(log.metadata?.deviceType, log.metadata?.isSuspicious)}
                          <span className="font-medium truncate">
                            {log.metadata?.browser || "Browser"}{" "}
                            <span className="opacity-60 text-[11px]">on {log.metadata?.os || "OS"}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted)" }}>
                          <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                            IP: {log.ip || "127.0.0.1"}
                          </span>
                          {log.endpoint && (
                            <span className="truncate max-w-[120px]" title={log.endpoint}>
                              {log.endpoint}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="col-span-2 text-right text-xs font-mono" style={{ color: "var(--muted)" }}>
                        {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Sidebar panel */}
          {selectedLog && (
            <div
              className="w-full lg:w-96 rounded-2xl p-6 flex flex-col gap-6 h-fit shrink-0 animate-in fade-in slide-in-from-right-4 duration-200"
              style={{
                border: "1px solid var(--hairline)",
                background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              }}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg" style={{ color: "var(--fg)" }}>
                    Security Telemetry
                  </h3>
                  {selectedLog.metadata?.isSuspicious && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md border border-red-500/30">
                      FLAGGED THREAT
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono break-all" style={{ color: "var(--muted)" }}>
                  ID: {selectedLog.id}
                </p>
              </div>

              <div className="h-px" style={{ background: "var(--hairline)" }} />

              <div className="flex flex-col gap-4 text-xs">
                {/* Event Type */}
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-[9px] tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                    Event Action
                  </span>
                  <span className="font-medium text-sm" style={{ color: "var(--fg)" }}>
                    {selectedLog.action}
                  </span>
                </div>

                {/* Actor Info */}
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="uppercase text-[9px] tracking-wider font-semibold flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                    <UserIcon className="h-3 w-3" />
                    Actor & Identity
                  </span>
                  <span className="font-medium" style={{ color: "var(--fg)" }}>
                    {selectedLog.actor?.name || selectedLog.actorId}
                  </span>
                  {(selectedLog.actor?.email || selectedLog.metadata?.actorEmail || selectedLog.metadata?.attemptedEmail) && (
                    <span className="font-mono text-[11px] text-sky-400">
                      {selectedLog.actor?.email || selectedLog.metadata?.actorEmail || selectedLog.metadata?.attemptedEmail}
                    </span>
                  )}
                </div>

                {/* Device & OS Intelligence */}
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="uppercase text-[9px] tracking-wider font-semibold flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                    <Laptop className="h-3 w-3" />
                    Device Fingerprint
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] block opacity-60">Browser</span>
                      <span className="font-medium" style={{ color: "var(--fg)" }}>
                        {selectedLog.metadata?.browser || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-60">Operating System</span>
                      <span className="font-medium" style={{ color: "var(--fg)" }}>
                        {selectedLog.metadata?.os || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-60">Device Type</span>
                      <span className="font-medium" style={{ color: "var(--fg)" }}>
                        {selectedLog.metadata?.deviceType || "Desktop"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] block opacity-60">Client Language</span>
                      <span className="font-medium" style={{ color: "var(--fg)" }}>
                        {selectedLog.metadata?.language || "en"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* IP & Endpoint */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-[9px] tracking-wider font-semibold flex items-center gap-1" style={{ color: "var(--muted)" }}>
                      <Globe className="h-3 w-3" />
                      Client IP
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {selectedLog.ip || "127.0.0.1"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-[9px] tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                      API Route
                    </span>
                    <span className="truncate font-mono text-[11px]" title={selectedLog.endpoint || "N/A"} style={{ color: "var(--fg)" }}>
                      {selectedLog.endpoint || "System Task"}
                    </span>
                  </div>
                </div>

                {/* Threat Reason if Flagged */}
                {selectedLog.metadata?.flagReason && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col gap-1">
                    <span className="uppercase text-[9px] tracking-wider font-bold text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Flag Reason
                    </span>
                    <p className="text-xs text-red-200 leading-relaxed">
                      {selectedLog.metadata.flagReason}
                    </p>
                  </div>
                )}

                {/* User Agent Raw String */}
                {selectedLog.userAgent && (
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-[9px] tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                      Raw User-Agent
                    </span>
                    <p className="font-mono text-[9px] break-all p-2 rounded bg-black/30 border border-white/5 opacity-80" style={{ color: "var(--fg)" }}>
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-[9px] tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                    Recorded Timestamp
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: "var(--fg)" }}>
                    <Calendar className="h-3 w-3" style={{ color: "var(--muted)" }} />
                    {formatDate(selectedLog.createdAt)}
                  </span>
                </div>

                {/* Metadata JSON Drawer */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="uppercase text-[9px] tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                      Raw Context Payload
                    </span>
                    <pre
                      className="p-3 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                        color: "var(--fg)",
                      }}
                    >
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
