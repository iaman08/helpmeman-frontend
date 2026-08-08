"use client";

import React from "react";
import { Settings2, ShieldAlert } from "lucide-react";

export default function SuperAdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-[var()]">Super Admin</p>
        <h1 className="font-display text-4xl leading-tight">Settings.</h1>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4">
        <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
        <div>
          <h3 className="text-amber-500 font-medium">Read-Only View</h3>
          <p className="text-sm mt-1 text-[var()]">
            Settings management will be available in a future release. Currently displaying environment configuration.
          </p>
        </div>
      </div>

      <div className="bg-[var()]/[0.02] border border-[var()] rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var()]">
          <Settings2 className="h-5 w-5 text-[var()]" />
          <h2 className="font-display text-xl">Platform Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var()]">Environment</span>
            <span className="text-sm font-medium">{process.env.NODE_ENV || "development"}</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var()]">API URL</span>
            <span className="text-sm font-medium font-mono truncate">
              {process.env.NEXT_PUBLIC_API_URL || "Not configured"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var()]">Supabase URL</span>
            <span className="text-sm font-medium font-mono truncate">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var()]">Platform Version</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
