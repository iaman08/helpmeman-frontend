"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, RotateCcw, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface CaptchaData {
  captchaId: string;
  svg: string;
  expiresAt: number;
}

interface CaptchaWidgetProps {
  onChange: (payload: { captchaId: string; captchaAnswer: string; notRequired?: boolean }) => void;
  refreshTrigger?: number;
  className?: string;
  disabled?: boolean;
}

export default function CaptchaWidget({
  onChange,
  refreshTrigger,
  className = "",
  disabled = false,
}: CaptchaWidgetProps) {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notRequired, setNotRequired] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAnswer("");
      const res = await api.get<CaptchaData>("/auth/captcha");
      setCaptchaData(res.data);
      setNotRequired(false);
      onChange({ captchaId: res.data.captchaId, captchaAnswer: "", notRequired: false });
    } catch (err: any) {
      console.error("[CAPTCHA] Failed to load challenge:", err);
      if (err?.response?.status === 404) {
        // Backend does not have /auth/captcha deployed yet or captcha is disabled
        setNotRequired(true);
        onChange({ captchaId: "", captchaAnswer: "", notRequired: true });
        return;
      }
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.error ||
        "Failed to load verification code. Click refresh.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  // Initial load
  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  // Refresh when parent signals failed submission
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchCaptcha();
    }
  }, [refreshTrigger, fetchCaptcha]);

  const handleAnswerChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    setAnswer(clean);
    if (captchaData) {
      onChange({ captchaId: captchaData.captchaId, captchaAnswer: clean, notRequired: false });
    }
  };

  if (notRequired) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-1.5 select-none ${className}`}>
      <div className="flex items-center justify-between px-0.5">
        <label
          htmlFor="captcha-answer-input"
          className="text-xs font-semibold flex items-center gap-1.5"
          style={{ color: "var(--fg)" }}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Security Verification</span>
        </label>
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
          Bot Protection
        </span>
      </div>

      <div
        className="flex items-center gap-2 p-1.5 rounded-2xl transition-all"
        style={{
          border: "1px solid var(--hairline)",
          background: "color-mix(in srgb, var(--fg) 2%, transparent)",
        }}
      >
        {/* Captcha Image Display */}
        <div
          className="relative flex items-center justify-center rounded-xl px-2 py-1 min-w-[130px] h-10 overflow-hidden shrink-0"
          style={{
            background: "color-mix(in srgb, var(--fg) 6%, transparent)",
            border: "1px solid var(--hairline)",
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          ) : captchaData?.svg ? (
            <div
              className="text-[var(--fg)] opacity-90 select-none pointer-events-none"
              dangerouslySetInnerHTML={{ __html: captchaData.svg }}
            />
          ) : (
            <button
              type="button"
              onClick={fetchCaptcha}
              className="text-[10px] text-amber-500 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={loading || disabled}
          title="Get new verification code"
          className="p-2 rounded-xl border border-[var(--hairline)] hover:bg-[var(--fg)]/5 text-[var(--muted)] hover:text-[var(--fg)] transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* Answer Input */}
        <div className="relative flex-1 min-w-0">
          <input
            id="captcha-answer-input"
            type="text"
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={disabled || loading}
            maxLength={4}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Code"
            className="w-full text-center text-sm font-mono font-bold tracking-[0.25em] uppercase px-2 py-2 rounded-xl border border-[var(--hairline)] transition-all outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30"
            style={{
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-red-500 px-1 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
