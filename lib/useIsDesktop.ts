import { useState, useEffect } from "react";

/**
 * Custom hook to detect if screen width is >= 1024px (Desktop).
 * Updates dynamically on window resize.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true; // Default fallback for SSR
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Synchronize initial value after mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}
