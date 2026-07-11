"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

interface AdminBooking {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  amountPaid: number;
  user: { name: string; email: string };
  mentor: { displayName: string };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatPrice(p: number) { return `₹${Math.round(p / 100)}`; }

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/bookings")
      .then((res) => setBookings(res.data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Bookings</p>
        <h1 className="font-display text-4xl leading-tight">All bookings.</h1>
        <p className="text-sm text-(--muted)">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : bookings.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-(--muted)">
            <span className="col-span-2">Student</span>
            <span className="col-span-2">Mentor</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-1">Min</span>
            <span className="col-span-1">Amt</span>
            <span className="col-span-2">Status</span>
          </div>

          {bookings.map((b) => (
            <div key={b.id} className="grid grid-cols-12 gap-4 items-center rounded-xl bg-(--fg)/[0.02] px-5 py-3 text-sm">
              <span className="col-span-2 truncate">{b.user?.name}</span>
              <span className="col-span-2 truncate font-medium">{b.mentor?.displayName}</span>
              <span className="col-span-2 text-(--muted)">{formatDate(b.scheduledAt)}</span>
              <span className="col-span-1 text-(--muted)">{b.durationMinutes}</span>
              <span className="col-span-1">{formatPrice(b.amountPaid)}</span>
              <div className="col-span-2">
                <StatusBadge status={b.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<CalendarCheck className="h-6 w-6" />} title="No bookings" description="No bookings on the platform yet." />
      )}
    </div>
  );
}
