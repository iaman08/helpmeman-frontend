"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, CreditCard, Star, Tag, X, CheckCircle2, Sparkles } from "lucide-react";
import { useMentor } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { AxiosError } from "axios";
import { PriceDisplay } from "@/components/PriceDisplay";
import { useCurrency } from "@/lib/currency-context";
import { FooterSection } from "@/components/landing/FooterSection";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function getNext7Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function generateTimeSlots(): string[] {
  return [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  ];
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function BookMentorPage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const { data, isLoading } = useMentor(mentorId);
  const mentor = data?.mentor;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    description?: string;
    discountAmount: number; // in paise
    finalAmount: number;    // in paise
    isFree: boolean;
  } | null>(null);

  const days = getNext7Days();
  const timeSlots = generateTimeSlots();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/signin?redirect=/book/${mentorId}`);
    }
  }, [authLoading, user, router, mentorId]);

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function handleApplyCoupon(codeToApply?: string) {
    const code = (codeToApply ?? couponInput).trim().toUpperCase();
    if (!code || !mentor) return;
    setCouponError("");
    setCouponLoading(true);

    try {
      const res = await api.post("/coupons/validate", {
        code,
        mentorId: mentor.id,
        durationMinutes: mentor.sessionDuration,
      });

      if (res.data.valid) {
        setAppliedCoupon({
          code: res.data.coupon.code,
          discountType: res.data.coupon.discountType,
          discountValue: res.data.coupon.discountValue,
          description: res.data.coupon.description,
          discountAmount: res.data.discountAmount,
          finalAmount: res.data.finalAmount,
          isFree: res.data.isFree,
        });
        setCouponInput("");
        setCouponError("");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setCouponError(err.response?.data?.error ?? "Invalid coupon code.");
      } else {
        setCouponError("Failed to apply coupon.");
      }
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
  }

  async function handleBook() {
    if (!selectedDate || !selectedTime || !mentor || booking) return;
    setError("");
    setBooking(true);

    // Build scheduled datetime
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    try {
      const res = await api.post("/bookings", {
        mentorId: mentor.id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: mentor.sessionDuration,
        currency,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      const { booking: bookingData, order, razorpayKeyId, isFree } = res.data;

      // ── Zero-Amount / Free Coupon Booking Success ──
      if (isFree || !order || !razorpayKeyId || !window.Razorpay) {
        router.push(`/dashboard/bookings/${bookingData.id}`);
        return;
      }

      // ── Paid Razorpay Checkout ──
      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "HelpMeMan",
        description: `Session with ${mentor.displayName}`,
        order_id: order.id,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            await api.post(`/bookings/${bookingData.id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            router.push(`/dashboard/bookings/${bookingData.id}`);
          } catch {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#0a0a0a" },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. Your booking is still pending.");
            setBooking(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "Booking failed.");
      } else {
        setError("Something went wrong.");
      }
      setBooking(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="landing-page min-h-screen flex flex-col" style={{ background: "#0B0B0C" }}>
        <div className="relative z-10 flex-1 rounded-b-[40px] md:rounded-b-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border-b border-[var(--hairline)] overflow-hidden flex flex-col bg-[var(--bg)] text-[var(--fg)]">
          <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--hairline)]">
            <nav className="mx-auto flex max-w-[1000px] items-center justify-between px-6 sm:px-10 py-5">
              <Link href="/" className="font-bold text-xl tracking-tight text-[var(--fg)] flex items-center gap-2 select-none">
                <img src="/logo.svg" alt="HelpMeMan Logo" className="w-6 h-6 object-contain" />
                <span>HelpMeMan</span>
              </Link>
            </nav>
          </header>
          <main className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-28 pb-16 w-full">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <Skeleton className="h-80 w-full rounded-2xl" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            </div>
          </main>
        </div>
        <div className="sticky bottom-0 z-0">
          <FooterSection />
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="landing-page min-h-screen flex flex-col" style={{ background: "#0B0B0C" }}>
        <div className="relative z-10 flex-1 rounded-b-[40px] md:rounded-b-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border-b border-[var(--hairline)] overflow-hidden flex flex-col bg-[var(--bg)] text-[var(--fg)] items-center justify-center p-6">
          <EmptyState
            title="Mentor not found"
            description="This mentor may no longer be available."
            action={
              <Link
                href="/mentors"
                className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 text-sm font-semibold"
              >
                Browse mentors
              </Link>
            }
          />
        </div>
        <div className="sticky bottom-0 z-0">
          <FooterSection />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen flex flex-col" style={{ background: "#0B0B0C" }}>
      <div className="relative z-10 flex-1 rounded-b-[40px] md:rounded-b-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border-b border-[var(--hairline)] overflow-hidden flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--hairline)]">
          <nav className="mx-auto flex max-w-[1000px] items-center justify-between px-6 sm:px-10 py-5">
            <Link href="/" className="font-bold text-xl tracking-tight text-[var(--fg)] flex items-center gap-2 select-none">
              <img src="/logo.svg" alt="HelpMeMan Logo" className="w-6 h-6 object-contain" />
              <span>HelpMeMan</span>
            </Link>
            <Link
              href={`/mentors/${mentorId}`}
              className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              ← Back to profile
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-28 pb-16 w-full">
          <div className="flex flex-col gap-2 mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] font-semibold">
              Book a session
            </p>
            <h1 className="font-bold text-3xl sm:text-4xl text-[var(--fg)] tracking-tight">
              {mentor.displayName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <InstitutionBadge
                institutionName={mentor.institutionName}
                institutionType={mentor.institutionType}
              />
              <span className="text-sm text-[var(--muted)]">
                <PriceDisplay amountInPaise={mentor.pricePerSession} /> / {mentor.sessionDuration}{" "}
                min
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ─── Left: Date & Time Picker ─── */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Date picker */}
              <div>
                <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Select a date
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {days.map((day) => {
                    const isSelected =
                      selectedDate?.toDateString() === day.toDateString();
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={`flex flex-col items-center rounded-2xl py-3 px-2 text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md font-semibold scale-[1.02]"
                            : "bg-[var(--bg)] border-[var(--hairline)] hover:border-zinc-400 text-[var(--fg)]"
                        }`}
                      >
                        <span className="text-[11px] opacity-70">
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="text-base font-bold mt-0.5">
                          {day.getDate()}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {day.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time picker */}
              {selectedDate && (
                <div>
                  <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Select a time slot
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-xl py-2.5 text-xs font-semibold transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm"
                              : "bg-[var(--bg)] border-[var(--hairline)] hover:border-zinc-400 text-[var(--fg)]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ─── Right: Summary & Coupon Checkout ─── */}
            <div className="lg:col-span-2">
              <div className="sticky top-28 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--hairline)] p-6 flex flex-col gap-5 shadow-sm">
                <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--muted)] font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  Order Summary
                </h2>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)] text-xs">Mentor</span>
                    <span className="font-semibold text-xs text-[var(--fg)]">{mentor.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)] text-xs">Duration</span>
                    <span className="text-xs text-[var(--fg)]">{mentor.sessionDuration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)] text-xs">Date</span>
                    <span className="text-xs text-[var(--fg)]">
                      {selectedDate ? formatDateShort(selectedDate) : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)] text-xs">Time</span>
                    <span className="text-xs text-[var(--fg)]">{selectedTime ?? "Not selected"}</span>
                  </div>
                </div>

                {/* ─── Coupon Code Section ─── */}
                <div className="flex flex-col gap-2 pt-3 border-t border-[var(--hairline)]">
                  <label className="text-xs font-semibold text-[var(--muted)] flex items-center justify-between">
                    <span>Have a coupon code?</span>
                    {appliedCoupon && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Applied
                      </span>
                    )}
                  </label>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="e.g. TESTFREE"
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-[var(--hairline)] focus:border-zinc-500 focus:outline-none uppercase font-mono tracking-wider text-[var(--fg)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {couponLoading ? "Applying…" : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <div className="flex items-center gap-2 text-xs">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono font-bold">{appliedCoupon.code}</span>
                        <span className="text-[11px] opacity-80">
                          ({appliedCoupon.discountType === "PERCENTAGE" ? `${appliedCoupon.discountValue}% OFF` : `FLAT OFF`})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-zinc-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Remove coupon"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-500 font-medium mt-0.5">{couponError}</p>
                  )}

                  {!appliedCoupon && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] mt-0.5">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>
                        Testing? Use code{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setCouponInput("TESTFREE");
                            handleApplyCoupon("TESTFREE");
                          }}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          TESTFREE
                        </button>{" "}
                        for 100% off.
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── Price Breakdown ─── */}
                <div className="flex flex-col gap-2 pt-3 border-t border-[var(--hairline)]">
                  <div className="flex justify-between text-xs text-[var(--muted)]">
                    <span>Session Fee</span>
                    <span><PriceDisplay amountInPaise={mentor.pricePerSession} /></span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-<PriceDisplay amountInPaise={appliedCoupon.discountAmount} /></span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-2 border-t border-[var(--hairline)]">
                    <span className="text-sm font-bold text-[var(--fg)]">Total Payable</span>
                    <span className="font-display text-2xl font-bold">
                      {appliedCoupon?.isFree ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-2">
                          <span>FREE</span>
                          <span className="text-xs font-normal text-[var(--muted)] line-through">
                            (<PriceDisplay amountInPaise={mentor.pricePerSession} />)
                          </span>
                        </span>
                      ) : (
                        <PriceDisplay amountInPaise={appliedCoupon ? appliedCoupon.finalAmount : mentor.pricePerSession} />
                      )}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* ─── Action Button ─── */}
                <button
                  type="button"
                  onClick={handleBook}
                  disabled={!selectedDate || !selectedTime || booking}
                  className={`w-full rounded-2xl py-3.5 text-sm font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md ${
                    appliedCoupon?.isFree
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900"
                  }`}
                >
                  {booking
                    ? "Confirming Session…"
                    : appliedCoupon?.isFree
                    ? "🎉 Confirm Free Booking (₹0)"
                    : "Pay & Book"}
                </button>

                <p className="text-[11px] text-[var(--muted)] text-center leading-relaxed">
                  {appliedCoupon?.isFree
                    ? "100% coupon applied. No credit card or gateway charge required."
                    : "Secure payment via Razorpay. You'll receive a Google Meet link upon confirmation."}
                </p>

                <p className="text-[11px] text-[var(--muted)] text-center leading-relaxed">
                  By proceeding, you agree to the{" "}
                  <Link href="/refund-policy" className="text-[#2563EB] hover:underline font-medium">
                    Refund &amp; Cancellation Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="sticky bottom-0 z-0">
        <FooterSection />
      </div>
    </div>
  );
}
