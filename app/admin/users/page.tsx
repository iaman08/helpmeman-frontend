"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import type { User } from "@/lib/types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/users")
      .then((res) => setUsers(res.data.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>Users</p>
        <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>All users.</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{users.length} user{users.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
                {["Name", "Email", "Role", "Verified", "Joined"].map((h) => (
                  <th key={h} className="text-left py-3 pr-6 text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={u.id}
                  className="transition-colors"
                  style={{ borderBottom: idx < users.length - 1 ? "1px solid var(--hairline)" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="py-4 pr-6 text-sm font-medium" style={{ color: "var(--fg)" }}>{u.name}</td>
                  <td className="py-4 pr-6 text-sm" style={{ color: "var(--muted)" }}>{u.email}</td>
                  <td className="py-4 pr-6 text-sm">
                    <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                      u.role === "SUPER_ADMIN" ? "bg-purple-500/10 text-purple-600" :
                      u.role === "ADMIN" ? "bg-red-500/10 text-red-600" :
                      u.role === "MENTOR" ? "bg-amber-500/10 text-amber-600" :
                      "bg-gray-500/10 text-gray-500"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-sm" style={{ color: u.isEmailVerified ? "rgb(34, 197, 94)" : "var(--muted)" }}>
                    {u.isEmailVerified ? "✓" : "—"}
                  </td>
                  <td className="py-4 text-xs" style={{ color: "var(--muted)" }}>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
