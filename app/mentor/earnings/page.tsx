"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import type { Earning } from "@/lib/types";
import { PriceDisplay } from "@/components/PriceDisplay";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    api.get("/mentor/me/earnings")
      .then((res) => {
        const data = res.data.earnings ?? [];
        setEarnings(data);
        const total = data.reduce((s: number, e: Earning) => s + e.amount, 0);
        const paid = data.filter((e: Earning) => e.status === "PAID").reduce((s: number, e: Earning) => s + e.amount, 0);
        setTotals({ total, paid, pending: total - paid });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em] font-semibold" style={{ color: "var(--muted)" }}>Earnings</p>
        <h1 className="font-display text-4xl leading-tight font-extrabold" style={{ color: "var(--fg)" }}>Your revenue.</h1>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Earned", value: totals.total, color: "" },
          { label: "Paid Out", value: totals.paid, color: "text-emerald-500" },
          { label: "Pending", value: totals.pending, color: "text-amber-500" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-5 flex flex-col gap-2" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
              <DollarSign className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.18em] font-semibold">{card.label}</span>
            </div>
            <span className={`font-display text-3xl font-extrabold ${card.color}`} style={{ color: card.color ? undefined : "var(--fg)" }}>
              {loading ? <Skeleton className="h-9 w-20" /> : <PriceDisplay amountInPaise={card.value} />}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Transactions ─── */}
      <div>
        <h2 className="text-xs uppercase tracking-[0.22em] font-semibold mb-4 flex items-center" style={{ color: "var(--muted)" }}>
          <TrendingUp className="h-3.5 w-3.5 inline mr-2" />
          Transactions
        </h2>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : earnings.length > 0 ? (
          <div className="flex flex-col gap-2">
            {earnings.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl px-5 py-3" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold" style={{ color: "var(--fg)" }}><PriceDisplay amountInPaise={e.amount} /></span>
                  <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{formatDate(e.createdAt)}</span>
                </div>
                <span className={`text-xs font-semibold rounded-full px-3 py-1 ${
                  e.status === "PAID" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                }`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<DollarSign className="h-6 w-6 text-[var(--fg)]" />}
            title="No earnings yet"
            description="Complete sessions to start earning."
          />
        )}
      </div>
    </div>
  );
}
