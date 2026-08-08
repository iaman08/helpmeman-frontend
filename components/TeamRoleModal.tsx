"use client";

import { useRouter } from "next/navigation";
import { X, LayoutDashboard, BookOpen, GraduationCap } from "lucide-react";

interface TeamRoleModalProps {
  onClose: () => void;
}

const OPTIONS = [
  {
    id: "admin",
    icon: LayoutDashboard,
    title: "Admin Panel",
    description: "Manage mentors, users, bookings and platform settings.",
    href: "/admin",
  },
  {
    id: "mentor",
    icon: BookOpen,
    title: "Mentor Dashboard",
    description: "View your sessions, availability, and mentee messages.",
    href: "/mentor",
  },
  {
    id: "mentee",
    icon: GraduationCap,
    title: "Explore as Student",
    description: "Browse mentors and book 1-on-1 sessions.",
    href: "/dashboard",
  },
] as const;

export function TeamRoleModal({ onClose }: TeamRoleModalProps) {
  const router = useRouter();

  function handleChoice(id: string, href: string) {
    // Mark as chosen for this browser session — won't show again until next login
    sessionStorage.setItem("hmm.roleSelected", "true");
    sessionStorage.setItem("hmm.activeRole", id);
    onClose();
    if (href !== "/admin") {
      router.push(href);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sessionStorage.setItem("hmm.roleSelected", "true");
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline)",
          borderRadius: "1.5rem",
          boxShadow: "0 32px 64px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--fg), transparent)",
            opacity: 0.12,
          }}
        />

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("hmm.roleSelected", "true");
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:opacity-60"
          style={{ color: "var(--muted)" }}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pt-8 pb-7">
          {/* Header */}
          <div className="mb-6">
            <p
              className="text-xs font-medium uppercase tracking-widest mb-1"
              style={{ color: "var(--muted)" }}
            >
              Welcome back
            </p>
            <h2
              className="text-xl font-semibold leading-snug"
              style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}
            >
              Where would you like to go?
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Your account has access to multiple areas of HelpMeMan.
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {OPTIONS.map(({ id, icon: Icon, title, description, href }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleChoice(id, href)}
                className="group w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-150"
                style={{
                  border: "1px solid var(--hairline)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "color-mix(in srgb, var(--fg) 4%, transparent)";
                  e.currentTarget.style.borderColor =
                    "color-mix(in srgb, var(--fg) 20%, transparent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--hairline)";
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg mt-0.5"
                  style={{
                    background: "color-mix(in srgb, var(--fg) 6%, transparent)",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--fg)" }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--fg)" }}
                  >
                    {title}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-center mt-5" style={{ color: "var(--muted)" }}>
            You can switch at any time from the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
