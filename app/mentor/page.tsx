"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, DollarSign, Star, Users, TrendingUp, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { useGoogleCalendarStatus } from "@/lib/hooks";
import { useToast } from "@/components/Toast";


interface MentorStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  avgRating: number;
  totalReviews: number;
}

interface UpcomingBooking {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  user: { name: string };
}

import { PriceDisplay } from "@/components/PriceDisplay";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function MentorOverviewPage() {
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [bookings, setBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: calStatus, mutate: mutateStatus } = useGoogleCalendarStatus();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/mentor/me/stats"),
      api.get("/mentor/me/bookings?status=CONFIRMED&limit=5"),
    ])
      .then(([statsRes, bookingsRes]) => {
        setStats(statsRes.data);
        setBookings(bookingsRes.data.bookings ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleInstantConnect() {
    setConnecting(true);
    try {
      const { data } = await api.get("/google/oauth/url");
      window.location.href = data.url;
    } catch {
      toast("Failed to start Google authorization. Please try again.", "error");
      setConnecting(false);
    }
  }

  const calendarConnected = calStatus?.connected ?? false;

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Google Calendar Warning Banner ─── */}
      {!calendarConnected && !loading && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="font-bold text-base text-amber-800">Action Required: Connect Google Calendar</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                 Mentees cannot receive auto-scheduled Google Meet links for your sessions until you connect. Please link your Google Calendar now.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstantConnect}
            disabled={connecting}
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-amber-600/10 shrink-0 disabled:opacity-50"
          >
            {connecting ? "Connecting…" : "Connect Calendar Now"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
          Mentor Dashboard
        </p>
        <h1 className="font-display text-4xl leading-tight">Your overview.</h1>
      </div>


      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: stats?.totalBookings, icon: CalendarCheck, format: (v: number) => String(v) },
          { label: "Total Earnings", value: stats?.totalEarnings, icon: DollarSign, format: () => "" },
          { label: "Avg Rating", value: stats?.avgRating, icon: Star, format: (v: number) => v > 0 ? v.toFixed(1) : "New" },
          { label: "Reviews", value: stats?.totalReviews, icon: Users, format: (v: number) => String(v) },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-(--fg)/[0.02] p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-(--muted)">
              <card.icon className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em]">{card.label}</span>
            </div>
            <span className="font-display text-3xl">
              {loading ? (
                <Skeleton className="h-9 w-16" />
              ) : card.label === "Total Earnings" ? (
                <PriceDisplay amountInPaise={card.value ?? 0} />
              ) : (
                card.format(card.value ?? 0)
              )}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Upcoming Sessions ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">Upcoming Sessions</h2>
          <Link href="/mentor/bookings" className="text-xs text-(--muted) hover:text-(--fg) flex items-center gap-1">
            View all <TrendingUp className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : bookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/mentor/bookings`}
                className="flex items-center justify-between rounded-xl bg-(--fg)/[0.02] hover:bg-(--fg)/5 p-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--fg)/8 text-xs font-medium shrink-0">
                    {b.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{b.user?.name ?? "Student"}</span>
                    <span className="text-xs text-(--muted)">
                      {formatDate(b.scheduledAt)} at {formatTime(b.scheduledAt)} · {b.durationMinutes} min
                    </span>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-(--fg)/[0.02] p-8 text-center">
            <p className="text-sm text-(--muted)">No upcoming sessions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
