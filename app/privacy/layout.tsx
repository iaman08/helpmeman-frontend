import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how HelpMeMan collects, uses, protects, and handles your personal data, session logs, and authentication information.",
  alternates: {
    canonical: "https://helpmeman.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | HelpMeMan",
    description: "Privacy policy and data protection standards at HelpMeMan.",
    url: "https://helpmeman.com/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
