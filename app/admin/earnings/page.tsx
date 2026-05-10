"use client";

import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

function formatPrice(p: number) { return `₹${Math.round(p / 100).toLocaleString("en-IN")}`; }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

export default function AdminEarningsPage() {
  const [earnings, setEarnings] = useState<Array<{ id: string; amount: number; status: string; createdAt: string; mentor?: { displayName: string } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/earnings").then((res) => setEarnings(res.data.earnings ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = earnings.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Earnings</p>
        <h1 className="font-display text-4xl leading-tight">Platform earnings.</h1>
      </div>

      <div className="rounded-2xl bg-(--fg)/[0.02] p-5 flex flex-col gap-2 max-w-xs">
        <span className="text-xs uppercase tracking-[0.18em] text-(--muted)">Total Revenue</span>
        <span className="font-display text-3xl">{loading ? <Skeleton className="h-9 w-20" /> : formatPrice(total)}</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : earnings.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-(--muted)">
            <span className="col-span-3">Mentor</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3">Date</span>
          </div>
          {earnings.map((e) => (
            <div key={e.id} className="grid grid-cols-12 gap-4 items-center rounded-xl bg-(--fg)/[0.02] px-5 py-3 text-sm">
              <span className="col-span-3 truncate font-medium">{e.mentor?.displayName ?? "—"}</span>
              <span className="col-span-2">{formatPrice(e.amount)}</span>
              <div className="col-span-2">
                <span className={`text-xs rounded-full px-2.5 py-0.5 ${e.status === "PAID" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{e.status}</span>
              </div>
              <span className="col-span-3 text-(--muted)">{formatDate(e.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<DollarSign className="h-6 w-6" />} title="No earnings" description="Revenue data will appear as bookings complete." />
      )}
    </div>
  );
}
