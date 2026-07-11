"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";

/**
 * Full-screen loading overlay shown while Google OAuth authentication is in
 * progress. Renders at root layout level so it persists across navigations.
 *
 * Shown when:  googleAuthenticating === true  (set by loginWithGoogle())
 * Hidden when: the onAuthStateChange handler completes and sets it false
 *              (which also triggers the router.push to the dashboard)
 */
export default function GoogleAuthOverlay() {
  const { googleAuthenticating } = useAuth();
  const [dots, setDots] = useState(1);

  // Animated ellipsis for the loading text
  useEffect(() => {
    if (!googleAuthenticating) return;
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    return () => clearInterval(id);
  }, [googleAuthenticating]);

  return (
    <AnimatePresence>
      {googleAuthenticating && (
        <motion.div
          key="google-auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "var(--bg, #fff)" }}
        >
          {/* Subtle animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-30 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(ellipse at 30% 40%, rgba(66,133,244,0.15) 0%, transparent 60%)",
                "radial-gradient(ellipse at 70% 60%, rgba(52,168,83,0.15) 0%, transparent 60%)",
                "radial-gradient(ellipse at 30% 40%, rgba(66,133,244,0.15) 0%, transparent 60%)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-2.5"
            >
              <img src="/logo.svg" alt="HelpMeMan" className="w-9 h-9 object-contain" />
              <span className="font-bold text-2xl tracking-tight text-[var(--fg)]">HelpMeMan</span>
            </motion.div>

            {/* Google G logo with spinning ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Spinning ring */}
              <motion.div
                className="absolute -inset-3 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: "#4285F4",
                  borderRightColor: "#34A853",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              {/* Google G icon */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
            </motion.div>

            {/* Status text */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="text-center space-y-1.5"
            >
              <p className="text-[15px] font-semibold text-[var(--fg)]">
                Signing you in{".".repeat(dots)}
              </p>
              <p className="text-[12px] text-[var(--muted)]">
                Completing Google authentication
              </p>
            </motion.div>

            {/* Animated progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-48 h-1 bg-[var(--fg)]/10 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)",
                }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
