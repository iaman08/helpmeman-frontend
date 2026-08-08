"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  paymentStatus: string;
  amount: number;
  user: { name: string; email: string };
  mentor: { user: { name: string } };
}

export default function SuperAdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [status, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/bookings`, {
        params: {
          status: status !== "All" ? status : undefined,
          page,
          limit: 20
        }
      });
      setBookings(res.data.bookings || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const TABS = ["All", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Bookings.</h1>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-2" style={{ borderBottom: "1px solid var(--hairline)" }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setStatus(tab); setPage(1); }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              status === tab
                ? "border-red-500 text-red-500"
                : "border-transparent"
            }`}
            style={{ color: status === tab ? undefined : "var(--muted)" }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--muted)" }} className="text-xs uppercase tracking-wider font-medium">
                <th className="px-6 py-4">Session Info</th>
                <th className="px-6 py-4">Participants</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>No bookings found.</td>
                </tr>
              ) : (
                bookings.map((booking, idx) => (
                  <tr key={booking.id} className="transition-colors" style={{ borderBottom: idx < bookings.length - 1 ? "1px solid var(--hairline)" : "none" }}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold" style={{ color: "var(--fg)" }}>
                          {new Date(booking.scheduledAt).toLocaleString('en-IN', {
                            dateStyle: 'medium', timeStyle: 'short'
                          })}
                        </span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{booking.durationMinutes} mins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs gap-0.5">
                        <span style={{ color: "var(--muted)" }}>Student: <span className="font-semibold" style={{ color: "var(--fg)" }}>{booking.user?.name}</span></span>
                        <span style={{ color: "var(--muted)" }}>Mentor: <span className="font-semibold" style={{ color: "var(--fg)" }}>{booking.mentor?.user?.name}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={booking.paymentStatus} />
                        <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}><PriceDisplay amountInPaise={booking.amount} /></span>
                      </div>
                    </td>
                  </tr>
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
