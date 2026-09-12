import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Resume Roaster & ATS Score Checker",
  description:
    "Get brutal, actionable feedback on your resume. Calculate your ATS compatibility score, rewrite weak bullet points with impact metrics, and land top tech interviews.",
  alternates: {
    canonical: "https://helpmeman.com/resume-roast",
  },
  keywords: [
    "Resume Roaster",
    "ATS Resume Checker",
    "Tech Resume Review",
    "AI Resume Review",
    "Software Engineer Resume",
    "FAANG Resume",
    "HelpMeMan",
  ],
  openGraph: {
    title: "Free AI Resume Roaster & ATS Score Checker | HelpMeMan",
    description:
      "Upload your resume to get instant ATS scores, brutal roasts, and bullet point rewrites to beat recruiter screening.",
    url: "https://helpmeman.com/resume-roast",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Resume Roaster & ATS Checker | HelpMeMan",
    description:
      "Is your resume good enough for Google and Meta? Find out in 10 seconds with our AI Resume Roaster.",
    images: ["/og-image.png"],
  },
};

const jsonLdResumeRoast = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HelpMeMan AI Resume Roaster",
  url: "https://helpmeman.com/resume-roast",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Free AI-powered resume roaster and Applicant Tracking System (ATS) checker that scores tech resumes and rewrites bullet points for maximum recruiter impact.",
  browserRequirements: "Requires modern web browser with JavaScript enabled.",
};

export default function ResumeRoastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdResumeRoast) }}
      />
      {children}
    </>
  );
}
