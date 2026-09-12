import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Terms & Agreement",
  description:
    "Official contractual terms, payout procedures, and service standards for verified mentors on the HelpMeMan platform.",
  alternates: {
    canonical: "https://helpmeman.com/mentor-terms",
  },
  openGraph: {
    title: "Mentor Terms & Agreement | HelpMeMan",
    description: "Terms governing mentor partnerships with HelpMeMan.",
    url: "https://helpmeman.com/mentor-terms",
  },
};

export default function MentorTermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
