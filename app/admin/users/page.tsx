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
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">Users</p>
        <h1 className="font-display text-4xl leading-tight">All users.</h1>
        <p className="text-sm text-(--muted)">{users.length} user{users.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-(--muted)">
            <span className="col-span-3">Name</span>
            <span className="col-span-4">Email</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-1">Verified</span>
            <span className="col-span-2">Joined</span>
          </div>

          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-12 gap-4 items-center rounded-xl bg-(--fg)/[0.02] px-5 py-3 text-sm">
              <span className="col-span-3 font-medium truncate">{u.name}</span>
              <span className="col-span-4 text-(--muted) truncate">{u.email}</span>
              <span className="col-span-2">
                <span className={`text-xs rounded-full px-2.5 py-0.5 ${
                  u.role === "ADMIN" ? "bg-red-500/10 text-red-600" :
                  u.role === "MENTOR" ? "bg-amber-500/10 text-amber-600" :
                  "bg-(--fg)/5 text-(--fg)/60"
                }`}>
                  {u.role}
                </span>
              </span>
              <span className="col-span-1">
                {u.isEmailVerified ? "✓" : "—"}
              </span>
              <span className="col-span-2 text-xs text-(--muted)">{formatDate(u.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
