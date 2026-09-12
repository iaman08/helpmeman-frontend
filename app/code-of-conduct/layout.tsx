import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "Our community standards ensuring respectful, ethical, and productive mentorship experiences across the HelpMeMan platform.",
  alternates: {
    canonical: "https://helpmeman.com/code-of-conduct",
  },
  openGraph: {
    title: "Code of Conduct | HelpMeMan",
    description: "Community standards and safety rules for HelpMeMan users.",
    url: "https://helpmeman.com/code-of-conduct",
  },
};

export default function CodeOfConductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
