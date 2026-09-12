import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Mentor — Join the Elite 1% & Earn on Your Schedule",
  description:
    "Monetize your expertise and guide the next generation of engineers, doctors, and founders. Set your own pricing, schedule sessions via AI, and join the Elite 1% mentor community.",
  alternates: {
    canonical: "https://helpmeman.com/become-a-mentor",
  },
  keywords: [
    "Become a Mentor",
    "Mentor Jobs",
    "Online Mentorship",
    "Monetize Expertise",
    "Engineering Mentor",
    "Medical Mentor",
    "HelpMeMan",
  ],
  openGraph: {
    title: "Become a Mentor — Join the Elite 1% | HelpMeMan",
    description:
      "Share your journey with ambitious minds. Flexible AI-powered scheduling, zero subscription fees, and complete control over your rates.",
    url: "https://helpmeman.com/become-a-mentor",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Become a Mentor | HelpMeMan",
    description:
      "Join the Elite 1% of mentors on HelpMeMan. Monetize your knowledge on your own terms.",
    images: ["/og-image.png"],
  },
};

export default function BecomeMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
