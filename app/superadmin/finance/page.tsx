"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { PriceDisplay } from "@/components/PriceDisplay";
import { StatusBadge } from "@/components/StatusBadge";
import { Download, DollarSign } from "lucide-react";

interface Earning {
  id: string;
  mentor: { user: { name: string } };
  amount: number;
  status: string;
  createdAt: string;
}

interface FinanceData {
  totalRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  earnings: Earning[];
}

export default function SuperAdminFinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/earnings")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    if (!data?.earnings) return;
    
    const headers = ["Mentor", "Amount (Paise)", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...data.earnings.map(e => [
        `"${e.mentor?.user?.name || 'Unknown'}"`,
        e.amount,
        e.status,
        new Date(e.createdAt).toISOString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `finance_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = [
    { label: "Total Revenue", value: data?.totalRevenue ?? 0 },
    { label: "Pending Payouts", value: data?.pendingPayouts ?? 0 },
    { label: "Completed Payouts", value: data?.completedPayouts ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Super Admin</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>Finance.</h1>
          <button
            onClick={handleExport}
            disabled={loading || !data?.earnings?.length}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 3%, transparent)",
              color: "var(--fg)",
            }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 flex flex-col gap-2" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
            <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
              <DollarSign className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.18em]">{s.label}</span>
            </div>
            <span className="font-display text-2xl" style={{ color: "var(--fg)" }}>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <PriceDisplay amountInPaise={s.value} />
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--hairline)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Recent Earnings & Payouts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--muted)" }} className="text-xs uppercase tracking-wider font-medium">
                <th className="px-6 py-4">Mentor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                  </tr>
                ))
              ) : !data?.earnings || data.earnings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>No financial records found.</td>
                </tr>
              ) : (
                data.earnings.map((earning, idx) => (
                  <tr key={earning.id} className="transition-colors" style={{ borderBottom: idx < data.earnings.length - 1 ? "1px solid var(--hairline)" : "none" }}>
                    <td className="px-6 py-4 font-semibold" style={{ color: "var(--fg)" }}>
                      {earning.mentor?.user?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-semibold" style={{ color: "var(--fg)" }}>
                      <PriceDisplay amountInPaise={earning.amount} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={earning.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-mono" style={{ color: "var(--muted)" }}>
                      {new Date(earning.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
