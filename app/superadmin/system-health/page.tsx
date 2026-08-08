"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { Activity, Server, Database, Cloud, RefreshCw } from "lucide-react";

interface HealthData {
  status: string;
  uptime: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  services: {
    database: string;
    supabase: string;
  };
  timestamp: string;
}

export default function SuperAdminSystemHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/super-admin/system-health");
      setData(res.data);
      setLastRefreshed(new Date());
    } catch {
      try {
        const res = await api.get("/health");
        setData({
          status: res.data.status || 'OK',
          uptime: res.data.uptime || 0,
          services: {
            database: res.data.database || 'UNKNOWN',
            supabase: res.data.supabase || 'UNKNOWN'
          },
          timestamp: res.data.timestamp || new Date().toISOString()
        });
        setLastRefreshed(new Date());
      } catch {
        setError("Failed to fetch system health status.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "N/A";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / (3600 * 24));
    const hrs = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  const StatusIndicator = ({ status }: { status: string }) => {
    const isOk = status === 'OK' || status === 'up' || status === 'healthy';
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${isOk ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className={`text-sm font-semibold ${isOk ? 'text-emerald-500' : 'text-red-500'}`}>
          {isOk ? 'Healthy' : 'Issues Detected'}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>System Health.</h1>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 3%, transparent)",
              color: "var(--fg)",
            }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-500 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="flex items-center gap-3" style={{ color: "var(--fg)" }}>
              <Activity className="h-5 w-5" />
              <h3 className="font-semibold text-sm">API Server</h3>
            </div>
            {loading && !data ? <Skeleton className="h-6 w-24" /> : <StatusIndicator status={data?.status || 'UNKNOWN'} />}
          </div>

          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="flex items-center gap-3" style={{ color: "var(--fg)" }}>
              <Database className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Database</h3>
            </div>
            {loading && !data ? <Skeleton className="h-6 w-24" /> : <StatusIndicator status={data?.services?.database || 'UNKNOWN'} />}
          </div>

          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="flex items-center gap-3" style={{ color: "var(--fg)" }}>
              <Cloud className="h-5 w-5" />
              <h3 className="font-semibold text-sm">Supabase</h3>
            </div>
            {loading && !data ? <Skeleton className="h-6 w-24" /> : <StatusIndicator status={data?.services?.supabase || 'UNKNOWN'} />}
          </div>
          
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl p-6 flex flex-col gap-6" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: "1px solid var(--hairline)" }}>
              <Server className="h-5 w-5" style={{ color: "var(--fg)" }} />
              <h2 className="font-display text-xl" style={{ color: "var(--fg)" }}>Server Metrics</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Uptime</span>
                <span className="text-sm font-semibold font-mono" style={{ color: "var(--fg)" }}>
                  {loading && !data ? <Skeleton className="h-5 w-20" /> : formatUptime(data?.uptime)}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Memory (RSS)</span>
                <span className="text-sm font-semibold font-mono" style={{ color: "var(--fg)" }}>
                  {loading && !data ? <Skeleton className="h-5 w-20" /> : formatBytes(data?.memoryUsage?.rss)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Heap Used</span>
                <span className="text-sm font-semibold font-mono" style={{ color: "var(--fg)" }}>
                  {loading && !data ? <Skeleton className="h-5 w-20" /> : formatBytes(data?.memoryUsage?.heapUsed)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Last Updated</span>
                <span className="text-sm font-semibold font-mono" style={{ color: "var(--fg)" }}>
                  {loading && !data ? <Skeleton className="h-5 w-20" /> : lastRefreshed.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
