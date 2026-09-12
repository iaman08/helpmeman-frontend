import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse 1,000+ Verified Mentors — FAANG, IIT (AIR 1) & Doctors",
  description:
    "Discover and book 1-on-1 sessions with verified mentors from Google, Meta, YC, AIIMS, and IIT. Personalized career guidance, mock interviews, and competitive exam prep.",
  alternates: {
    canonical: "https://helpmeman.com/mentors",
  },
  openGraph: {
    title: "Browse 1,000+ Verified Mentors — FAANG, IIT & Top 1% | HelpMeMan",
    description:
      "Connect with verified mentors from Google, Meta, YC, AIIMS, and IIT (AIR 1) for 1-on-1 personalized mentorship.",
    url: "https://helpmeman.com/mentors",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse 1,000+ Verified Mentors | HelpMeMan",
    description:
      "Book 1-on-1 sessions with the world's Elite 1% mentors from FAANG, IIT, and top medical institutes.",
    images: ["/og-image.png"],
  },
};

const jsonLdMentors = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Verified Mentors Directory",
  description:
    "Directory of vetted 1-on-1 mentors across Software Engineering, IIT-JEE, Medical/NEET, Law, and Product Management.",
  url: "https://helpmeman.com/mentors",
  provider: {
    "@type": "Organization",
    name: "HelpMeMan",
    url: "https://helpmeman.com",
  },
};

export default function MentorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMentors) }}
      />
      {children}
    </>
  );
}
