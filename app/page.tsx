"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FloatingStatsSection } from "@/components/landing/FloatingStatsSection";
import { FloatingLogosSection } from "@/components/landing/FloatingLogosSection";
import { AIDemoSection } from "@/components/landing/AIDemoSection";
import { FeaturedMentorsSection } from "@/components/landing/FeaturedMentorsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { SuccessStoriesSection } from "@/components/landing/SuccessStoriesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { FooterSection } from "@/components/landing/FooterSection";
import AuthModal from "@/components/AuthModal";

import "./landing.css";

function LandingPageContent() {
  const { user, mentor, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authParam = searchParams.get("auth");

  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "signin" | "signup" }>({
    isOpen: false,
    mode: "signin",
  });

  // Detect if a token exists in localStorage so we can show a skeleton
  // instead of the landing page while auth hydrates (avoids the ~5s flash).
  const hasStoredToken =
    typeof window !== "undefined" && !!localStorage.getItem("helpmeman.accessToken");

  useEffect(() => {
    if (authParam === "signin" || authParam === "signup") {
      setAuthModal({
        isOpen: true,
        mode: authParam,
      });
    } else {
      setAuthModal((prev) => ({ ...prev, isOpen: false }));
    }
  }, [authParam]);

  const handleCloseModal = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
    // Remove query param from URL
    router.replace("/", { scroll: false });
  };

  // On Mobile & Tablet (< 1024px), authenticated users bypass the landing page
  // and are redirected directly to their dashboard. On Desktop (>= 1024px), they view the landing page.
  useEffect(() => {
    const checkMobileRedirect = () => {
      if (!loading && user && typeof window !== "undefined" && window.innerWidth < 1024) {
        let dest = "/dashboard";
        if (user.role === "SUPER_ADMIN") dest = "/superadmin";
        else if (user.role === "ADMIN") dest = "/admin";
        else if (user.role === "MENTOR" && mentor) {
          dest = mentor.approvalStatus === "APPROVED" ? "/mentor" : "/mentor/status";
        } else if (user.onboardingRole === "MENTEE") dest = "/dashboard";
        else dest = "/onboarding";
        router.replace(dest);
      }
    };

    checkMobileRedirect();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobileRedirect);
      return () => window.removeEventListener("resize", checkMobileRedirect);
    }
  }, [user, mentor, loading, router]);

  // Show a skeleton screen while auth is hydrating and we know the user is logged in.
  // The middleware handles the actual redirect; this just prevents the landing page flash.
  if (loading && hasStoredToken) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          background: "#0B0B0C",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Animated logo pulse */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            animation: "hmm-spin 1.1s cubic-bezier(0.4,0,0.6,1) infinite",
            boxShadow: "0 0 0 0 rgba(99,102,241,0.4)",
          }}
        />
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 14,
            fontFamily: "var(--font-inter, sans-serif)",
            letterSpacing: "0.02em",
            margin: 0,
          }}
        >
          Loading your dashboard…
        </p>
        <style>{`
          @keyframes hmm-spin {
            0%   { transform: scale(1);   opacity: 1; }
            50%  { transform: scale(0.7); opacity: 0.5; }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{ background: '#0B0B0C' }}>
      <LandingNavbar />
      <div className="relative z-10 rounded-b-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border-b border-[var(--hairline)] overflow-hidden" style={{ background: 'var(--bg)' }}>
        <HeroSection />
        <FloatingStatsSection />
        <AIDemoSection />
        <FeaturedMentorsSection />
        <TestimonialsSection />
        <SuccessStoriesSection />
        <PricingSection />
        <FloatingLogosSection />
        <FinalCTASection />
      </div>
      <div className="sticky bottom-0 z-0">
        <FooterSection />
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseModal}
        initialMode={authModal.mode}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <LandingPageContent />
    </Suspense>
  );
}
