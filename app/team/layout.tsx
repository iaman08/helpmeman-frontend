import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meet Our Team — The Builders of HelpMeMan",
  description:
    "Meet the passionate engineers, designers, and educators behind HelpMeMan, building the next-generation elite 1-on-1 mentorship ecosystem.",
  alternates: {
    canonical: "https://helpmeman.com/team",
  },
  openGraph: {
    title: "Meet the HelpMeMan Team | HelpMeMan",
    description:
      "The minds driving HelpMeMan's mission to make world-class mentorship accessible to everyone.",
    url: "https://helpmeman.com/team",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HelpMeMan Team",
    description: "Meet the team revolutionizing 1-on-1 mentorship.",
    images: ["/og-image.png"],
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
