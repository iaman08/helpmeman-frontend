import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Join HelpMeMan to access verified mentors from the Elite 1%.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
