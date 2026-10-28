"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { Toaster, toast as notify } from "sonner";
import { useTheme } from "./ThemeProvider";

type ToastType = "success" | "error" | "info";
interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

// Keep the app's existing API stable; Sonner owns timers, announcements and stacking.
const value: ToastContextValue = {
  toast(message, type = "success") {
    notify[type](message);
  },
};
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        theme={theme}
        position="bottom-right"
        visibleToasts={3}
        closeButton
        duration={4500}
        gap={10}
        offset={{ bottom: 24, right: 24 }}
        mobileOffset={{ bottom: "max(16px, env(safe-area-inset-bottom))", left: 16, right: 16 }}
        customAriaLabel="Notifications"
        style={{
          "--normal-bg": dark ? "#1a2130" : "#ffffff",
          "--normal-border": dark ? "#374256" : "#e1e3ec",
          "--normal-text": dark ? "#edf0fa" : "#25252a",
          zIndex: 100000,
        } as CSSProperties}
        toastOptions={{
          closeButtonAriaLabel: "Dismiss notification",
          style: {
            fontFamily: "var(--font-sans), sans-serif",
            borderRadius: 16,
            boxShadow: "0 16px 40px -18px rgba(0, 0, 0, .3)",
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
