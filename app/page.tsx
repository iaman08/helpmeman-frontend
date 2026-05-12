"use client";

import { PageWrapper } from "@/components/PageWrapper";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { FeaturedMentors } from "@/components/sections/FeaturedMentors";
import { About } from "@/components/sections/About";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) return null; // Avoid flashing the landing page

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[1400px]">
        <PageWrapper id="hero">
          <Hero />
        </PageWrapper>
        <PageWrapper id="mentors">
          <FeaturedMentors />
        </PageWrapper>
        <PageWrapper id="about">
          <About />
        </PageWrapper>
        <PageWrapper id="how">
          <HowItWorks />
        </PageWrapper>
        <PageWrapper id="pricing" last>
          <Pricing />
        </PageWrapper>
      </div>
    </main>
  );
}
