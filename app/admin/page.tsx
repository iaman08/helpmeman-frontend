"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, DollarSign, UserCheck, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import Link from "next/link";

interface DashboardData {
  totalUsers: number;
  totalMentors: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  recentBookings: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    user: { name: string };
    mentor: { displayName: string };
  }>;
}

function formatPrice(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users, format: String },
    { label: "Total Mentors", value: data?.totalMentors ?? 0, icon: Users, format: String },
    { label: "Total Bookings", value: data?.totalBookings ?? 0, icon: CalendarCheck, format: String },
    { label: "Platform Revenue", value: data?.totalRevenue ?? 0, icon: DollarSign, format: formatPrice },
    { label: "Pending Approvals", value: data?.pendingApprovals ?? 0, icon: UserCheck, format: String, highlight: true },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Admin</p>
        <h1 className="font-display text-4xl leading-tight">Platform overview.</h1>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 flex flex-col gap-2 ${
            s.highlight && (data?.pendingApprovals ?? 0) > 0
              ? "bg-amber-500/10"
              : "bg-(--fg)/[0.02]"
          }`}>
            <div className="flex items-center gap-2 text-(--muted)">
              <s.icon className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.18em]">{s.label}</span>
            </div>
            <span className="font-display text-2xl">
              {loading ? <Skeleton className="h-8 w-12" /> : s.format(s.value)}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Quick Links ─── */}
      {(data?.pendingApprovals ?? 0) > 0 && (
        <Link
          href="/admin/approvals"
          className="flex items-center justify-between rounded-xl bg-amber-500/10 hover:bg-amber-500/15 p-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">
              {data!.pendingApprovals} mentor{data!.pendingApprovals !== 1 ? "s" : ""} waiting for approval
            </span>
          </div>
          <TrendingUp className="h-4 w-4 text-amber-600" />
        </Link>
      )}

      {/* ─── Recent Bookings ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-xs text-(--muted) hover:text-(--fg)">View all →</Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : data?.recentBookings && data.recentBookings.length > 0 ? (
          <div className="flex flex-col gap-2">
            {data.recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-(--fg)/[0.02] px-5 py-3 text-sm">
                <span className="font-medium">{b.user?.name}</span>
                <span className="text-(--muted)">→ {b.mentor?.displayName}</span>
                <span className="text-(--muted)">{formatDate(b.scheduledAt)}</span>
                <span className={`text-xs rounded-full px-2.5 py-0.5 ${
                  b.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-600" :
                  b.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                  "bg-(--fg)/5 text-(--fg)/60"
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-(--muted)">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
