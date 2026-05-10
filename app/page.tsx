import { PageWrapper } from "@/components/PageWrapper";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <PageWrapper id="hero">
        <Hero />
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
    </main>
  );
}
