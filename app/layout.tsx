import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmModal";
import { AIChatWidget } from "@/components/AIChatWidget";
import { PushPermissionPrompt } from "@/components/PushPermissionPrompt";
import GoogleAuthOverlay from "@/components/GoogleAuthOverlay";
import { LoaderProvider } from "@/components/LoaderContext";
import { CurrencyProvider } from "@/lib/currency-context";

import { PublicThemeManager } from "@/components/PublicThemeManager";

import { SocketProvider } from "@/lib/socket-context";
import { PlatformReviewTrigger } from "@/components/PlatformReviewTrigger";
import { TawkToScript } from "@/components/TawkToScript";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const mSaans = localFont({
  src: [
    {
      path: "./fonts/MSaans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/MSaans-SemiBold.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/MSaans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/MSaans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/MSaans-Bold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/MSaans-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://helpmeman.com"),
  title: {
    default: "HelpMeMan — Elite 1-on-1 Mentorship & Career Guidance",
    template: "%s | HelpMeMan",
  },
  description:
    "Access the world's Elite 1%. Connect with verified mentors from Google, Meta, YC, AIIMS, and IIT (AIR 1) for 1-on-1 mock interviews, career roadmaps, and guidance.",
  applicationName: "HelpMeMan",
  authors: [{ name: "HelpMeMan Team", url: "https://helpmeman.com" }],
  creator: "HelpMeMan",
  publisher: "HelpMeMan",
  keywords: [
    "Mentorship",
    "HelpMeMan",
    "1-on-1 Mentorship",
    "JEE Mentors",
    "NEET Mentors",
    "IIT Mentors",
    "FAANG Interview Prep",
    "Software Engineer Mentorship",
    "Tech Mock Interview",
    "Resume Roast",
    "ATS Resume Optimizer",
    "Competitive Programming Coaching",
    "Ruth AI",
    "Career Guidance",
    "Elite Mentors",
  ],
  alternates: {
    canonical: "https://helpmeman.com",
    languages: {
      "en-US": "https://helpmeman.com",
      "en-IN": "https://helpmeman.com",
    },
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "HelpMeMan — Elite 1-on-1 Mentorship",
    description:
      "Access the world's Elite 1%. Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) who have actually walked your path.",
    url: "https://helpmeman.com",
    siteName: "HelpMeMan",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HelpMeMan — Real Mentorship from the Elite 1%",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HelpMeMan — Elite 1-on-1 Mentorship",
    description:
      "Access the world's Elite 1%. Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) who have actually walked your path.",
    site: "@helpmeman",
    creator: "@helpmeman",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HelpMeMan",
  url: "https://helpmeman.com",
  logo: "https://helpmeman.com/logo.png",
  description:
    "HelpMeMan connects ambitious learners with verified mentors from Google, Meta, YC, and IIT (AIR 1) for 1-on-1 career guidance, mock interviews, and technical preparation.",
  sameAs: [
    "https://twitter.com/helpmeman",
    "https://linkedin.com/company/helpmeman",
    "https://github.com/helpmeman",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://helpmeman.com/help",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HelpMeMan",
  url: "https://helpmeman.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://helpmeman.com/mentors?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${mSaans.variable} antialiased selection:bg-white selection:text-black`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="font-sans bg-bg text-fg overflow-x-hidden">
        <ThemeProvider>
          <LoaderProvider>
            <PublicThemeManager />
            <AuthProvider>
              <CurrencyProvider>
                <GoogleAuthOverlay />
                <ToastProvider>
                  <ConfirmProvider>
                    <SocketProvider>
                      {children}
                      <AIChatWidget />
                      <PushPermissionPrompt />
                      <PlatformReviewTrigger />
                      <TawkToScript />
                      <CookieConsentBanner />
                    </SocketProvider>
                  </ConfirmProvider>
                </ToastProvider>
              </CurrencyProvider>
            </AuthProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

