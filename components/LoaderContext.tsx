"use client";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { registerApiLoader } from "@/lib/api";

// ─── Top Loader Component ─────────────────────────────────────────────────────
export function TopLoader({ progress }: { progress: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      setVisible(true);
    } else if (progress === 100) {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div 
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(to right, #3b82f6, #60a5fa)",
          boxShadow: "0 0 8px #60a5fa, 0 0 4px #3b82f6",
        }}
      />
    </div>
  );
}

// ─── Context & Provider ───────────────────────────────────────────────────────
interface LoaderContextType {
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  setProgress: (percent: number) => void;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

// Inner component that uses useSearchParams (must be inside Suspense)
function RouteChangeListener({ startLoading, stopLoading }: { startLoading: (key: string) => void; stopLoading: (key: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When route change completes, stop loader
    stopLoading("route-change");
  }, [pathname, searchParams, stopLoading]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && anchor.target !== "_blank") {
        try {
          const targetUrl = new URL(anchor.href);
          const currentUrl = new URL(window.location.href);

          if (
            targetUrl.origin === currentUrl.origin &&
            targetUrl.pathname !== currentUrl.pathname
          ) {
            startLoading("route-change");
          }
        } catch {
          // ignore malformed URLs
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [startLoading]);

  return null;
}

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgressState] = useState(0);
  const activeLoaders = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoading = useCallback((key: string) => {
    activeLoaders.current.add(key);
    if (activeLoaders.current.size === 1) {
      setProgressState(10);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgressState((prev) => {
          if (prev >= 90) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 90;
          }
          return prev + Math.floor(Math.random() * 8) + 2;
        });
      }, 250);
    }
  }, []);

  const stopLoading = useCallback((key: string) => {
    activeLoaders.current.delete(key);
    if (activeLoaders.current.size === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setProgressState(100);
      setTimeout(() => setProgressState(0), 400);
    }
  }, []);

  const setProgress = useCallback((percent: number) => {
    setProgressState(percent);
  }, []);

  // Register with Axios API interceptor
  useEffect(() => {
    registerApiLoader(
      (show) => {
        if (show) startLoading("api-request");
      },
      (show) => {
        if (show) stopLoading("api-request");
      }
    );
  }, [startLoading, stopLoading]);

  return (
    <LoaderContext.Provider value={{ startLoading, stopLoading, setProgress }}>
      <TopLoader progress={progress} />
      <Suspense fallback={null}>
        <RouteChangeListener startLoading={startLoading} stopLoading={stopLoading} />
      </Suspense>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used within a LoaderProvider");
  return ctx;
}
