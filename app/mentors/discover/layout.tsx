import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Mentors — Instant Matching Arena",
  description:
    "Swipe and discover your ideal 1-on-1 mentor based on your career goals, dream company, and target skills. Fast, interactive mentor discovery.",
  alternates: {
    canonical: "https://helpmeman.com/mentors/discover",
  },
  openGraph: {
    title: "Discover Mentors — Instant Matching Arena | HelpMeMan",
    description:
      "Swipe and match with verified mentors from Google, Meta, YC, and IIT in seconds.",
    url: "https://helpmeman.com/mentors/discover",
    images: ["/og-image.png"],
  },
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
