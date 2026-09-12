import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply as a Mentor — Conversational Onboarding with Ruth AI",
  description:
    "Apply to become a verified mentor on HelpMeMan in under 5 minutes with Ruth AI. Fast review, instant credential verification, and personalized onboarding.",
  alternates: {
    canonical: "https://helpmeman.com/apply-mentor",
  },
  openGraph: {
    title: "Apply to Mentor | HelpMeMan",
    description: "Start your mentor application with Ruth AI on HelpMeMan.",
    url: "https://helpmeman.com/apply-mentor",
    images: ["/og-image.png"],
  },
};

export default function ApplyMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
