import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions governing the use of HelpMeMan, including user conduct, session bookings, payments, and platform guidelines.",
  alternates: {
    canonical: "https://helpmeman.com/terms",
  },
  openGraph: {
    title: "Terms of Service | HelpMeMan",
    description: "Terms and conditions governing the HelpMeMan platform.",
    url: "https://helpmeman.com/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
