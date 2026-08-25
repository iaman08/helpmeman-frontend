"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, DollarSign, UserCheck, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import Link from "next/link";
import { PriceDisplay } from "@/components/PriceDisplay";

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function statusStyle(status: string) {
  if (status === "CONFIRMED") return { background: "rgba(34,197,94,0.1)", color: "#16a34a" };
  if (status === "PENDING") return { background: "rgba(245,158,11,0.1)", color: "#d97706" };
  if (status === "CANCELLED") return { background: "rgba(239,68,68,0.1)", color: "#dc2626" };
  return { background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--muted)" };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Users",       value: data?.totalUsers ?? 0,       icon: Users },
    { label: "Total Mentors",     value: data?.totalMentors ?? 0,     icon: Users },
    { label: "Total Bookings",    value: data?.totalBookings ?? 0,     icon: CalendarCheck },
    { label: "Platform Revenue",  value: data?.totalRevenue ?? 0,      icon: DollarSign, isRevenue: true },
    { label: "Pending Approvals", value: data?.pendingApprovals ?? 0,  icon: UserCheck, highlight: true },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
          Admin
        </p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>
          Platform overview.
        </h1>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((s) => {
          const isPendingHighlight = s.highlight && (data?.pendingApprovals ?? 0) > 0;
          return (
            <div
              key={s.label}
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{
                border: "1px solid var(--hairline)",
                background: isPendingHighlight
                  ? "rgba(245,158,11,0.07)"
                  : "color-mix(in srgb, var(--fg) 2%, transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                <s.icon
                  className="h-4 w-4"
                  style={{ color: isPendingHighlight ? "#d97706" : "var(--muted)" }}
                />
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: isPendingHighlight ? "#d97706" : "var(--muted)" }}
                >
                  {s.label}
                </span>
              </div>
              <span className="font-display text-2xl" style={{ color: "var(--fg)" }}>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : s.isRevenue ? (
                  <PriceDisplay amountInPaise={s.value} />
                ) : (
                  s.value
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Pending approvals banner ── */}
      {(data?.pendingApprovals ?? 0) > 0 && (
        <Link
          href="/admin/approvals"
          className="flex items-center justify-between rounded-xl p-4 transition-colors"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.14)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.08)")
          }
        >
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5" style={{ color: "#d97706" }} />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm font-semibold" style={{ color: "#d97706" }}>
                {data!.pendingApprovals} mentor
                {data!.pendingApprovals !== 1 ? "s" : ""} waiting for review
              </span>
              <span className="text-xs text-amber-600/80 font-normal">
                · 24-hour review SLA active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <span>Review now</span>
            <TrendingUp className="h-4 w-4" />
          </div>
        </Link>
      )}

      {/* ── Recent Bookings ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--muted)" }}
          >
            Recent Bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-xs transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--fg)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--muted)")}
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : data?.recentBookings && data.recentBookings.length > 0 ? (
          <div className="flex flex-col" style={{ border: "1px solid var(--hairline)", borderRadius: "1rem", overflow: "hidden" }}>
            {data.recentBookings.map((b, idx) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors"
                style={{
                  borderBottom:
                    idx < data.recentBookings.length - 1
                      ? "1px solid var(--hairline)"
                      : "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "color-mix(in srgb, var(--fg) 2%, transparent)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                <span className="font-medium w-32 truncate" style={{ color: "var(--fg)" }}>
                  {b.user?.name}
                </span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  → {b.mentor?.displayName}
                </span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {formatDate(b.scheduledAt)}
                </span>
                <span
                  className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                  style={statusStyle(b.status)}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No bookings yet.
          </p>
        )}
      </div>
    </div>
  );
}
