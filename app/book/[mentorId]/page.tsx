"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, CreditCard, Star } from "lucide-react";
import { useMentor } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { InstitutionBadge } from "@/components/InstitutionBadge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { AxiosError } from "axios";
import { PriceDisplay } from "@/components/PriceDisplay";
import { useCurrency } from "@/lib/currency-context";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

// formatPrice is replaced by PriceDisplay component

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 20; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 20) slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
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

function formatDayShort(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short" });
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
      });

      const { booking: bookingData, order, razorpayKeyId } = res.data;

      if (!order || !razorpayKeyId || !window.Razorpay) {
        // If Razorpay isn't configured, simulate direct success
        router.push(`/dashboard/bookings/${bookingData.id}`);
        return;
      }

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
      <div className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-(--bg)/70">
          <nav className="mx-auto flex max-w-[1000px] items-center justify-between px-6 sm:px-10 py-5">
            <Link href="/" className="font-display text-2xl tracking-tight">
              HelpMeMan<span className="text-(--muted)">.</span>
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-28 pb-16">
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
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="Mentor not found"
          description="This mentor may no longer be available."
          action={
            <Link
              href="/mentors"
              className="rounded-full bg-(--accent) text-(--accent-fg) px-6 py-3 text-sm"
            >
              Browse mentors
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-(--bg)/70">
        <nav className="mx-auto flex max-w-[1000px] items-center justify-between px-6 sm:px-10 py-5">
          <Link href="/" className="font-display text-2xl tracking-tight">
            HelpMeMan<span className="text-(--muted)">.</span>
          </Link>
          <Link
            href={`/mentors/${mentorId}`}
            className="text-sm text-(--fg)/80 hover:text-(--fg) transition-colors"
          >
            ← Back to profile
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-28 pb-16">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
            Book a session
          </p>
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-tight">
            {mentor.displayName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <InstitutionBadge
              institutionName={mentor.institutionName}
              institutionType={mentor.institutionType}
            />
            <span className="text-sm text-(--muted)">
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
              <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-4">
                <Calendar className="h-3.5 w-3.5 inline mr-2" />
                Select a date
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const isSelected =
                    selectedDate?.toDateString() === day.toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }}
                      className={`flex flex-col items-center gap-1 rounded-xl py-3 text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-(--accent) text-(--accent-fg)"
                          : "bg-(--fg)/[0.02] hover:bg-(--fg)/5"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-70">
                        {formatDayShort(day)}
                      </span>
                      <span className="font-medium">
                        {formatDateShort(day)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time picker */}
            {selectedDate && (
              <div>
                <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted) mb-4">
                  <Clock className="h-3.5 w-3.5 inline mr-2" />
                  Select a time
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg py-2.5 text-sm transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-(--accent) text-(--accent-fg)"
                            : "bg-(--fg)/[0.02] hover:bg-(--fg)/5"
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

          {/* ─── Right: Summary ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 rounded-2xl bg-(--fg)/[0.02] p-6 flex flex-col gap-5">
              <h2 className="text-xs uppercase tracking-[0.22em] text-(--muted)">
                <CreditCard className="h-3.5 w-3.5 inline mr-2" />
                Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--muted)">Mentor</span>
                  <span className="font-medium">{mentor.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted)">Duration</span>
                  <span>{mentor.sessionDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted)">Date</span>
                  <span>
                    {selectedDate
                      ? formatDateShort(selectedDate)
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted)">Time</span>
                  <span>{selectedTime ?? "Not selected"}</span>
                </div>
              </div>

              <div
                aria-hidden
                className="h-px w-full"
                style={{ background: "var(--hairline)" }}
              />

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-(--muted)">Total</span>
                <span className="font-display text-2xl">
                  <PriceDisplay amountInPaise={mentor.pricePerSession} />
                </span>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleBook}
                disabled={!selectedDate || !selectedTime || booking}
                className="w-full rounded-full bg-(--accent) text-(--accent-fg) py-3.5 text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {booking ? "Processing…" : "Pay & Book"}
              </button>

              <p className="text-[11px] text-(--muted) text-center leading-relaxed">
                Secure payment via Razorpay. You&rsquo;ll receive a Google Meet
                link upon confirmation.
              </p>

              <p className="text-[11px] text-(--muted) text-center leading-relaxed">
                By proceeding with the payment, the user agrees to the{" "}
                <Link href="/refund-policy" className="text-[#2563EB] hover:underline font-medium">
                  Refund & Cancellation Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
