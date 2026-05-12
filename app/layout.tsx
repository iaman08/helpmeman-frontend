import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/Toast";
import { AIChatWidget } from "@/components/AIChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "HelpMeMan — Mentorship from people who've done it",
  description:
    "A premium mentorship platform connecting students with verified mentors from IITs, AIIMS, NLUs, FAANG, and elite founders.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${fraunces.variable} antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <AIChatWidget />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

