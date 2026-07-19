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
    if (act.includes('CREATE') || act.includes('APPROVE')) return 'bg-emerald-500/10 text-emerald-500';
    if (act.includes('DELETE') || act.includes('REJECT') || act.includes('DISABLE')) return 'bg-red-500/10 text-red-500';
    if (act.includes('UPDATE') || act.includes('CHANGE')) return 'bg-blue-500/10 text-blue-500';
    return 'bg-(--fg)/10 text-(--fg)';
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Super Admin</p>
        <h1 className="font-display text-4xl leading-tight">Audit Logs.</h1>
      </div>

      <div className="flex justify-end mb-2">
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="bg-(--fg)/5 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--fg)/20"
        >
          <option value="All">All Actions</option>
          <option value="USER_ROLE_CHANGE">Role Changes</option>
          <option value="MENTOR_APPROVED">Mentor Approvals</option>
          <option value="MENTOR_REJECTED">Mentor Rejections</option>
          <option value="ADMIN_CREATED">Admin Created</option>
          <option value="ADMIN_DELETED">Admin Deleted</option>
          <option value="SETTINGS_UPDATED">Settings Updated</option>
        </select>
      </div>

      <div className="bg-(--fg)/[0.02] rounded-2xl overflow-hidden border border-(--hairline)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-(--muted) bg-(--fg)/5">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Actor</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--hairline)">
              {loading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-(--muted)">
                    <Activity className="h-8 w-8 text-(--muted) mx-auto mb-3 opacity-50" />
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className="hover:bg-(--fg)/5 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <td className="px-6 py-4 text-xs text-(--muted) whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short', timeStyle: 'medium'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-(--fg)">{log.actor?.name || 'System'}</span>
                          <span className="text-[10px] text-(--muted)">{log.actor?.email || ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-md ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-(--muted) truncate max-w-[200px]">
                        {log.target || '-'}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-(--fg)/[0.01]">
                        <td colSpan={4} className="px-6 py-4 border-l-4 border-(--fg)/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {log.oldValue && log.newValue && (
                              <div className="md:col-span-2 flex items-start gap-4 p-3 bg-(--bg) rounded-lg border border-(--hairline)">
                                <div className="flex-1">
                                  <div className="text-(--muted) mb-1 uppercase tracking-wider text-[10px]">Previous Value</div>
                                  <pre className="font-mono text-red-500/80 overflow-auto whitespace-pre-wrap">{JSON.stringify(log.oldValue, null, 2)}</pre>
                                </div>
                                <div className="text-(--muted) mt-4">→</div>
                                <div className="flex-1">
                                  <div className="text-(--muted) mb-1 uppercase tracking-wider text-[10px]">New Value</div>
                                  <pre className="font-mono text-emerald-500/80 overflow-auto whitespace-pre-wrap">{JSON.stringify(log.newValue, null, 2)}</pre>
                                </div>
                              </div>
                            )}
                            {(log.ipAddress || log.userAgent) && (
                              <div className="md:col-span-2 flex gap-4 text-(--muted)">
                                {log.ipAddress && <div><span className="uppercase tracking-wider text-[10px]">IP:</span> {log.ipAddress}</div>}
                                {log.userAgent && <div className="truncate"><span className="uppercase tracking-wider text-[10px]">Client:</span> {log.userAgent}</div>}
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-(--hairline)">
            <span className="text-sm text-(--muted)">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded bg-(--fg)/5 disabled:opacity-50 hover:bg-(--fg)/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded bg-(--fg)/5 disabled:opacity-50 hover:bg-(--fg)/10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
