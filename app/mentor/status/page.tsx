"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function MentorStatusPage() {
  const { mentor } = useAuth();

  const status = mentor?.approvalStatus ?? "PENDING";

  const config = {
    PENDING: {
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      bg: "bg-amber-500/10",
      title: "Application under review.",
      description:
        "Your mentor application has been submitted and is currently being reviewed by our team. This usually takes 24–48 hours. We'll notify you via email once a decision is made.",
      cta: { label: "Go Home", href: "/" },
    },
    APPROVED: {
      icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
      bg: "bg-emerald-500/10",
      title: "You're approved!",
      description:
        "Congratulations! Your mentor profile is live. Set up your availability and start accepting sessions.",
      cta: { label: "Go to Dashboard", href: "/mentor" },
    },
    REJECTED: {
      icon: <XCircle className="h-8 w-8 text-red-500" />,
      bg: "bg-red-500/10",
      title: "Application not approved.",
      description:
        "Unfortunately your mentor application was not approved at this time. If you believe this was a mistake, please contact support.",
      cta: { label: "Contact Support", href: "mailto:support@helpmeman.com" },
    },
  };

  const c = config[status as keyof typeof config] ?? config.PENDING;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${c.bg}`}>
        {c.icon}
      </div>
      <h1 className="font-display text-3xl">{c.title}</h1>
      <p className="text-(--muted) max-w-md leading-relaxed">{c.description}</p>
      <Link
        href={c.cta.href}
        className="mt-2 rounded-full bg-(--accent) text-(--accent-fg) px-7 py-3 text-sm hover:opacity-90"
      >
        {c.cta.label}
      </Link>
    </main>
  );
}
