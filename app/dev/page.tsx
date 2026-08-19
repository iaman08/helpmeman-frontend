"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield, ArrowRight, Lock, KeyRound, Cpu, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export default function DevLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("riturdev@gmail.com");
  const [password, setPassword] = useState("Ritu@7672");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDevLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/dev/auth/login", { email, password });
      const { user, accessToken, refreshToken } = res.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("helpmeman.accessToken", accessToken);
        localStorage.setItem("helpmeman.refreshToken", refreshToken);
        const isHttps = window.location.protocol === "https:";
        const secureFlag = isHttps ? ";Secure" : "";
        document.cookie = `helpmeman.accessToken=${accessToken};path=/;max-age=31536000;SameSite=Lax${secureFlag}`;
        sessionStorage.setItem("hmm.activeRole", "dev");
      }

      router.push("/dev/dashboard");
    } catch (err: any) {
      console.error("Dev login error:", err);
      setError(err.response?.data?.error || "Developer login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 font-mono relative overflow-hidden">
      {/* Background glow & grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              HelpMeMan <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">DEV CONSOLE</span>
            </h1>
            <p className="text-xs text-slate-400">Engineering & Diagnostic Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> Node v24.15.0 | Supabase Postgres
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto py-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-1">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Developer Authentication</h2>
            <p className="text-xs text-slate-400">Access platform telemetry, system controls, and API sandbox</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleDevLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Developer Email</span>
                <span className="text-[10px] text-cyan-400/80">riturdev@gmail.com</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Default Password</span>
                <span className="text-[10px] text-cyan-400/80">Ritu@7672</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? (
                "Authenticating Dev Console..."
              ) : (
                <>
                  Enter Developer Dashboard <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Pre-filled Credentials Helper */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold text-center">Configured Credentials</p>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-slate-300">riturdev@gmail.com</span>
                <span className="text-slate-500 text-[11px]">Pass: Ritu@7672</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail("riturdev@gmail.com");
                  setPassword("Ritu@7672");
                  handleDevLogin();
                }}
                className="text-[11px] font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                1-Click Login
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900 pt-6">
        <p>© 2026 HelpMeMan Inc. Developer Portal</p>
        <p className="flex items-center gap-1 text-slate-500">
          <Lock className="h-3 w-3 text-cyan-500" /> Authorized Developer Access Only
        </p>
      </footer>
    </div>
  );
}
