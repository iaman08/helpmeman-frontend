import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center & Frequently Asked Questions (FAQs)",
  description:
    "Find answers to all questions about HelpMeMan: 1-on-1 mentorship bookings, Ruth AI scheduling, mentor verification, payments, session recordings, and refunds.",
  alternates: {
    canonical: "https://helpmeman.com/help",
  },
  openGraph: {
    title: "Help Center & FAQs | HelpMeMan",
    description:
      "Everything you need to know about booking sessions, mentor onboarding, pricing, and platform safety on HelpMeMan.",
    url: "https://helpmeman.com/help",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HelpMeMan Help Center & FAQs",
    description: "Instant answers to booking, billing, and mentorship questions.",
    images: ["/og-image.png"],
  },
};

const jsonLdHelpFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is HelpMeMan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HelpMeMan is an AI-powered 1:1 mentorship platform connecting ambitious learners with verified mentors from leading colleges (IIT, AIIMS), top tech firms (Google, Meta), YC startups, and diverse professional fields.",
      },
    },
    {
      "@type": "Question",
      name: "How do I sign up as a student / mentee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Click Sign Up on the homepage, create your account, and complete brief onboarding to share your goals. You can then browse verified mentors and book sessions instantly.",
      },
    },
    {
      "@type": "Question",
      name: "How does the mentor onboarding and verification process work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mentors apply via Ruth AI conversation. Applications are reviewed within 2-3 business days, followed by credential verification (Government ID, Student ID, or Employee ID). Once verified, the mentor profile goes live within 24 hours.",
      },
    },
    {
      "@type": "Question",
      name: "Is HelpMeMan free for students?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Browsing mentors, reading verified reviews, and checking schedules is completely free. Students pay only for the individual sessions they choose to book, with zero subscription fees.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a typical mentorship session last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Standard mentorship sessions run 10-15 minutes or longer depending on the mentor's program, focused on actionable advice and strategic guidance.",
      },
    },
    {
      "@type": "Question",
      name: "Can mentors choose their own schedule and availability?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, mentors have 100% flexibility. Ruth AI helps mentors manage availability through natural language, ensuring sessions are booked only when the mentor is free with no minimum commitments.",
      },
    },
  ],
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHelpFaq) }}
      />
      {children}
    </>
  );
}
