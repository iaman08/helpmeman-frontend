"use client";

import React, { useState, useEffect } from "react";
import { X, Check, DollarSign, Sparkles, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { PriceDisplay } from "@/components/PriceDisplay";
import type { Mentor } from "@/lib/types";

interface Props {
  isOpen: boolean;
  mentor: Mentor | null;
  onClose: () => void;
  onSuccess: (updatedMentor: Mentor) => void;
}

const PRESET_PRICES = [0, 299, 499, 799, 999, 1499];

export function EditMentorPriceModal({
  isOpen,
  mentor,
  onClose,
  onSuccess,
}: Props) {
  const [priceInRupees, setPriceInRupees] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mentor) {
      // In database, pricePerSession is in paise (e.g. 49900 paise = 499 rupees)
      const currentRupees =
        mentor.pricePerSession != null
          ? mentor.pricePerSession >= 1000
            ? Math.round(mentor.pricePerSession / 100)
            : mentor.pricePerSession
          : 0;
      setPriceInRupees(String(currentRupees));
      setError(null);
    }
  }, [mentor, isOpen]);

  if (!isOpen || !mentor) return null;

  const displayName = mentor.displayName || mentor.user?.name || "Mentor";
  const avatarUrl = mentor.avatar || mentor.user?.avatar;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(priceInRupees);
    if (isNaN(val) || val < 0) {
      setError("Please enter a valid non-negative price.");
      return;
    }

    setSaving(true);
    try {
      let res;
      try {
        res = await api.patch(`/admin/mentors/${mentor.id}/price`, {
          priceInRupees: val,
        });
      } catch (patchErr: any) {
        if (patchErr.response?.status === 404 || patchErr.response?.status === 405) {
          try {
            res = await api.put(`/admin/mentors/${mentor.id}/price`, {
              priceInRupees: val,
            });
          } catch (putErr: any) {
            if (putErr.response?.status === 404 || putErr.response?.status === 405) {
              res = await api.post(`/admin/mentors/${mentor.id}/price`, {
                priceInRupees: val,
              });
            } else {
              throw putErr;
            }
          }
        } else {
          throw patchErr;
        }
      }
      const updated = res.data?.mentor || {
        ...mentor,
        pricePerSession: Math.round(val * 100),
      };
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.response?.status === 404
          ? "Endpoint not found (404). Please ensure the backend server has deployed the latest updates."
          : "Failed to update mentor price.");
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl p-6 sm:p-7 flex flex-col gap-6 animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--bg, #09090b)",
          borderColor: "var(--hairline, rgba(255,255,255,0.12))",
          color: "var(--fg, #ffffff)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border shadow-inner"
              style={{
                borderColor: "var(--hairline, rgba(255,255,255,0.12))",
                background: "color-mix(in srgb, var(--fg) 8%, transparent)",
              }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold font-display leading-tight">
                Edit Mentor Price
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5 truncate max-w-[220px]">
                {displayName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-full hover:bg-[var(--fg)]/10 text-[var(--muted)] hover:text-[var(--fg)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Price Banner */}
        <div
          className="p-4 rounded-xl flex items-center justify-between border"
          style={{
            background: "color-mix(in srgb, var(--fg) 2%, transparent)",
            borderColor: "var(--hairline, rgba(255,255,255,0.08))",
          }}
        >
          <span className="text-xs font-medium text-[var(--muted)]">
            Current Session Price:
          </span>
          <span className="font-semibold text-sm">
            <PriceDisplay amountInPaise={mentor.pricePerSession} />
            <span className="text-[11px] text-[var(--muted)] font-normal ml-1">
              / {mentor.sessionDuration || 30} mins
            </span>
          </span>
        </div>

        {/* Price Input Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              New Price (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-[var(--muted)]">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="499"
                value={priceInRupees}
                onChange={(e) => setPriceInRupees(e.target.value)}
                autoFocus
                disabled={saving}
                className="w-full rounded-xl pl-9 pr-4 py-3 text-lg font-bold outline-none border focus:border-amber-500 transition-all font-mono"
                style={{
                  background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                  borderColor: "var(--hairline, rgba(255,255,255,0.15))",
                  color: "var(--fg)",
                }}
              />
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Will be set as the fee per {mentor.sessionDuration || 30}-minute session. Enter 0 for Free.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRICES.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPriceInRupees(String(amt))}
                  disabled={saving}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    priceInRupees === String(amt)
                      ? "bg-amber-500 text-black border-amber-500 shadow-md font-bold"
                      : "bg-[var(--fg)]/5 hover:bg-[var(--fg)]/10 text-[var(--fg)] border-[var(--hairline)]"
                  }`}
                >
                  {amt === 0 ? "Free (₹0)" : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold border hover:bg-[var(--fg)]/5 transition-colors cursor-pointer disabled:opacity-50"
              style={{
                borderColor: "var(--hairline)",
                color: "var(--fg)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Update Price</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
