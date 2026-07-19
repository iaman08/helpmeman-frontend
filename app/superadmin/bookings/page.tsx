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
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Super Admin</p>
        <h1 className="font-display text-4xl leading-tight">Bookings.</h1>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-(--hairline)">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setStatus(tab); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              status === tab
                ? "border-(--fg) text-(--fg)"
                : "border-transparent text-(--muted) hover:text-(--fg)"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-(--fg)/[0.02] rounded-2xl overflow-hidden border border-(--hairline)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-(--muted) bg-(--fg)/5">
              <tr>
                <th className="px-6 py-4 font-medium">Session Info</th>
                <th className="px-6 py-4 font-medium">Participants</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--hairline)">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-(--muted)">No bookings found.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-(--fg)/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-(--fg)">
                          {new Date(booking.scheduledAt).toLocaleString('en-IN', {
                            dateStyle: 'medium', timeStyle: 'short'
                          })}
                        </span>
                        <span className="text-xs text-(--muted)">{booking.durationMinutes} mins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-(--muted)">Student: <span className="text-(--fg) font-medium">{booking.user?.name}</span></span>
                        <span className="text-(--muted)">Mentor: <span className="text-(--fg) font-medium">{booking.mentor?.user?.name}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={booking.paymentStatus} />
                        <span className="text-xs font-medium"><PriceDisplay amountInPaise={booking.amount} /></span>
                      </div>
                    </td>
                  </tr>
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
