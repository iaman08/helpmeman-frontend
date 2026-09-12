import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Competitive Programming Practice & DSA Coaching",
  description:
    "Master Data Structures, Algorithms, Dynamic Programming, and Graph Theory. Practice coding challenges with automated test cases and get 1-on-1 coaching from Codeforces Masters.",
  alternates: {
    canonical: "https://helpmeman.com/competitive-programming",
  },
  keywords: [
    "Competitive Programming",
    "DSA Practice",
    "LeetCode Solutions",
    "Codeforces Mentorship",
    "Algorithm Coaching",
    "Coding Interview Prep",
    "HelpMeMan",
  ],
  openGraph: {
    title: "Competitive Programming & DSA Coaching | HelpMeMan",
    description:
      "Level up your problem-solving skills with curated challenges, automated evaluations, and 1:1 guidance from competitive programming champions.",
    url: "https://helpmeman.com/competitive-programming",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Competitive Programming Coaching | HelpMeMan",
    description:
      "Master algorithms and pass top technical rounds with 1-on-1 competitive programming mentorship.",
    images: ["/og-image.png"],
  },
};

const jsonLdCp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HelpMeMan Competitive Programming Platform",
  url: "https://helpmeman.com/competitive-programming",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Interactive coding platform for mastering algorithms, data structures, and competitive programming with 1-on-1 mentorship.",
};

export default function CompetitiveProgrammingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCp) }}
      />
      {children}
    </>
  );
}
