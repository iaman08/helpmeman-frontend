import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "HelpMeMan — Real Mentorship",
  description:
    "Access the world's Elite 1%. Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) who have actually walked your path.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfairDisplay.variable} antialiased selection:bg-white selection:text-black`}
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

