import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/Toast";
import { AIChatWidget } from "@/components/AIChatWidget";
import { PushPermissionPrompt } from "@/components/PushPermissionPrompt";
import GoogleAuthOverlay from "@/components/GoogleAuthOverlay";
import { LoaderProvider } from "@/components/LoaderContext";
import { CurrencyProvider } from "@/lib/currency-context";

import { PublicThemeManager } from "@/components/PublicThemeManager";

import { SocketProvider } from "@/lib/socket-context";
import { PlatformReviewTrigger } from "@/components/PlatformReviewTrigger";
import { TawkToScript } from "@/components/TawkToScript";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://helpmeman.com"),
  title: "HelpMeMan — Real Mentorship",
  description:
    "Access the world's Elite 1%. Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) who have actually walked your path.",
  keywords: [
    "Mentorship",
    "HelpMeMan",
    "JEE Mentors",
    "NEET Mentors",
    "FAANG Interview Prep",
    "Ruth AI",
    "1-on-1 Mentorship",
  ],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "HelpMeMan — Real Mentorship",
    description:
      "Access the world's Elite 1%. Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) who have actually walked your path.",
    url: "https://helpmeman.com",
    siteName: "HelpMeMan",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HelpMeMan Real Mentorship",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HelpMeMan — Real Mentorship",
    description:
      "Access the world's Elite 1%. Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) who have actually walked your path.",
    images: ["/og-image.png"],
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
      className={`${plusJakarta.variable} antialiased selection:bg-white selection:text-black`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-sans bg-bg text-fg overflow-x-hidden">
        <ThemeProvider>
          <LoaderProvider>
            <PublicThemeManager />
            <AuthProvider>
              <CurrencyProvider>
                <GoogleAuthOverlay />
                <ToastProvider>
                  <SocketProvider>
                    {children}
                    <AIChatWidget />
                    <PushPermissionPrompt />
                    <PlatformReviewTrigger />
                    <TawkToScript />
                  </SocketProvider>
                </ToastProvider>
              </CurrencyProvider>
            </AuthProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

