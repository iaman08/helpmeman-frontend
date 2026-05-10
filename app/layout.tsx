import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth-context";
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
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <AIChatWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
