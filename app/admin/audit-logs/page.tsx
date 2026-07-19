"use client";

import { useEffect, useState, useTransition } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { Shield, Search, ArrowRight, Activity, Calendar } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  targetId: string | null;
  oldValue: string | null;
  newValue: string | null;
  endpoint: string | null;
  ip: string | null;
  requestId: string | null;
  metadata: any | null;
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

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    api.get("/super-admin/audit-logs")
      .then((res) => {
        setLogs(res.data.logs ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.actorId && log.actorId.toLowerCase().includes(term)) ||
      (log.targetId && log.targetId.toLowerCase().includes(term)) ||
      (log.ip && log.ip.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted) flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            Security & Audit
          </p>
          <h1 className="font-display text-4xl leading-tight">Audit Logs.</h1>
          <p className="text-sm text-(--muted)">
            Real-time security trail for privileged actions
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--muted)" />
          <input
            type="text"
            placeholder="Search by action, actor, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-(--fg)/[0.02] border border-(--fg)/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Logs Table List */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-(--muted) font-semibold">
              <span className="col-span-3">Action</span>
              <span className="col-span-3">Actor / IP</span>
              <span className="col-span-4">Change Summary</span>
              <span className="col-span-2 text-right">Timestamp</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-(--fg)/[0.01] rounded-2xl border border-dashed border-(--fg)/10 text-center gap-2">
                <Activity className="h-8 w-8 text-(--muted)" />
                <p className="text-sm font-medium">No audit logs found</p>
                <p className="text-xs text-(--muted)">Try adjusting your search query</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  className={`grid grid-cols-12 gap-4 items-center rounded-xl border px-5 py-3.5 text-sm cursor-pointer transition-all hover:bg-(--fg)/[0.03] ${
                    selectedLog?.id === log.id
                      ? "bg-red-500/[0.03] border-red-500/20"
                      : "bg-(--fg)/[0.01] border-(--fg)/5"
                  }`}
                >
                  {/* Action Badge */}
                  <span className="col-span-3">
                    <span className={`text-[11px] font-medium rounded-full px-2.5 py-0.5 inline-block ${
                      log.action.includes("UPGRADE") ? "bg-emerald-500/10 text-emerald-600" :
                      log.action.includes("CHANGE") ? "bg-blue-500/10 text-blue-600" :
                      log.action.includes("REJECT") ? "bg-red-500/10 text-red-600" :
                      "bg-(--fg)/5 text-(--fg)/60"
                    }`}>
                      {log.action}
                    </span>
                  </span>

                  {/* Actor & IP */}
                  <span className="col-span-3 flex flex-col gap-0.5 truncate">
                    <span className="font-medium text-xs truncate" title={log.actorId}>{log.actorId}</span>
                    <span className="text-[10px] text-(--muted)">IP: {log.ip || "System"}</span>
                  </span>

                  {/* Old / New Value Cast */}
                  <span className="col-span-4 flex items-center gap-2 truncate">
                    {log.oldValue && log.newValue ? (
                      <>
                        <span className="text-xs bg-(--fg)/5 px-2 py-0.5 rounded text-(--muted)">{log.oldValue}</span>
                        <ArrowRight className="h-3 w-3 text-(--muted) flex-shrink-0" />
                        <span className="text-xs bg-red-500/10 text-red-600 px-2 py-0.5 rounded font-medium">{log.newValue}</span>
                      </>
                    ) : (
                      <span className="text-xs text-(--muted) italic truncate">
                        {log.endpoint || "System Task Execution"}
                      </span>
                    )}
                  </span>

                  {/* Timestamp */}
                  <span className="col-span-2 text-right text-xs text-(--muted) font-mono">
                    {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Details Sidebar panel */}
          {selectedLog && (
            <div className="w-full lg:w-96 bg-(--fg)/[0.01] border border-(--fg)/10 rounded-2xl p-6 flex flex-col gap-6 h-fit shrink-0 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-lg">Log Entry Details</h3>
                <p className="text-xs text-(--muted) font-mono break-all">ID: {selectedLog.id}</p>
              </div>

              <div className="h-px bg-(--fg)/10" />

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="uppercase text-[9px] tracking-wider text-(--muted) font-semibold">Action Trigger</span>
                  <span className="font-medium">{selectedLog.action}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="uppercase text-[9px] tracking-wider text-(--muted) font-semibold">Actor (Issuer)</span>
                  <span className="font-mono break-all">{selectedLog.actorId}</span>
                </div>

                {selectedLog.targetId && (
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-[9px] tracking-wider text-(--muted) font-semibold">Target affected</span>
                    <span className="font-mono break-all">{selectedLog.targetId}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-[9px] tracking-wider text-(--muted) font-semibold">IP Address</span>
                    <span className="font-mono">{selectedLog.ip || "Local System"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="uppercase text-[9px] tracking-wider text-(--muted) font-semibold">API Endpoint</span>
                    <span className="truncate" title={selectedLog.endpoint || "N/A"}>{selectedLog.endpoint || "System"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="uppercase text-[9px] tracking-wider text-(--muted) font-semibold">Created At</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-(--muted)" />
                    {formatDate(selectedLog.createdAt)}
                  </span>
                </div>

                {selectedLog.metadata && (
                  <div className="flex flex-col gap-2">
                    <span className="uppercase text-[9px] tracking-wider text-(--muted) font-semibold">Context Metadata</span>
                    <pre className="bg-(--fg)/5 p-3 rounded-lg overflow-x-auto text-[10px] font-mono text-(--muted) leading-relaxed">
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
