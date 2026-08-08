"use client";

import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { PriceDisplay } from "@/components/PriceDisplay";

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
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Earnings</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Platform earnings.</h1>
      </div>

      <div className="rounded-2xl p-5 flex flex-col gap-2 max-w-xs" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        <span className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>Total Revenue</span>
        <span className="font-display text-3xl" style={{ color: "var(--fg)" }}>{loading ? <Skeleton className="h-9 w-20" /> : <PriceDisplay amountInPaise={total} />}</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : earnings.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                {["Mentor", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left py-3 pr-6 text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {earnings.map((e, idx) => (
                <tr
                  key={e.id}
                  className="transition-colors"
                  style={{ borderBottom: idx < earnings.length - 1 ? "1px solid var(--hairline)" : "none" }}
                  onMouseEnter={(el) => (el.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                  onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                >
                  <td className="py-4 pr-6 text-sm font-medium" style={{ color: "var(--fg)" }}>{e.mentor?.displayName ?? "—"}</td>
                  <td className="py-4 pr-6 text-sm font-medium" style={{ color: "var(--fg)" }}><PriceDisplay amountInPaise={e.amount} /></td>
                  <td className="py-4 pr-6 text-sm">
                    <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${e.status === "PAID" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{e.status}</span>
                  </td>
                  <td className="py-4 text-xs" style={{ color: "var(--muted)" }}>{formatDate(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={<DollarSign className="h-6 w-6" />} title="No earnings" description="Revenue data will appear as bookings complete." />
      )}
    </div>
  );
}
