import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placement Aptitude Test & Quantitative Reasoning",
  description:
    "Prepare for campus placement drives and competitive company assessments with timed aptitude tests covering Quantitative Ability, Logical Reasoning, and Verbal Analysis.",
  alternates: {
    canonical: "https://helpmeman.com/aptitude-test",
  },
  keywords: [
    "Aptitude Test",
    "Placement Preparation",
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Campus Placements",
    "HelpMeMan",
  ],
  openGraph: {
    title: "Placement Aptitude Test & Practice Rounds | HelpMeMan",
    description:
      "Ace company aptitude tests with full-length timed question sets and instant scoring.",
    url: "https://helpmeman.com/aptitude-test",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Placement Aptitude Test | HelpMeMan",
    description:
      "Practice Quantitative and Logical Reasoning for campus placements.",
    images: ["/og-image.png"],
  },
};

const jsonLdAptitude = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HelpMeMan Placement Aptitude Test",
  url: "https://helpmeman.com/aptitude-test",
  applicationCategory: "EducationalApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Comprehensive aptitude testing simulator with instant analysis for campus placements and technical job assessments.",
};

export default function AptitudeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAptitude) }}
      />
      {children}
    </>
  );
}
