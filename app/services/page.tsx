"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { FooterSection } from "@/components/landing/FooterSection";
import AuthModal from "@/components/AuthModal";
import "../landing.css";

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authParam = searchParams.get("auth");

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: "signin" | "signup" | "mentor-signup";
  }>({
    isOpen: false,
    mode: "signin",
  });

  useEffect(() => {
    if (authParam === "mentor-signup") {
      router.replace("/apply-mentor");
    } else if (authParam === "signin" || authParam === "signup") {
      setAuthModal({
        isOpen: true,
        mode: authParam,
      });
    } else {
      setAuthModal((prev) => ({ ...prev, isOpen: false }));
    }
  }, [authParam, router]);

  const handleCloseModal = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
    router.replace("/services", { scroll: false });
  };

  return (
    <div className="landing-page" style={{ background: "#0B0B0C" }}>
      <LandingNavbar />

      <div
        className="relative z-10 rounded-b-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] border-b border-[var(--hairline)] overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <ServicesSection />
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

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesPageContent />
    </Suspense>
  );
}
