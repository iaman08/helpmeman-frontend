"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  actor: { name: string; email: string };
  target?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [action, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/audit-logs`, {
        params: {
          action: action !== "All" ? action : undefined,
          page,
          limit: 30
        }
      });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (act: string) => {
    if (act.includes('CREATE') || act.includes('APPROVE')) return 'bg-emerald-500/10 text-emerald-600';
    if (act.includes('DELETE') || act.includes('REJECT') || act.includes('DISABLE')) return 'bg-red-500/10 text-red-600';
    if (act.includes('UPDATE') || act.includes('CHANGE')) return 'bg-blue-500/10 text-blue-600';
    return 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Audit Logs.</h1>
      </div>

      <div className="flex justify-end mb-2">
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
            color: "var(--fg)",
          }}
        >
          <option value="All" style={{ background: "var(--bg)" }}>All Actions</option>
          <option value="USER_ROLE_CHANGE" style={{ background: "var(--bg)" }}>Role Changes</option>
          <option value="MENTOR_APPROVED" style={{ background: "var(--bg)" }}>Mentor Approvals</option>
          <option value="MENTOR_REJECTED" style={{ background: "var(--bg)" }}>Mentor Rejections</option>
          <option value="ADMIN_CREATED" style={{ background: "var(--bg)" }}>Admin Created</option>
          <option value="ADMIN_DELETED" style={{ background: "var(--bg)" }}>Admin Deleted</option>
          <option value="SETTINGS_UPDATED" style={{ background: "var(--bg)" }}>Settings Updated</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--muted)" }} className="text-xs uppercase tracking-wider font-medium">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>
                    <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" style={{ color: "var(--muted)" }} />
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: idx < logs.length - 1 || expandedId === log.id ? "1px solid var(--hairline)" : "none" }}
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      onMouseEnter={(el) => (el.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                      onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-6 py-4 text-xs font-mono whitespace-nowrap" style={{ color: "var(--muted)" }}>
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short', timeStyle: 'medium'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{log.actor?.name || 'System'}</span>
                          <span className="text-[10px]" style={{ color: "var(--muted)" }}>{log.actor?.email || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium truncate max-w-[200px]" style={{ color: "var(--muted)" }}>
                        {log.target || '-'}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr style={{ background: "color-mix(in srgb, var(--fg) 2%, transparent)", borderBottom: "1px solid var(--hairline)" }}>
                        <td colSpan={4} className="px-6 py-4 border-l-4 border-violet-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {log.oldValue && log.newValue && (
                              <div className="md:col-span-2 flex items-start gap-4 p-3 rounded-lg" style={{ border: "1px solid var(--hairline)", background: "var(--bg)" }}>
                                <div className="flex-1">
                                  <div className="mb-1 uppercase tracking-wider text-[10px] font-semibold" style={{ color: "var(--muted)" }}>Previous Value</div>
                                  <pre className="font-mono text-red-500/80 overflow-auto whitespace-pre-wrap">{JSON.stringify(log.oldValue, null, 2)}</pre>
                                </div>
                                <div className="mt-4" style={{ color: "var(--muted)" }}>→</div>
                                <div className="flex-1">
                                  <div className="mb-1 uppercase tracking-wider text-[10px] font-semibold" style={{ color: "var(--muted)" }}>New Value</div>
                                  <pre className="font-mono text-emerald-500/80 overflow-auto whitespace-pre-wrap">{JSON.stringify(log.newValue, null, 2)}</pre>
                                </div>
                              </div>
                            )}
                            {(log.ipAddress || log.userAgent) && (
                              <div className="md:col-span-2 flex gap-4 text-xs" style={{ color: "var(--muted)" }}>
                                {log.ipAddress && <div><span className="uppercase tracking-wider text-[10px] font-semibold">IP:</span> {log.ipAddress}</div>}
                                {log.userAgent && <div className="truncate"><span className="uppercase tracking-wider text-[10px] font-semibold">Client:</span> {log.userAgent}</div>}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--hairline)" }}>
            <span className="text-sm" style={{ color: "var(--muted)" }}>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
