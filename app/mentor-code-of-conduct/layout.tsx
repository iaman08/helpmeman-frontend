import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Code of Conduct",
  description:
    "Professional ethical standards and mentorship guidelines expected of all verified mentors on HelpMeMan.",
  alternates: {
    canonical: "https://helpmeman.com/mentor-code-of-conduct",
  },
  openGraph: {
    title: "Mentor Code of Conduct | HelpMeMan",
    description: "Ethical standards and professionalism rules for verified mentors.",
    url: "https://helpmeman.com/mentor-code-of-conduct",
  },
};

export default function MentorCodeOfConductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
