import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Review HelpMeMan's transparent refund, cancellation, and rescheduling guidelines for students and mentors.",
  alternates: {
    canonical: "https://helpmeman.com/refund-policy",
  },
  openGraph: {
    title: "Refund & Cancellation Policy | HelpMeMan",
    description: "Clear and fair refund guidelines for HelpMeMan users.",
    url: "https://helpmeman.com/refund-policy",
  },
};

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
