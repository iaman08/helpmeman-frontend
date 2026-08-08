"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap, CalendarCheck, DollarSign, ShieldCheck, UserCheck, Activity } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import Link from "next/link";
import { PriceDisplay } from "@/components/PriceDisplay";

interface AuditLog {
  id: string;
  action: string;
  actor: { name: string; email: string };
  createdAt: string;
  target?: string;
}

interface SuperAdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalAdmins: number;
  totalBookings: number;
  platformRevenue: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  recentActivities: AuditLog[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/dashboard-stats")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users, format: String },
    { label: "Students", value: data?.totalStudents ?? 0, icon: Users, format: String },
    { label: "Mentors", value: data?.totalMentors ?? 0, icon: GraduationCap, format: String },
    { label: "Admins", value: data?.totalAdmins ?? 0, icon: ShieldCheck, format: String },
    { label: "Total Bookings", value: data?.totalBookings ?? 0, icon: CalendarCheck, format: String },
    { label: "Platform Revenue", value: data?.platformRevenue ?? 0, icon: DollarSign, isCurrency: true },
    { label: "Monthly Revenue", value: data?.monthlyRevenue ?? 0, icon: DollarSign, isCurrency: true },
    { label: "Pending Approvals", value: data?.pendingApprovals ?? 0, icon: UserCheck, format: String, highlight: true },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Platform overview.</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, idx) => {
          const isPendingHighlight = s.highlight && (data?.pendingApprovals ?? 0) > 0;
          return (
            <div
              key={`${s.label}-${idx}`}
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{
                border: "1px solid var(--hairline)",
                background: isPendingHighlight
                  ? "rgba(245,158,11,0.07)"
                  : "color-mix(in srgb, var(--fg) 2%, transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4" style={{ color: isPendingHighlight ? "#d97706" : "var(--muted)" }} />
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: isPendingHighlight ? "#d97706" : "var(--muted)" }}>
                  {s.label}
                </span>
              </div>
              <span className="font-display text-2xl" style={{ color: "var(--fg)" }}>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : s.isCurrency ? (
                  <PriceDisplay amountInPaise={s.value} />
                ) : (
                  s.format ? s.format(s.value) : s.value
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {(data?.pendingApprovals ?? 0) > 0 && (
          <Link
            href="/superadmin/mentors"
            className="flex-1 flex items-center justify-between rounded-xl p-4 transition-colors"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">
                {data!.pendingApprovals} pending mentor approval{data!.pendingApprovals !== 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        )}
        <Link
          href="/superadmin/admin-management"
          className="flex-1 flex items-center justify-between rounded-xl p-4 transition-colors"
          style={{
            border: "1px solid var(--hairline)",
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
          }}
        >
          <div className="flex items-center gap-3" style={{ color: "var(--fg)" }}>
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Manage Administrators</span>
          </div>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Recent Activities</h2>
          <Link href="/superadmin/audit-logs" className="text-xs transition-colors" style={{ color: "var(--muted)" }}>View all →</Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : data?.recentActivities && data.recentActivities.length > 0 ? (
          <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)" }}>
            {data.recentActivities.map((log, idx) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 text-sm gap-2"
                style={{
                  borderBottom: idx < data.recentActivities.length - 1 ? "1px solid var(--hairline)" : "none",
                  background: "color-mix(in srgb, var(--fg) 1%, transparent)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium" style={{ color: "var(--fg)" }}>{log.actor.name}</span>
                  <span className="text-xs rounded-full px-2 py-0.5" style={{ background: "color-mix(in srgb, var(--fg) 6%, transparent)", color: "var(--fg)" }}>
                    {log.action}
                  </span>
                  {log.target && <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--muted)" }}>{log.target}</span>}
                </div>
                <span className="text-xs shrink-0 font-mono" style={{ color: "var(--muted)" }}>{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-8 text-center" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
            <Activity className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--muted)" }} />
            <p className="text-sm" style={{ color: "var(--muted)" }}>No recent activities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
