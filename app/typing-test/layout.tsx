import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Typing Speed Test & WPM Tracker",
  description:
    "Test your code typing speed on real programming languages (JavaScript, Python, C++, TypeScript, SQL). Measure Words Per Minute (WPM), accuracy, and syntax dexterity.",
  alternates: {
    canonical: "https://helpmeman.com/typing-test",
  },
  keywords: [
    "Developer Typing Test",
    "Code Typing Speed",
    "Typing Test WPM",
    "Programmer Typing Speed",
    "HelpMeMan",
  ],
  openGraph: {
    title: "Developer Typing Speed Test & WPM Tracker | HelpMeMan",
    description:
      "How fast can you type real code? Measure your programming WPM and accuracy across popular languages.",
    url: "https://helpmeman.com/typing-test",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Typing Test | HelpMeMan",
    description: "Benchmark your code typing speed and accuracy for free.",
    images: ["/og-image.png"],
  },
};

const jsonLdTyping = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HelpMeMan Developer Typing Test",
  url: "https://helpmeman.com/typing-test",
  applicationCategory: "UtilityApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Speed typing test designed specifically for software developers to practice syntax, special characters, and code typing accuracy.",
};

export default function TypingTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTyping) }}
      />
      {children}
    </>
  );
}
