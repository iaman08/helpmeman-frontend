import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Mentorship Session",
  description: "Schedule a 1-on-1 personalized mentorship session.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function BookMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
