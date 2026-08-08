"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatCurrency } from "@/lib/currency-context";

interface AdminBooking {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  amountPaid: number;
  currency: string;
  user: { name: string; email: string };
  mentor: { displayName: string };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(p: number, currency = "INR") {
  return formatCurrency(p, currency);
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/bookings")
      .then((res) => setBookings(res.data.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1.5">
        <p
          className="text-xs uppercase tracking-[0.22em]"
          style={{ color: "var(--muted)" }}
        >
          Bookings
        </p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>
          All bookings.
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                {["Student", "Mentor", "Date", "Min", "Amount", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 pr-6 text-[10px] uppercase tracking-[0.22em] font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, idx) => (
                <tr
                  key={b.id}
                  className="transition-colors"
                  style={{
                    borderBottom:
                      idx < bookings.length - 1 ? "1px solid var(--hairline)" : "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "color-mix(in srgb, var(--fg) 2%, transparent)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="py-4 pr-6 text-sm" style={{ color: "var(--fg)" }}>
                    {b.user?.name}
                  </td>
                  <td
                    className="py-4 pr-6 text-sm font-medium"
                    style={{ color: "var(--fg)" }}
                  >
                    {b.mentor?.displayName}
                  </td>
                  <td className="py-4 pr-6 text-sm" style={{ color: "var(--muted)" }}>
                    {formatDate(b.scheduledAt)}
                  </td>
                  <td className="py-4 pr-6 text-sm" style={{ color: "var(--muted)" }}>
                    {b.durationMinutes}
                  </td>
                  <td className="py-4 pr-6 text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {formatPrice(b.amountPaid, b.currency)}
                  </td>
                  <td className="py-4">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<CalendarCheck className="h-6 w-6" />}
          title="No bookings"
          description="No bookings on the platform yet."
        />
      )}
    </div>
  );
}
