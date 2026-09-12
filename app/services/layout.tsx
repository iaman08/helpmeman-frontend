import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1-on-1 Mentorship Services, Mock Interviews & Roadmaps",
  description:
    "Accelerate your career with 1-on-1 mentorship, FAANG mock interviews, resume roasting, strategic career roadmaps, and competitive coding coaching.",
  alternates: {
    canonical: "https://helpmeman.com/services",
  },
  openGraph: {
    title: "1-on-1 Mentorship Services & Programs | HelpMeMan",
    description:
      "Explore 1:1 sessions, FAANG mock interviews, resume roasting, and personalized roadmap services with the world's Elite 1%.",
    url: "https://helpmeman.com/services",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "1-on-1 Mentorship Services | HelpMeMan",
    description:
      "Get personalized 1-on-1 guidance, mock interviews, and career roadmaps from industry leaders.",
    images: ["/og-image.png"],
  },
};

const jsonLdServices = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Career Mentorship and Technical Interview Preparation",
  provider: {
    "@type": "Organization",
    name: "HelpMeMan",
    url: "https://helpmeman.com",
  },
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "HelpMeMan Mentorship Programs",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "1-on-1 Elite Mentorship Sessions",
          description: "Direct 1-on-1 video consultations with verified industry leaders and exam toppers.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "FAANG Mock Interviews & Feedback",
          description: "Realistic system design and coding mock interviews with active FAANG staff engineers.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AI & Expert Resume Roasting",
          description: "In-depth bullet-point rewrites and ATS optimization to pass top-tier recruiter screens.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Competitive Programming Coaching",
          description: "Algorithms, dynamic programming, and contest strategies coached by high-rated CP mentors.",
        },
      },
    ],
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdServices) }}
      />
      {children}
    </>
  );
}
