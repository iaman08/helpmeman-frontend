"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AnalyticsData {
  roles: Array<{ name: string; value: number }>;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

export default function SuperAdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super-admin/role-counts")
      .then((res) => setData({ roles: res.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Super Admin</p>
        <h1 className="font-display text-4xl leading-tight">Analytics.</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Role Distribution Chart */}
        <div className="bg-(--fg)/[0.02] border border-(--hairline) rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-sm font-medium">User Role Distribution</h2>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            ) : data?.roles && data.roles.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.roles}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.roles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--hairline)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--fg)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-(--muted)">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Future charts can go here */}
        <div className="bg-(--fg)/[0.02] border border-(--hairline) rounded-2xl p-6 flex items-center justify-center">
          <p className="text-sm text-(--muted)">More analytics coming soon...</p>
        </div>
      </div>
    </div>
  );
}
